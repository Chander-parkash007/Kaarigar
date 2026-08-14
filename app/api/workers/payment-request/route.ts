import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWorkerToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { MAX_FILE_SIZE_MB } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('worker_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyWorkerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const paymentType = formData.get('payment_type') as string
    const screenshot = formData.get('screenshot') as File | null

    // Validate required fields
    if (!paymentType || !screenshot) {
      return NextResponse.json({ error: 'Payment type and screenshot are required' }, { status: 400 })
    }

    // Validate payment type
    if (!['boost', 'verified_badge'].includes(paymentType)) {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
    }

    // Validate file type
    if (!screenshot.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Screenshot must be an image (JPEG, PNG)' }, { status: 400 })
    }

    // Validate file size
    if (screenshot.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Screenshot must be less than ${MAX_FILE_SIZE_MB}MB` }, { status: 400 })
    }

    // Get worker info
    const { data: worker } = await supabase
      .from('workers')
      .select('full_name')
      .eq('id', payload.workerId)
      .single()

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    // Check for pending payment request of same type
    const { data: existingRequest } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('worker_id', payload.workerId)
      .eq('payment_type', paymentType)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending payment request for this upgrade. Please wait for admin review.' 
      }, { status: 409 })
    }

    // Upload screenshot to Supabase Storage
    const screenshotBuffer = await screenshot.arrayBuffer()
    const screenshotExt = screenshot.type === 'image/png' ? 'png' : 'jpg'
    const screenshotPath = `payment-screenshots/${payload.workerId}/${uuidv4()}.${screenshotExt}`

    const { error: uploadError } = await supabase.storage
      .from('worker-photos')
      .upload(screenshotPath, Buffer.from(screenshotBuffer), {
        contentType: screenshot.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Screenshot upload error:', uploadError)
      return NextResponse.json({ error: 'Screenshot upload failed. Please try again.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('worker-photos').getPublicUrl(screenshotPath)
    const screenshotUrl = urlData.publicUrl

    // Create payment request
    const { error: insertError } = await supabase
      .from('payment_requests')
      .insert({
        worker_id: payload.workerId,
        payment_type: paymentType,
        screenshot_url: screenshotUrl,
        status: 'pending',
      })

    if (insertError) {
      console.error('Payment request insert error:', insertError)
      return NextResponse.json({ error: 'Failed to submit payment request. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment request submitted successfully! Admin will review within 1 hour.' 
    })
  } catch (err) {
    console.error('Payment request error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

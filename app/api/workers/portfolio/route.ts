import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWorkerToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { MAX_PORTFOLIO_PHOTOS } from '@/lib/constants'

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

    // Check current photo count
    const { count } = await supabase
      .from('portfolio_photos')
      .select('id', { count: 'exact', head: true })
      .eq('worker_id', payload.workerId)

    if ((count || 0) >= MAX_PORTFOLIO_PHOTOS) {
      return NextResponse.json({ error: `Maximum ${MAX_PORTFOLIO_PHOTOS} photos allowed` }, { status: 400 })
    }

    const formData = await req.formData()
    const photo = formData.get('photo') as File | null
    if (!photo) return NextResponse.json({ error: 'No photo provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json({ error: 'Only JPEG and PNG files are allowed' }, { status: 400 })
    }
    if (photo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 })
    }

    const ext = photo.type === 'image/png' ? 'png' : 'jpg'
    const path = `portfolio/${payload.workerId}/${uuidv4()}.${ext}`
    const buffer = await photo.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('worker-photos')
      .upload(path, Buffer.from(buffer), { contentType: photo.type })

    if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

    const { data: urlData } = supabase.storage.from('worker-photos').getPublicUrl(path)

    const { error: dbError } = await supabase
      .from('portfolio_photos')
      .insert({ worker_id: payload.workerId, photo_url: urlData.publicUrl })

    if (dbError) return NextResponse.json({ error: 'Failed to save photo' }, { status: 500 })

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

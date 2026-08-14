import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWorkerToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { CATEGORIES, CITIES } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// PATCH - Update profile text fields
export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('worker_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyWorkerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { full_name, about, area, category, city } = await req.json()

    if (!full_name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!about?.trim() || about.trim().length < 10) return NextResponse.json({ error: 'About must be at least 10 characters' }, { status: 400 })

    // Validate category
    const validCategories = CATEGORIES.map(c => c.value)
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    // Validate city/area
    if (city && !CITIES[city]) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 })
    }

    const { error } = await supabase
      .from('workers')
      .update({
        full_name: full_name.trim().substring(0, 100),
        about: about.trim().substring(0, 500),
        area,
        category,
        city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.workerId)

    if (error) {
      console.error('Worker update error:', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update profile photo
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('worker_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyWorkerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const path = `profiles/${payload.workerId}-${uuidv4()}.${ext}`
    const buffer = await photo.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('worker-photos')
      .upload(path, Buffer.from(buffer), { contentType: photo.type })

    if (uploadError) {
      console.error('Photo upload error:', uploadError)
      return NextResponse.json({ error: 'Photo upload failed. Please try again.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('worker-photos').getPublicUrl(path)

    const { error: dbError } = await supabase
      .from('workers')
      .update({
        profile_photo_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.workerId)

    if (dbError) {
      console.error('Photo DB update error:', dbError)
      return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    console.error('Photo update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWorkerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('worker_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyWorkerToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify ownership and get photo URL for storage cleanup
    const { data: photo } = await supabase
      .from('portfolio_photos')
      .select('worker_id, photo_url')
      .eq('id', id)
      .single()

    if (!photo || photo.worker_id !== payload.workerId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Delete from database
    await supabase.from('portfolio_photos').delete().eq('id', id)

    // Clean up storage file to prevent orphaned files
    try {
      const url = new URL(photo.photo_url)
      // Extract path after /object/public/worker-photos/
      const pathMatch = url.pathname.match(/\/object\/public\/worker-photos\/(.+)/)
      if (pathMatch) {
        await supabase.storage.from('worker-photos').remove([pathMatch[1]])
      }
    } catch {
      // Storage cleanup failure is non-critical — DB record is already deleted
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

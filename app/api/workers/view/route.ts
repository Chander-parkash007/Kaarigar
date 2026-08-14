import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { worker_id, session_id } = await req.json()
    if (!worker_id || !session_id) return NextResponse.json({ ok: false })

    // Insert unique view (unique constraint on worker_id + session_id prevents duplicates)
    const { error } = await supabase
      .from('profile_view_sessions')
      .insert({ worker_id, session_id })

    // If no error (new unique view), increment the counter
    if (!error) {
      await supabase.rpc('increment_profile_views', { worker_id_param: worker_id })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

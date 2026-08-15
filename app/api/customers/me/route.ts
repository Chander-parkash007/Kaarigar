import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value
    if (!token) return NextResponse.json({ customer: null })

    const payload = verifyCustomerToken(token)
    if (!payload) return NextResponse.json({ customer: null })

    const { data: customer } = await supabase
      .from('customers')
      .select('id, full_name, phone, is_email_verified, created_at')
      .eq('id', payload.customerId)
      .single()

    return NextResponse.json({ customer: customer || null })
  } catch {
    return NextResponse.json({ customer: null })
  }
}

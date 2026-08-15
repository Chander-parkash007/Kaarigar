import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function toCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h]
      const str = val === null || val === undefined ? '' : String(val)
      return `"${str.replace(/"/g, '""')}"`
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'workers'

    let csv = ''
    let filename = ''

    if (type === 'workers') {
      const { data } = await supabase
        .from('workers')
        .select('full_name, phone, category, city, area, tier, status, average_rating, review_count, profile_views, created_at')
        .order('created_at', { ascending: false })

      csv = toCSV((data || []).map(w => ({
        'Full Name': w.full_name,
        'Phone': w.phone,
        'Category': w.category,
        'City': w.city,
        'Area': w.area,
        'Tier': w.tier,
        'Status': w.status,
        'Rating': w.average_rating,
        'Reviews': w.review_count,
        'Profile Views': w.profile_views,
        'Joined': new Date(w.created_at).toLocaleDateString('en-PK'),
      })))
      filename = `kaarigar-workers-${new Date().toISOString().split('T')[0]}.csv`
    }

    if (type === 'payments') {
      const { data } = await supabase
        .from('payment_requests')
        .select('*, worker:workers(full_name, phone)')
        .order('created_at', { ascending: false })

      csv = toCSV((data || []).map((p: any) => ({
        'Worker Name': p.worker?.full_name || '',
        'Phone': p.worker?.phone || '',
        'Payment Type': p.payment_type,
        'Status': p.status,
        'Submitted': new Date(p.created_at).toLocaleDateString('en-PK'),
        'Reviewed': p.reviewed_at ? new Date(p.reviewed_at).toLocaleDateString('en-PK') : '',
        'Reviewed By': p.reviewed_by || '',
      })))
      filename = `kaarigar-payments-${new Date().toISOString().split('T')[0]}.csv`
    }

    if (type === 'bookings') {
      const { data } = await supabase
        .from('bookings')
        .select('*, worker:workers(full_name)')
        .order('created_at', { ascending: false })

      csv = toCSV((data || []).map((b: any) => ({
        'Customer Name': b.customer_name,
        'Customer Phone': b.customer_phone,
        'Service': b.service_description,
        'Preferred Date': b.preferred_date || '',
        'Status': b.status,
        'Karigar': b.worker?.full_name || '',
        'Submitted': new Date(b.created_at).toLocaleDateString('en-PK'),
      })))
      filename = `kaarigar-bookings-${new Date().toISOString().split('T')[0]}.csv`
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

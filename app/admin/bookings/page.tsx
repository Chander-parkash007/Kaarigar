import { createClient } from '@supabase/supabase-js'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminBookingsList } from '@/components/admin/AdminBookingsList'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const { status = 'pending' } = await searchParams

  let query = supabase
    .from('bookings')
    .select('*, worker:workers(id, full_name, phone, category, city)')
    .order('created_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)

  const { data: bookings } = await query

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-6">
          📋 Booking Requests
        </h1>
        <AdminBookingsList bookings={bookings || []} currentStatus={status} />
      </main>
    </div>
  )
}

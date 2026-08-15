import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { verifyCustomerToken } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomerDashboard } from '@/components/customers/CustomerDashboard'
import { VerifyEmailBanner } from '@/components/customers/VerifyEmailBanner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function CustomerPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('customer_token')?.value
  if (!token) redirect('/customer/login')

  const payload = verifyCustomerToken(token)
  if (!payload) redirect('/customer/login')

  const [customerRes, savedRes] = await Promise.all([
    supabase.from('customers').select('id, full_name, phone, created_at').eq('id', payload.customerId).single(),
    supabase.from('saved_karigars').select('worker_id, created_at, worker:workers(id, full_name, category, city, area, profile_photo_url, average_rating, review_count, tier, boost_expires_at, verified_expires_at, status)').eq('customer_id', payload.customerId).order('created_at', { ascending: false }),
  ])

  if (!customerRes.data) redirect('/customer/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const savedKarigars = (savedRes.data || []) as any[]
  const isVerified = (customerRes.data as any).is_email_verified === true

  return (
    <>
      <Navbar />
      {!isVerified && <VerifyEmailBanner customerName={customerRes.data.full_name} />}
      <main className="min-h-screen bg-[#F8F9FA]">
        <CustomerDashboard customer={customerRes.data} savedKarigars={savedKarigars} />
      </main>
      <Footer />
    </>
  )
}

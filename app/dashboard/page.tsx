import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { verifyWorkerToken } from '@/lib/auth'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('worker_token')?.value

  if (!token) redirect('/login')

  const payload = verifyWorkerToken(token)
  if (!payload) redirect('/login')

  const supabase = await createClient()
  const { data: worker, error } = await supabase
    .from('workers')
    .select('*, portfolio_photos(*)')
    .eq('id', payload.workerId)
    .eq('status', 'active')
    .single()

  if (error || !worker) redirect('/login')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA]">
        <DashboardContent worker={worker} portfolioPhotos={worker.portfolio_photos || []} />
      </main>
      <Footer />
    </>
  )
}

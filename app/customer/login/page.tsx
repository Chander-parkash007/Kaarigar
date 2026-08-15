import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CustomerAuthForm } from '@/components/customers/CustomerAuthForm'

export default function CustomerLoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <CustomerAuthForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

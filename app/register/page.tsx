import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RegisterPageContent } from '@/components/workers/RegisterPageContent'

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <RegisterPageContent />
        </div>
      </main>
      <Footer />
    </>
  )
}

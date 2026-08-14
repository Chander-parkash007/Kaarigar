import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RegisterForm } from '@/components/workers/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA] py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1B3A6B]">Join KaariGar Free</h1>
            <p className="text-gray-500 mt-2">Create your profile and start getting customers today</p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
              <span>✅ Free to join</span>
              <span>✅ No commission</span>
              <span>✅ Direct contact</span>
            </div>
          </div>
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

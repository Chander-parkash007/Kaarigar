import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoginForm } from '@/components/workers/LoginForm'

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">👷</div>
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

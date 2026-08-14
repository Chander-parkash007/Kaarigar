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
            <h1 className="text-2xl font-bold text-[#1B3A6B]">Worker Login</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your profile</p>
          </div>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  )
}

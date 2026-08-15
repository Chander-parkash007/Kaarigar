import { AdminLoginForm } from '@/components/admin/AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0f2240] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-[#FF6B00]">Kaari</span>Gar Admin
          </h1>
          <p className="text-blue-300 text-sm mt-1">Authorized access only</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}

'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/workers', label: 'Karigars', icon: '👷' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { href: '/admin/pending', label: 'Pending Payments', icon: '💰' },
  { href: '/admin/logs', label: 'Activity Log', icon: '📋' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-56 bg-[#1B3A6B] text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-white/20">
        <div className="font-bold text-lg">
          <span className="text-[#FF6B00]">Kaari</span>Gar
        </div>
        <div className="text-blue-300 text-xs mt-0.5">Admin Panel</div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}

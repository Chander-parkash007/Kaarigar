'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { UrduToggle } from '@/components/ui/UrduToggle'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false)
  const [workerLoggedIn, setWorkerLoggedIn] = useState(false)
  const pathname = usePathname()

  // Detect which session is active
  useEffect(() => {
    fetch('/api/customers/me')
      .then(r => r.json())
      .then(d => { if (d.customer) setCustomerLoggedIn(true) })
      .catch(() => {})

    // Worker session detected via cookie existence (simple check)
    fetch('/api/workers/view', { method: 'GET' })
      .then(r => { if (r.status !== 405) setWorkerLoggedIn(false) })
      .catch(() => {})
  }, [])

  const dashboardHref = customerLoggedIn ? '/customer' : '/dashboard'
  const dashboardLabel = customerLoggedIn ? '🏠 My Account' : 'Dashboard'

  return (
    <nav className="bg-[#1B3A6B] text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-xl">
          <span className="text-[#FF6B00]">Kaari</span>
          <span>Gar</span>
          <span className="hidden sm:inline text-xs text-blue-300 font-normal ml-1 border border-blue-400/30 px-1.5 py-0.5 rounded">
            🇵🇰 Pakistan
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/search"
            className={`px-4 py-2 rounded-lg transition-colors ${pathname === '/search' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
            Karigar Dhoondhein
          </Link>

          <Link href="/register"
            className={`px-4 py-2 rounded-lg transition-colors ${pathname === '/register' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
            Join as Karigar
          </Link>

          <Link href={dashboardHref}
            className={`px-4 py-2 rounded-lg transition-colors ${(pathname === '/dashboard' || pathname === '/customer') ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
            {dashboardLabel}
          </Link>

          <UrduToggle />

          {/* Customer Login */}
          <Link href="/customer/login"
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${pathname === '/customer/login' ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
            Customer Login
          </Link>

          {/* Karigar Login */}
          <Link href="/login"
            className="ml-1 bg-[#FF6B00] hover:bg-[#e05f00] px-5 py-2 rounded-lg transition-colors font-semibold">
            Karigar Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#152d55] px-4 py-3 flex flex-col gap-1 text-sm font-medium">
          <Link href="/search" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            Karigar Dhoondhein
          </Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            Join as Karigar
          </Link>
          <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            {dashboardLabel}
          </Link>
          <Link href="/customer/login" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            Customer Login
          </Link>
          <Link href="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-[#FF6B00] font-semibold hover:bg-white/10 transition-colors">
            Karigar Login
          </Link>
        </div>
      )}
    </nav>
  )
}

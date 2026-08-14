'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/search', label: 'Find Workers' },
    { href: '/register', label: 'Join as Pro' },
  ]

  return (
    <nav className="bg-[#1B3A6B] text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-xl">
          <span className="text-[#FF6B00]">Hire</span>
          <span>Local</span>
          <span className="hidden sm:inline text-xs text-blue-300 font-normal ml-1 border border-blue-400/30 px-1.5 py-0.5 rounded">
            🇵🇰 Pakistan
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-white/20 text-white'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard'
                ? 'bg-white/20 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/login"
            className="ml-2 bg-[#FF6B00] hover:bg-[#e05f00] px-5 py-2 rounded-lg transition-colors font-semibold"
          >
            Worker Login
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
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
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-[#FF6B00] font-semibold hover:bg-white/10 transition-colors"
          >
            Worker Login
          </Link>
        </div>
      )}
    </nav>
  )
}

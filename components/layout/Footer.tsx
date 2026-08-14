import Link from 'next/link'
import { CATEGORIES, CITIES } from '@/lib/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f2240] text-white mt-16">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="font-bold text-2xl mb-3">
            <span className="text-[#FF6B00]">Hire</span>Local
          </div>
          <p className="text-blue-300 text-sm leading-relaxed mb-4">
            Pakistan ka bharosa mand local services platform. Apke ghar ke kaam ke liye trusted professionals.
          </p>
          <p className="text-blue-300 text-sm" dir="rtl" lang="ur">
            آپکا بھروسہ، آپکا کام
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
          <div className="flex flex-col gap-2">
            {CATEGORIES.slice(0, 6).map(cat => (
              <Link
                key={cat.value}
                href={`/search?category=${cat.value}`}
                className="text-blue-300 hover:text-white text-sm transition-colors flex items-center gap-1.5"
              >
                <span>{cat.icon}</span> {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Cities</h4>
          <div className="flex flex-col gap-2">
            {Object.keys(CITIES).map(city => (
              <Link
                key={city}
                href={`/search?city=${city}`}
                className="text-blue-300 hover:text-white text-sm transition-colors flex items-center gap-1.5"
              >
                📍 {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Links & Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2 mb-6">
            {[
              { href: '/search', label: 'Find Workers' },
              { href: '/register', label: 'Register as Worker' },
              { href: '/login', label: 'Worker Login' },
              { href: '/admin/login', label: 'Admin Panel' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-blue-300 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact</h4>
          <div className="text-sm text-blue-300 space-y-1.5">
            <p>📱 WhatsApp: +92 336 8264688</p>
            <p>📍 Pakistan 🇵🇰</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-400 text-xs">© {currentYear} HireLocal. All rights reserved.</p>
          <p className="text-blue-400 text-xs">Made with ❤️ for Pakistan</p>
        </div>
      </div>
    </footer>
  )
}

'use client'
import Link from 'next/link'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { lang } = useLang()
  const tr = useTranslation(lang)

  return (
    <footer className="bg-[#0f2240] text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="font-bold text-2xl mb-3"><span className="text-[#FF6B00]">Kaari</span>Gar</div>
          <p className="text-blue-300 text-sm leading-relaxed mb-3">{tr('footer_desc')}</p>
          <p className="text-blue-300 text-sm font-medium" dir="rtl" lang="ur">آپکا ماہر، آپکے پاس</p>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tr('footer_services')}</h4>
          <div className="flex flex-col gap-2">
            {CATEGORIES.slice(0, 6).map(cat => (
              <Link key={cat.value} href={`/search?category=${cat.value}`}
                className="text-blue-300 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                <span>{cat.icon}</span> {lang === 'ur' ? cat.urdu : cat.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tr('footer_cities')}</h4>
          <div className="flex flex-col gap-2">
            {Object.keys(CITIES).map(city => (
              <Link key={city} href={`/search?city=${city}`}
                className="text-blue-300 hover:text-white text-sm transition-colors flex items-center gap-1.5">
                📍 {city}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tr('footer_quick_links')}</h4>
          <div className="flex flex-col gap-2 mb-6">
            {[
              { href: '/search', labelKey: 'footer_find' as const },
              { href: '/register', labelKey: 'footer_become' as const },
              { href: '/login', labelKey: 'footer_login' as const },
              { href: '/admin/login', labelKey: 'footer_admin' as const },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-blue-300 hover:text-white text-sm transition-colors">
                {tr(link.labelKey)}
              </Link>
            ))}
          </div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{tr('footer_contact')}</h4>
          <div className="text-sm text-blue-300 space-y-1.5">
            <p>📱 WhatsApp: +92 336 8264688</p>
            <p>📍 Pakistan 🇵🇰</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-blue-400 text-xs">© {currentYear} {tr('footer_rights')}</p>
          <p className="text-blue-400 text-xs">{tr('footer_made')}</p>
        </div>
      </div>
    </footer>
  )
}

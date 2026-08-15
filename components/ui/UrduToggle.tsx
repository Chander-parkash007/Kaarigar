'use client'
import { useLang } from '@/lib/LangContext'

export function UrduToggle() {
  const { lang, setLang } = useLang()
  const isUrdu = lang === 'ur'

  return (
    <button
      onClick={() => setLang(isUrdu ? 'en' : 'ur')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
      aria-label="Toggle Urdu language"
      title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
    >
      <span>🇵🇰</span>
      <span>{isUrdu ? 'EN' : 'اردو'}</span>
    </button>
  )
}

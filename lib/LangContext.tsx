'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Lang } from './translations'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  isUrdu: boolean
}

const LangContext = createContext<LangContextType>({ lang: 'en', setLang: () => {}, isUrdu: false })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('kaarigar_lang') as Lang | null
    if (saved === 'ur') setLangState('ur')
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('kaarigar_lang', l)
    document.documentElement.setAttribute('lang', l)
    if (l === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl')
    } else {
      document.documentElement.removeAttribute('dir')
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, isUrdu: lang === 'ur' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

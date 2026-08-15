'use client'
import { useState, useEffect } from 'react'

export function UrduToggle() {
  const [urdu, setUrdu] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('kaarigar_lang')
    if (saved === 'ur') {
      setUrdu(true)
      document.documentElement.setAttribute('lang', 'ur')
      document.documentElement.setAttribute('dir', 'rtl')
    }
  }, [])

  function toggle() {
    const next = !urdu
    setUrdu(next)
    if (next) {
      localStorage.setItem('kaarigar_lang', 'ur')
      document.documentElement.setAttribute('lang', 'ur')
      document.documentElement.setAttribute('dir', 'rtl')
    } else {
      localStorage.setItem('kaarigar_lang', 'en')
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.removeAttribute('dir')
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white"
      aria-label="Toggle Urdu language"
    >
      {urdu ? (
        <><span>🇵🇰</span> <span>EN</span></>
      ) : (
        <><span>🇵🇰</span> <span lang="ur">اردو</span></>
      )}
    </button>
  )
}

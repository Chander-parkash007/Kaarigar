'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function LoginForm() {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !password) { setError(tr('login_fill')); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/workers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const data = await res.json()
      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        setError(data.error || tr('login_invalid'))
      }
    } catch {
      setError(tr('login_network'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4" noValidate>
      <Input label={tr('login_phone')} id="phone" value={phone}
        onChange={e => setPhone(e.target.value)} placeholder="03001234567" maxLength={11} />
      <Input label={tr('login_password')} id="password" type="password" value={password}
        onChange={e => setPassword(e.target.value)} placeholder={tr('login_password_placeholder')} />
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {loading ? tr('login_loading') : tr('login_btn')}
      </Button>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          {tr('login_not_registered')}{' '}
          <a href="/register" className="text-[#FF6B00] font-medium hover:underline">{tr('login_join_free')}</a>
        </p>
        <p className="text-sm text-gray-400">
          {tr('login_forgot')}{' '}
          <a href="/reset-password" className="text-[#1B3A6B] font-medium hover:underline">{tr('login_reset')}</a>
        </p>
      </div>
    </form>
  )
}

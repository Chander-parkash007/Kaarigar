'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'

export function CustomerAuthForm() {
  const { lang } = useLang()
  const tr = useTranslation(lang)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'register' && !name.trim()) { setError(tr('val_name')); return }
    if (!phone || !password) { setError(tr('login_fill')); return }
    if (!/^03\d{9}$/.test(phone)) { setError(tr('val_phone')); return }
    if (password.length < 6) { setError(tr('val_password')); return }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/customers/login' : '/api/customers/register'
      const body = mode === 'login' ? { phone, password } : { full_name: name, phone, password }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        window.location.href = '/customer'
      } else {
        setError(data.error || (lang === 'ur' ? 'غلطی ہوئی' : 'Something went wrong'))
      }
    } catch {
      setError(tr('network_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold text-[#1B3A6B]">
          {mode === 'login' ? tr('cust_login_title') : tr('cust_register_title')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {mode === 'login' ? tr('cust_login_sub') : tr('cust_register_sub')}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button onClick={() => setMode('login')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-[#1B3A6B] shadow-sm' : 'text-gray-500'}`}>
          {tr('cust_login_btn')}
        </button>
        <button onClick={() => setMode('register')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-white text-[#1B3A6B] shadow-sm' : 'text-gray-500'}`}>
          {tr('cust_register_btn')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        {mode === 'register' && (
          <Input label={tr('cust_name')} id="cust-name" value={name}
            onChange={e => setName(e.target.value)} placeholder="Ahmed Ali" />
        )}
        <Input label={tr('cust_phone')} id="cust-phone" type="tel" value={phone}
          onChange={e => setPhone(e.target.value)} placeholder="03001234567" maxLength={11} />
        <Input label={tr('cust_password')} id="cust-password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>}

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? '...' : mode === 'login' ? tr('cust_login_btn') : tr('cust_register_btn')}
        </Button>

        <p className="text-center text-sm text-gray-500">
          {lang === 'ur' ? 'کاریگر ہیں؟' : 'Are you a karigar?'}{' '}
          <a href="/login" className="text-[#FF6B00] font-medium hover:underline">
            {lang === 'ur' ? 'کاریگر لاگ ان' : 'Karigar Login'}
          </a>
        </p>
      </form>
    </div>
  )
}

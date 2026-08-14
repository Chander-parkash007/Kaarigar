'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phone || !password) { setError('Please enter phone and password'); return }
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
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid phone or password')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4" noValidate>
      <Input
        label="Phone Number"
        id="phone"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="03001234567"
        maxLength={11}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Your password"
      />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Login
      </Button>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Not registered?{' '}
          <a href="/register" className="text-[#FF6B00] font-medium hover:underline">Join KaariGar free</a>
        </p>
        <p className="text-sm text-gray-400">
          Forgot password?{' '}
          <a href="/reset-password" className="text-[#1B3A6B] font-medium hover:underline">Reset it here</a>
        </p>
      </div>
    </form>
  )
}

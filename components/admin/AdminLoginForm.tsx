'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) { setError('Please enter username and password'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4" noValidate>
      <div>
        <label htmlFor="username" className="text-sm font-medium text-[#2D2D2D] block mb-1">Username</label>
        <input
          id="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          placeholder="admin"
          autoComplete="username"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-[#2D2D2D] block mb-1">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1B3A6B] text-white py-3 rounded-lg font-semibold hover:bg-[#152d55] transition-colors disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function ResetPasswordForm() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone || !fullName || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/workers/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, fullName, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-green-600 mb-2">Password Reset!</h2>
        <p className="text-gray-600 text-sm">You can now login with your new password.</p>
        <p className="text-xs text-gray-400 mt-2">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4" noValidate>
      <Input
        label="Phone Number"
        id="reset-phone"
        type="tel"
        placeholder="03001234567"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={loading}
        maxLength={11}
      />
      <div>
        <Input
          label="Full Name (as registered)"
          id="reset-name"
          type="text"
          placeholder="Ahmed Ali"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Used to verify your identity</p>
      </div>
      <Input
        label="New Password"
        id="reset-password"
        type="password"
        placeholder="At least 6 characters"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        disabled={loading}
      />
      <Input
        label="Confirm New Password"
        id="reset-confirm"
        type="password"
        placeholder="Re-enter new password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        disabled={loading}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        {loading ? 'Resetting...' : 'Reset Password'}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Remember it?{' '}
        <a href="/login" className="text-[#FF6B00] font-medium hover:underline">Back to login</a>
      </p>
    </form>
  )
}

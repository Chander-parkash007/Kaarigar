'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CATEGORIES, CITIES } from '@/lib/constants'
import { validatePhone, validateFile } from '@/lib/utils'
import Image from 'next/image'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    category: '',
    city: '',
    area: '',
    about: '',
    password: '',
  })

  const cityAreas = form.city ? CITIES[form.city] || [] : []

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setErrors(prev => ({ ...prev, photo: err })); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, photo: '' }))
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!validatePhone(form.phone)) newErrors.phone = 'Enter a valid Pakistani number (03XXXXXXXXX)'
    if (!form.category) newErrors.category = 'Please select a service'
    if (!form.city) newErrors.city = 'Please select a city'
    if (!form.area) newErrors.area = 'Please select an area'
    if (form.about.trim().length < 10) newErrors.about = 'About must be at least 10 characters'
    if (!form.password || form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!photoFile) newErrors.photo = 'Please upload a profile photo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => formData.append(k, v))
      formData.append('photo', photoFile!)

      const res = await fetch('/api/workers/register', { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        window.location.href = '/dashboard'
      } else {
        setErrors({ form: data.error || 'Registration failed. Please try again.' })
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5" noValidate>
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#1B3A6B]/20 bg-gray-100">
          {photoPreview ? (
            <Image src={photoPreview} alt="Profile preview" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
          )}
        </div>
        <label className="cursor-pointer bg-[#1B3A6B]/10 text-[#1B3A6B] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1B3A6B]/20 transition-colors">
          Upload Photo *
          <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhoto} />
        </label>
        {errors.photo && <p className="text-xs text-red-600">{errors.photo}</p>}
        <p className="text-xs text-gray-400">JPEG or PNG, max 5MB</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          id="full_name"
          value={form.full_name}
          onChange={e => set('full_name', e.target.value)}
          placeholder="Ahmed Ali"
          error={errors.full_name}
          maxLength={100}
        />
        <Input
          label="Phone Number *"
          id="phone"
          value={form.phone}
          onChange={e => set('phone', e.target.value)}
          placeholder="03001234567"
          error={errors.phone}
          maxLength={11}
        />
      </div>

      <Select
        label="Service Category *"
        id="category"
        value={form.category}
        onChange={e => set('category', e.target.value)}
        options={CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
        placeholder="Select your service..."
        error={errors.category}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="City *"
          id="city"
          value={form.city}
          onChange={e => { set('city', e.target.value); set('area', '') }}
          options={Object.keys(CITIES).map(c => ({ value: c, label: c }))}
          placeholder="Select city..."
          error={errors.city}
        />
        <Select
          label="Area *"
          id="area"
          value={form.area}
          onChange={e => set('area', e.target.value)}
          options={cityAreas.map(a => ({ value: a, label: a }))}
          placeholder={form.city ? 'Select area...' : 'Select city first'}
          disabled={!form.city}
          error={errors.area}
        />
      </div>

      <div>
        <label htmlFor="about" className="text-sm font-medium text-[#2D2D2D] block mb-1">About You *</label>
        <textarea
          id="about"
          value={form.about}
          onChange={e => set('about', e.target.value)}
          placeholder="Tell customers about your experience, skills, and what kind of work you do..."
          rows={4}
          maxLength={500}
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] focus:border-transparent resize-none ${errors.about ? 'border-red-500' : 'border-gray-300'}`}
        />
        <div className="flex justify-between mt-1">
          {errors.about ? <p className="text-xs text-red-600">{errors.about}</p> : <span />}
          <span className="text-xs text-gray-400">{form.about.length}/500</span>
        </div>
      </div>

      <Input
        label="Password *"
        id="password"
        type="password"
        value={form.password}
        onChange={e => set('password', e.target.value)}
        placeholder="Min 6 characters"
        error={errors.password}
      />

      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {errors.form}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Create Free KaariGar Profile
      </Button>

      <p className="text-center text-sm text-gray-500">
        Already registered?{' '}
        <a href="/login" className="text-[#FF6B00] font-medium hover:underline">Login here</a>
      </p>
    </form>
  )
}

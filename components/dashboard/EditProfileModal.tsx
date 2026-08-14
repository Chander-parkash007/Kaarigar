'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Worker, PortfolioPhoto } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CATEGORIES, CITIES, MAX_PORTFOLIO_PHOTOS } from '@/lib/constants'
import { validateFile } from '@/lib/utils'

interface Props {
  worker: Worker
  portfolioPhotos: PortfolioPhoto[]
  onClose: () => void
}

type Tab = 'profile' | 'photo' | 'password' | 'portfolio'

export function EditProfileModal({ worker, portfolioPhotos, onClose }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    full_name: worker.full_name,
    about: worker.about,
    area: worker.area,
    category: worker.category,
    city: worker.city,
  })

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const cityAreas = form.city ? CITIES[form.city] || [] : []

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function setPass(field: string, value: string) {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // --- Save profile ---
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Name is required'
    if (form.about.trim().length < 10) newErrors.about = 'About must be at least 10 characters'
    if (!form.area) newErrors.area = 'Area is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const res = await fetch('/api/workers/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
        showSuccess('Profile updated successfully!')
      } else {
        setErrors({ form: data.error || 'Update failed' })
      }
    } catch {
      setErrors({ form: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // --- Profile photo change ---
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setErrors(prev => ({ ...prev, photo: err })); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors(prev => ({ ...prev, photo: '' }))
  }

  async function handlePhotoUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!photoFile) { setErrors(prev => ({ ...prev, photo: 'Please select a photo' })); return }
    setUploadingPhoto(true)
    try {
      const fd = new FormData()
      fd.append('photo', photoFile)
      const res = await fetch('/api/workers/update', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
        showSuccess('Profile photo updated!')
        setPhotoFile(null)
        setPhotoPreview(null)
      } else {
        setErrors(prev => ({ ...prev, photo: data.error || 'Upload failed' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, photo: 'Network error. Please try again.' }))
    } finally {
      setUploadingPhoto(false)
    }
  }

  // --- Change password ---
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6)
      newErrors.newPassword = 'New password must be at least 6 characters'
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setLoading(true)
    try {
      const res = await fetch('/api/workers/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        showSuccess('Password changed successfully!')
      } else {
        setErrors({ passwordForm: data.error || 'Failed to change password' })
      }
    } catch {
      setErrors({ passwordForm: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // --- Portfolio ---
  async function handlePortfolioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setErrors(prev => ({ ...prev, portfolio: err })); return }
    if (portfolioPhotos.length >= MAX_PORTFOLIO_PHOTOS) {
      setErrors(prev => ({ ...prev, portfolio: `Maximum ${MAX_PORTFOLIO_PHOTOS} photos allowed` }))
      return
    }
    setUploadingPortfolio(true)
    setErrors(prev => ({ ...prev, portfolio: '' }))
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch('/api/workers/portfolio', { method: 'POST', body: fd })
      if (res.ok) {
        router.refresh()
        showSuccess('Photo uploaded!')
      } else {
        const data = await res.json()
        setErrors(prev => ({ ...prev, portfolio: data.error || 'Upload failed' }))
      }
    } catch {
      setErrors(prev => ({ ...prev, portfolio: 'Upload failed. Please try again.' }))
    } finally {
      setUploadingPortfolio(false)
      e.target.value = ''
    }
  }

  async function deletePortfolioPhoto(photoId: string) {
    if (!confirm('Delete this photo?')) return
    try {
      await fetch(`/api/workers/portfolio/${photoId}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      alert('Failed to delete photo. Please try again.')
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: '✏️ Profile' },
    { key: 'photo', label: '📷 Photo' },
    { key: 'password', label: '🔐 Password' },
    { key: 'portfolio', label: `📸 Portfolio (${portfolioPhotos.length})` },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="font-bold text-[#1B3A6B] text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setErrors({}); setSuccessMsg('') }}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-[#FF6B00] text-[#FF6B00]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            ✅ {successMsg}
          </div>
        )}

        {/* --- Profile Tab --- */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <Input
              label="Full Name"
              id="edit-name"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              error={errors.full_name}
              maxLength={100}
            />
            <Select
              label="Service Category"
              id="edit-category"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              options={CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="City"
                id="edit-city"
                value={form.city}
                onChange={e => { set('city', e.target.value); set('area', '') }}
                options={Object.keys(CITIES).map(c => ({ value: c, label: c }))}
              />
              <Select
                label="Area"
                id="edit-area"
                value={form.area}
                onChange={e => set('area', e.target.value)}
                options={cityAreas.map(a => ({ value: a, label: a }))}
                placeholder="Select area..."
                disabled={!form.city}
                error={errors.area}
              />
            </div>
            <div>
              <label htmlFor="edit-about" className="text-sm font-medium text-[#2D2D2D] block mb-1">About</label>
              <textarea
                id="edit-about"
                value={form.about}
                onChange={e => set('about', e.target.value)}
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] resize-none ${errors.about ? 'border-red-500' : 'border-gray-300'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.about ? <p className="text-xs text-red-600">{errors.about}</p> : <span />}
                <span className="text-xs text-gray-400">{form.about.length}/500</span>
              </div>
            </div>
            {errors.form && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{errors.form}</p>}
            <Button type="submit" variant="primary" loading={loading} className="w-full">Save Changes</Button>
          </form>
        )}

        {/* --- Photo Tab --- */}
        {activeTab === 'photo' && (
          <form onSubmit={handlePhotoUpload} className="p-5 space-y-4">
            <p className="text-sm text-gray-600">Update your profile photo. This will be visible to all customers.</p>

            {/* Current photo */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                {(photoPreview || worker.profile_photo_url) ? (
                  <Image
                    src={photoPreview || worker.profile_photo_url!}
                    alt="Profile"
                    fill
                    className="rounded-full object-cover border-2 border-gray-200"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">👤</div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {photoPreview ? '✅ New photo selected' : 'Current profile photo'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG or PNG, max 5MB</p>
              </div>
            </div>

            <label className="block cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3A6B] transition-colors">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-600">Click to select new photo</p>
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoSelect} />
            </label>

            {errors.photo && <p className="text-xs text-red-600">{errors.photo}</p>}

            <Button type="submit" variant="primary" loading={uploadingPhoto} disabled={!photoFile} className="w-full">
              {uploadingPhoto ? 'Uploading...' : 'Update Profile Photo'}
            </Button>
          </form>
        )}

        {/* --- Password Tab --- */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            <p className="text-sm text-gray-600">Change your account password. You&apos;ll need your current password.</p>
            <Input
              label="Current Password"
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={e => setPass('currentPassword', e.target.value)}
              placeholder="Enter current password"
              error={errors.currentPassword}
            />
            <Input
              label="New Password"
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={e => setPass('newPassword', e.target.value)}
              placeholder="At least 6 characters"
              error={errors.newPassword}
            />
            <Input
              label="Confirm New Password"
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={e => setPass('confirmPassword', e.target.value)}
              placeholder="Re-enter new password"
              error={errors.confirmPassword}
            />
            {errors.passwordForm && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{errors.passwordForm}</p>
            )}
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Change Password
            </Button>
          </form>
        )}

        {/* --- Portfolio Tab --- */}
        {activeTab === 'portfolio' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1B3A6B]">
                Work Photos ({portfolioPhotos.length}/{MAX_PORTFOLIO_PHOTOS})
              </h3>
              {portfolioPhotos.length < MAX_PORTFOLIO_PHOTOS && (
                <label className="cursor-pointer bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#1B3A6B]/20 transition-colors">
                  {uploadingPortfolio ? '⏳ Uploading...' : '+ Add Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handlePortfolioUpload}
                    disabled={uploadingPortfolio}
                  />
                </label>
              )}
            </div>
            {errors.portfolio && <p className="text-xs text-red-600 mb-2">{errors.portfolio}</p>}
            <p className="text-xs text-gray-500 mb-3">Hover over a photo and click × to delete it.</p>

            {portfolioPhotos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm">No photos uploaded yet.</p>
                <p className="text-xs mt-1">Add photos to show customers your work quality!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {portfolioPhotos.map(photo => (
                  <div key={photo.id} className="relative aspect-square group">
                    <Image src={photo.photo_url} alt="Work photo" fill className="object-cover rounded-lg" sizes="80px" />
                    <button
                      onClick={() => deletePortfolioPhoto(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs items-center justify-center hidden group-hover:flex hover:bg-red-600 transition-colors"
                      aria-label="Delete photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

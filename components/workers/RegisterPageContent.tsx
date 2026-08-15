'use client'
import { useLang } from '@/lib/LangContext'
import { useTranslation } from '@/lib/translations'
import { RegisterForm } from './RegisterForm'

export function RegisterPageContent() {
  const { lang } = useLang()
  const tr = useTranslation(lang)

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1B3A6B]">{tr('register_title')}</h1>
        <p className="text-gray-500 mt-2">{tr('register_subtitle')}</p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
          <span>✅ {tr('register_free')}</span>
          <span>✅ {tr('register_no_commission')}</span>
          <span>✅ {tr('register_direct')}</span>
        </div>
      </div>
      <RegisterForm />
    </>
  )
}

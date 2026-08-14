import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KaariGar — Apka ماہر, Apke Paas',
  description: 'Pakistan ka number 1 local karigar platform. Trusted plumbers, electricians, tutors, and more in your area. کاریگر ڈھونڈیں آسانی سے۔',
  keywords: 'karigar lahore, plumber karachi, electrician islamabad, tutor hyderabad, local services pakistan, kaam wala, kaarigar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

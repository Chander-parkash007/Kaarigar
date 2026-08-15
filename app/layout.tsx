import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KaariGar — Apka ماہر, Apke Paas',
  description: 'Pakistan ka number 1 local karigar platform. Trusted plumbers, electricians, tutors, and more in your area. کاریگر ڈھونڈیں آسانی سے۔',
  keywords: 'karigar lahore, plumber karachi, electrician islamabad, tutor hyderabad, local services pakistan, kaam wala, kaarigar',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'KaariGar — Apka Bharosa Mand Karigar',
    description: 'Pakistan ka #1 local karigar platform. Find trusted plumbers, electricians, tutors & more in your city.',
    type: 'website',
    locale: 'en_PK',
    siteName: 'KaariGar',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

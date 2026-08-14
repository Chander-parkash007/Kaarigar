import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HireLocal — Apka Bharosa, Apka Kaam',
  description: 'Pakistan ka number 1 local service marketplace. Trusted plumbers, electricians, tutors, and more in your area.',
  keywords: 'plumber lahore, electrician karachi, tutor islamabad, local services pakistan',
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

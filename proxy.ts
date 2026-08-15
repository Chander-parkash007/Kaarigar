import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken, verifyWorkerToken } from '@/lib/auth'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin pages (except login) ────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // ── Worker dashboard ─────────────────────────────────────────────
  if (pathname === '/dashboard') {
    const token = req.cookies.get('worker_token')?.value
    if (!token || !verifyWorkerToken(token)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // ── Protected worker API routes ───────────────────────────────────
  if (
    pathname.startsWith('/api/workers/update') ||
    pathname.startsWith('/api/workers/portfolio') ||
    pathname.startsWith('/api/workers/payment-request') ||
    pathname.startsWith('/api/workers/change-password') ||
    pathname.startsWith('/api/workers/logout')
  ) {
    const token = req.cookies.get('worker_token')?.value
    if (!token || !verifyWorkerToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Customer dashboard ────────────────────────────────────────────
  if (pathname === '/customer') {
    const token = req.cookies.get('customer_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/customer/login', req.url))
    }
  }

  // ── Protected admin API routes ────────────────────────────────────
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const token = req.cookies.get('admin_token')?.value
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard',
    '/customer',
    '/api/workers/update/:path*',
    '/api/workers/portfolio/:path*',
    '/api/workers/payment-request',
    '/api/workers/change-password',
    '/api/workers/logout',
    '/api/admin/:path*',
  ],
}

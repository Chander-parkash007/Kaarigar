import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple rate limiting in memory (for production, use Redis)
const resetAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(phone: string): boolean {
  const now = Date.now()
  const attempt = resetAttempts.get(phone)
  
  if (!attempt) {
    resetAttempts.set(phone, { count: 1, resetAt: now + 15 * 60 * 1000 }) // 15 min
    return false
  }
  
  if (now > attempt.resetAt) {
    resetAttempts.set(phone, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  
  if (attempt.count >= 3) {
    return true
  }
  
  attempt.count++
  return false
}

export async function POST(req: NextRequest) {
  try {
    const { phone, fullName, newPassword } = await req.json()

    // Validation
    if (!phone || !fullName || !newPassword) {
      return NextResponse.json({ error: 'Phone, full name, and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Rate limiting
    if (isRateLimited(phone)) {
      return NextResponse.json({ 
        error: 'Too many reset attempts. Please try again after 15 minutes.' 
      }, { status: 429 })
    }

    // Find worker by phone and full name (security question)
    const { data: worker, error: fetchError } = await supabase
      .from('workers')
      .select('id, full_name')
      .eq('phone', phone)
      .single()

    if (fetchError || !worker) {
      return NextResponse.json({ error: 'No account found with this phone number' }, { status: 404 })
    }

    // Verify full name matches (case-insensitive)
    if (worker.full_name.toLowerCase().trim() !== fullName.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Full name does not match our records' }, { status: 401 })
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('workers')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', worker.id)

    if (updateError) {
      console.error('Password reset error:', updateError)
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    // Clear rate limit on success
    resetAttempts.delete(phone)

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    })
  } catch (err) {
    console.error('Password reset error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

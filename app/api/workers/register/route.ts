import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { signWorkerToken } from '@/lib/auth'
import { FREE_TRIAL_DAYS } from '@/lib/constants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const category = formData.get('category') as string
    const city = formData.get('city') as string
    const area = formData.get('area') as string
    const about = formData.get('about') as string
    const password = formData.get('password') as string
    const photo = formData.get('photo') as File | null

    // Validate required fields
    if (!full_name || !phone || !category || !city || !area || !about || !password || !photo) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check phone uniqueness
    const { data: existing } = await supabase
      .from('workers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This phone number is already registered' }, { status: 409 })
    }

    // Upload profile photo
    const photoBuffer = await photo.arrayBuffer()
    const photoExt = photo.type === 'image/png' ? 'png' : 'jpg'
    const photoPath = `profiles/${uuidv4()}.${photoExt}`

    const { error: uploadError } = await supabase.storage
      .from('worker-photos')
      .upload(photoPath, Buffer.from(photoBuffer), {
        contentType: photo.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Photo upload failed. Please try again.' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('worker-photos').getPublicUrl(photoPath)
    const photoUrl = urlData.publicUrl

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Give every new karigar a 14-day free boost trial
    const boostExpiry = new Date()
    boostExpiry.setDate(boostExpiry.getDate() + FREE_TRIAL_DAYS)

    // Create worker
    const { data: worker, error: insertError } = await supabase
      .from('workers')
      .insert({
        full_name: full_name.trim(),
        phone,
        category,
        city,
        area,
        about: about.trim(),
        profile_photo_url: photoUrl,
        tier: 'free',
        status: 'active',
        boost_expires_at: boostExpiry.toISOString(),
        password_hash,
      })
      .select('id')
      .single()

    if (insertError || !worker) {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
    }

    // Check for referral — if someone referred this phone, give both parties 7 extra days
    try {
      const { data: referral } = await supabase
        .from('referrals')
        .select('id, referrer_id, bonus_days')
        .eq('referred_phone', phone)
        .eq('status', 'pending')
        .single()

      if (referral) {
        const bonusExpiry = new Date()
        bonusExpiry.setDate(bonusExpiry.getDate() + referral.bonus_days)

        // Give bonus to new worker
        await supabase.from('workers').update({
          boost_expires_at: bonusExpiry.toISOString(),
        }).eq('id', worker.id)

        // Give bonus to referrer too
        const { data: referrer } = await supabase
          .from('workers')
          .select('boost_expires_at')
          .eq('id', referral.referrer_id)
          .single()

        if (referrer) {
          const referrerExpiry = referrer.boost_expires_at && new Date(referrer.boost_expires_at) > new Date()
            ? new Date(referrer.boost_expires_at)
            : new Date()
          referrerExpiry.setDate(referrerExpiry.getDate() + referral.bonus_days)

          await supabase.from('workers').update({
            boost_expires_at: referrerExpiry.toISOString(),
          }).eq('id', referral.referrer_id)
        }

        // Mark referral as completed
        await supabase.from('referrals').update({
          status: 'completed',
          referred_worker_id: worker.id,
        }).eq('id', referral.id)
      }
    } catch {
      // Referral bonus is non-critical — don't block registration
    }

    // Set auth cookie
    const token = signWorkerToken(worker.id)
    const response = NextResponse.json({ success: true, workerId: worker.id })
    response.cookies.set('worker_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

-- Run this in Supabase SQL Editor

-- Add email + verification fields to customers table
ALTER TABLE customers 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS is_email_verified boolean not null default false,
  ADD COLUMN IF NOT EXISTS email_otp text,
  ADD COLUMN IF NOT EXISTS email_otp_expires_at timestamptz;

-- Add is_verified flag to reviews (admin approval)
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS status text not null default 'pending' check (status in ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS reviewer_phone text,
  ADD COLUMN IF NOT EXISTS customer_id uuid references customers(id) on delete set null,
  ADD COLUMN IF NOT EXISTS is_customer_verified boolean not null default false;

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_status ON reviews(worker_id, status);

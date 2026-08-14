-- HireLocal Database Schema
-- Run this entire file in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Workers table
create table if not exists workers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique,
  password_hash text not null default '',
  category text not null,
  city text not null,
  area text not null,
  about text not null,
  profile_photo_url text,
  tier text not null default 'free' check (tier in ('free','boosted','verified')),
  status text not null default 'active' check (status in ('active','inactive')),
  boost_expires_at timestamptz,
  verified_expires_at timestamptz,
  average_rating numeric(3,1) default 0,
  review_count integer default 0,
  profile_views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews table
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz default now()
);

-- Portfolio photos table
create table if not exists portfolio_photos (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz default now()
);

-- Payment requests table
create table if not exists payment_requests (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  payment_type text not null check (payment_type in ('boost','verified_badge')),
  screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

-- Activity logs table
create table if not exists activity_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_username text not null,
  action_type text not null,
  action_description text not null,
  worker_id uuid references workers(id) on delete set null,
  worker_name text,
  created_at timestamptz default now()
);

-- Admin users table
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Login attempts table (for IP lockout)
create table if not exists login_attempts (
  id uuid primary key default uuid_generate_v4(),
  ip_address text not null,
  attempted_at timestamptz default now()
);

-- Profile view sessions table (to track unique views)
create table if not exists profile_view_sessions (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  session_id text not null,
  viewed_at timestamptz default now(),
  unique(worker_id, session_id)
);

-- Indexes for performance
create index if not exists idx_workers_city_category on workers(city, category);
create index if not exists idx_workers_status on workers(status);
create index if not exists idx_workers_tier on workers(tier);
create index if not exists idx_workers_boost_expires on workers(boost_expires_at);
create index if not exists idx_workers_verified_expires on workers(verified_expires_at);
create index if not exists idx_reviews_worker_id on reviews(worker_id);
create index if not exists idx_portfolio_worker_id on portfolio_photos(worker_id);
create index if not exists idx_payment_requests_status on payment_requests(status);
create index if not exists idx_payment_requests_worker on payment_requests(worker_id, status);
create index if not exists idx_activity_logs_created_at on activity_logs(created_at desc);
create index if not exists idx_login_attempts_ip on login_attempts(ip_address, attempted_at);

-- ============================================================
-- Function: update_worker_rating
-- Auto-updates average_rating and review_count on review insert
-- ============================================================
create or replace function update_worker_rating()
returns trigger as $$
begin
  update workers
  set
    average_rating = (
      select round(avg(rating)::numeric, 1)
      from reviews
      where worker_id = new.worker_id
    ),
    review_count = (
      select count(*)
      from reviews
      where worker_id = new.worker_id
    ),
    updated_at = now()
  where id = new.worker_id;
  return new;
end;
$$ language plpgsql;

-- Trigger: auto-update worker rating on review insert or delete
drop trigger if exists on_review_insert on reviews;
create trigger on_review_insert
  after insert or delete on reviews
  for each row execute function update_worker_rating();

-- ============================================================
-- Function: increment_profile_views
-- Atomically increments the profile view counter
-- ============================================================
create or replace function increment_profile_views(worker_id_param uuid)
returns void as $$
begin
  update workers
  set profile_views = profile_views + 1
  where id = worker_id_param;
end;
$$ language plpgsql;

-- ============================================================
-- Function: expire_worker_tiers
-- Resets tier to 'free' when boost/verified expires
-- Call this via a Supabase cron job or pg_cron
-- ============================================================
create or replace function expire_worker_tiers()
returns void as $$
begin
  -- Reset verified workers whose badge has expired
  update workers
  set tier = 'free', updated_at = now()
  where tier = 'verified'
    and verified_expires_at is not null
    and verified_expires_at < now();

  -- Reset boosted workers whose boost has expired
  -- (only if they're not verified)
  update workers
  set tier = 'free', updated_at = now()
  where tier = 'boosted'
    and boost_expires_at is not null
    and boost_expires_at < now()
    and (verified_expires_at is null or verified_expires_at < now());
end;
$$ language plpgsql;

-- ============================================================
-- Function: cleanup_old_login_attempts
-- Removes login attempt records older than 15 minutes
-- ============================================================
create or replace function cleanup_old_login_attempts()
returns void as $$
begin
  delete from login_attempts
  where attempted_at < now() - interval '15 minutes';
end;
$$ language plpgsql;

-- ============================================================
-- Cron jobs (requires pg_cron extension — enable in Supabase dashboard)
-- ============================================================
-- Schedule tier expiration check every hour:
-- select cron.schedule('expire-tiers', '0 * * * *', 'select expire_worker_tiers()');
--
-- Schedule login attempt cleanup every 30 minutes:
-- select cron.schedule('cleanup-login-attempts', '*/30 * * * *', 'select cleanup_old_login_attempts()');

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table workers enable row level security;
alter table reviews enable row level security;
alter table portfolio_photos enable row level security;
alter table payment_requests enable row level security;
alter table activity_logs enable row level security;
alter table admin_users enable row level security;
alter table profile_view_sessions enable row level security;

-- Drop existing policies to recreate cleanly
drop policy if exists "Public read active workers" on workers;
drop policy if exists "Public read reviews" on reviews;
drop policy if exists "Public insert reviews" on reviews;
drop policy if exists "Public read portfolio" on portfolio_photos;
drop policy if exists "Service role all workers" on workers;
drop policy if exists "Service role all payment_requests" on payment_requests;
drop policy if exists "Service role all activity_logs" on activity_logs;
drop policy if exists "Service role all admin_users" on admin_users;

-- Public can read active workers
create policy "Public read active workers" on workers
  for select using (status = 'active');

-- Public can read reviews
create policy "Public read reviews" on reviews
  for select using (true);

-- Public can insert reviews (rate-limited in application layer)
create policy "Public insert reviews" on reviews
  for insert with check (true);

-- Public can read portfolio photos
create policy "Public read portfolio" on portfolio_photos
  for select using (true);

-- Public can insert profile view sessions
create policy "Public insert view sessions" on profile_view_sessions
  for insert with check (true);

-- Public can read profile view sessions (for dedup check)
create policy "Public read view sessions" on profile_view_sessions
  for select using (true);

-- Service role has full access to all tables (used by API routes with SERVICE_ROLE_KEY)
create policy "Service role all workers" on workers
  for all using (auth.role() = 'service_role');

create policy "Service role all payment_requests" on payment_requests
  for all using (auth.role() = 'service_role');

create policy "Service role all activity_logs" on activity_logs
  for all using (auth.role() = 'service_role');

create policy "Service role all admin_users" on admin_users
  for all using (auth.role() = 'service_role');

create policy "Service role all login_attempts" on login_attempts
  for all using (auth.role() = 'service_role');

-- ============================================================
-- Default Admin User
-- IMPORTANT: Change password immediately after setup!
-- Generate a proper hash at: https://bcrypt-generator.com/
-- Default credentials: admin / admin123 (CHANGE THIS!)
-- ============================================================
insert into admin_users (username, password_hash)
values (
  'admin',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'  -- password: "password" - CHANGE THIS!
)
on conflict (username) do nothing;

-- ============================================================
-- Storage buckets (create manually in Supabase Dashboard)
-- ============================================================
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket: "worker-photos"   → Public access: ON
-- 3. (Optional) Create bucket: "payment-screenshots" → Public access: ON
--    (Screenshots are stored in worker-photos/payment-screenshots/ subfolder)

-- ============================================================
-- HOW TO CHANGE ADMIN PASSWORD:
-- 1. Generate bcrypt hash of your password (bcrypt-generator.com, 10 rounds)
-- 2. Run: UPDATE admin_users SET password_hash = '<your-hash>' WHERE username = 'admin';
-- ============================================================

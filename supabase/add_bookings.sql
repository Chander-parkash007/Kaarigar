-- Run this in Supabase SQL Editor to add bookings feature

-- Bookings table
create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid not null references workers(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  service_description text not null,
  preferred_date text,
  status text not null default 'pending' check (status in ('pending','contacted','completed','cancelled')),
  created_at timestamptz default now()
);

create index if not exists idx_bookings_worker_id on bookings(worker_id);
create index if not exists idx_bookings_status on bookings(status);

-- RLS
alter table bookings enable row level security;
create policy "Public insert bookings" on bookings for insert with check (true);
create policy "Service role all bookings" on bookings for all using (auth.role() = 'service_role');

-- Referrals table
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references workers(id) on delete cascade,
  referred_phone text not null,
  referred_worker_id uuid references workers(id) on delete set null,
  bonus_days integer not null default 7,
  status text not null default 'pending' check (status in ('pending','completed')),
  created_at timestamptz default now()
);

alter table referrals enable row level security;
create policy "Service role all referrals" on referrals for all using (auth.role() = 'service_role');

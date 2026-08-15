-- Run this in Supabase SQL Editor to add customer accounts

-- Customer accounts table
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Saved karigars (favourites)
create table if not exists saved_karigars (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  worker_id uuid not null references workers(id) on delete cascade,
  created_at timestamptz default now(),
  unique(customer_id, worker_id)
);

create index if not exists idx_saved_karigars_customer on saved_karigars(customer_id);
create index if not exists idx_customers_phone on customers(phone);

-- RLS
alter table customers enable row level security;
alter table saved_karigars enable row level security;

create policy "Service role all customers" on customers for all using (auth.role() = 'service_role');
create policy "Service role all saved_karigars" on saved_karigars for all using (auth.role() = 'service_role');

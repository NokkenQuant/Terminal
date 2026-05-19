-- Supabase secure baseline for Agro Terminal
-- Date: 2026-05-18
-- Scope: profiles, watchlists, price_alerts, subscriptions + RLS

begin;

-- 1) Extensions
create extension if not exists pgcrypto;

-- 2) Tables

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  age int check (age >= 13 and age <= 120),
  sex text not null,
  phone text,
  city text,
  state text,
  country text default 'Brasil',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_unique_idx on public.profiles (lower(email));

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_code text not null,
  created_at timestamptz not null default now(),
  constraint watchlists_user_asset_unique unique (user_id, asset_code)
);

create index if not exists watchlists_user_id_idx on public.watchlists (user_id);
create index if not exists watchlists_asset_code_idx on public.watchlists (asset_code);

create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_code text not null,
  target_price numeric(18,6) not null check (target_price > 0),
  direction text not null check (direction in ('above', 'below')),
  expires_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  triggered_at timestamptz,
  constraint price_alerts_expiry_valid check (expires_at > created_at)
);

create index if not exists price_alerts_user_id_idx on public.price_alerts (user_id);
create index if not exists price_alerts_active_expiry_idx on public.price_alerts (active, expires_at);
create index if not exists price_alerts_asset_code_idx on public.price_alerts (asset_code);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'premium')),
  status text not null check (status in ('active', 'paused', 'canceled', 'trialing', 'past_due')),
  renewal_date date,
  gateway_customer_id text,
  gateway_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_plan_unique unique (user_id, plan)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- 3) Trigger helpers

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- 4) RLS enable

alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;
alter table public.price_alerts enable row level security;
alter table public.subscriptions enable row level security;

-- 5) RLS policies - user owns own rows

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists watchlists_select_own on public.watchlists;
create policy watchlists_select_own on public.watchlists
for select
using (auth.uid() = user_id);

drop policy if exists watchlists_insert_own on public.watchlists;
create policy watchlists_insert_own on public.watchlists
for insert
with check (auth.uid() = user_id);

drop policy if exists watchlists_update_own on public.watchlists;
create policy watchlists_update_own on public.watchlists
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists watchlists_delete_own on public.watchlists;
create policy watchlists_delete_own on public.watchlists
for delete
using (auth.uid() = user_id);

drop policy if exists price_alerts_select_own on public.price_alerts;
create policy price_alerts_select_own on public.price_alerts
for select
using (auth.uid() = user_id);

drop policy if exists price_alerts_insert_own on public.price_alerts;
create policy price_alerts_insert_own on public.price_alerts
for insert
with check (auth.uid() = user_id);

drop policy if exists price_alerts_update_own on public.price_alerts;
create policy price_alerts_update_own on public.price_alerts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists price_alerts_delete_own on public.price_alerts;
create policy price_alerts_delete_own on public.price_alerts
for delete
using (auth.uid() = user_id);

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own on public.subscriptions
for insert
with check (auth.uid() = user_id);

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own on public.subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own on public.subscriptions
for delete
using (auth.uid() = user_id);

-- 6) Grants (authenticated users)
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.watchlists to authenticated;
grant select, insert, update, delete on public.price_alerts to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;

commit;

-- Post-deploy verification checklist (manual):
-- 1) Confirm RLS ON in all four tables.
-- 2) Login as user A and ensure cannot read user B records.
-- 3) Validate unique constraints and checks (target_price, direction, expiry).

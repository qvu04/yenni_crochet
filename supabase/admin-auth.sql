-- Yenni Crochet Admin Auth
-- Run this in Supabase SQL Editor before wiring the admin web.
--
-- Goal:
-- 1. Admin users login with Supabase Auth.
-- 2. The admin web has no public register flow.
-- 3. Only users listed in public.admin_profiles can manage shop data.
--
-- After running this file:
-- - Create the admin user manually in Dashboard -> Authentication -> Users.
-- - Copy that auth.users.id and run the INSERT example near the bottom.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'admin'
    check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_profiles_updated_at on public.admin_profiles;
create trigger trg_admin_profiles_updated_at
  before update on public.admin_profiles
  for each row
  execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;

drop policy if exists "admin_profiles_admin_read" on public.admin_profiles;
create policy "admin_profiles_admin_read"
  on public.admin_profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "admin_profiles_no_public_write" on public.admin_profiles;
create policy "admin_profiles_no_public_write"
  on public.admin_profiles
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- Security definer helper used by table policies.
-- This prevents repeating the admin lookup everywhere.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.role = 'admin'
      and ap.is_active is true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- =========================================
-- Admin policies for core shop tables
-- =========================================

alter table public.products enable row level security;
drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
  on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.product_variants enable row level security;
drop policy if exists "product_variants_admin_manage" on public.product_variants;
create policy "product_variants_admin_manage"
  on public.product_variants
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.product_price_tiers enable row level security;
drop policy if exists "product_price_tiers_admin_manage" on public.product_price_tiers;
create policy "product_price_tiers_admin_manage"
  on public.product_price_tiers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.orders enable row level security;
drop policy if exists "orders_admin_manage" on public.orders;
create policy "orders_admin_manage"
  on public.orders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.order_items enable row level security;
drop policy if exists "order_items_admin_manage" on public.order_items;
create policy "order_items_admin_manage"
  on public.order_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.custom_requests enable row level security;
drop policy if exists "custom_requests_admin_manage" on public.custom_requests;
create policy "custom_requests_admin_manage"
  on public.custom_requests
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.campaigns enable row level security;
drop policy if exists "campaigns_admin_manage" on public.campaigns;
create policy "campaigns_admin_manage"
  on public.campaigns
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.campaign_products enable row level security;
drop policy if exists "campaign_products_admin_manage" on public.campaign_products;
create policy "campaign_products_admin_manage"
  on public.campaign_products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.promotions enable row level security;
drop policy if exists "promotions_admin_manage" on public.promotions;
create policy "promotions_admin_manage"
  on public.promotions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.user_promotions enable row level security;
drop policy if exists "user_promotions_admin_manage" on public.user_promotions;
create policy "user_promotions_admin_manage"
  on public.user_promotions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================================
-- Optional tables, only if they exist in your database.
-- These are wrapped in DO blocks so this file can run even when a table
-- was cleaned up or has not been created yet.
-- =========================================

do $$
begin
  if to_regclass('public.contact_messages') is not null then
    alter table public.contact_messages enable row level security;
    drop policy if exists "contact_messages_admin_manage" on public.contact_messages;
    create policy "contact_messages_admin_manage"
      on public.contact_messages
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

do $$
begin
  if to_regclass('public.order_status_events') is not null then
    alter table public.order_status_events enable row level security;
    drop policy if exists "order_status_events_admin_manage" on public.order_status_events;
    create policy "order_status_events_admin_manage"
      on public.order_status_events
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

-- =========================================
-- Add your first admin user
-- =========================================
-- 1. Supabase Dashboard -> Authentication -> Users -> Add user.
-- 2. Copy the new user's id.
-- 3. Replace the uuid below and run it once.
--
-- insert into public.admin_profiles (id, display_name)
-- values ('AUTH_USER_ID_HERE', 'Yenni Admin');

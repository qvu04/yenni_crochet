-- Yenni Crochet - customer account profile and stats
-- Run in Supabase Dashboard -> SQL Editor after orders/custom_requests exist.
--
-- The app still uses the anon key, so account reads go through RPC functions
-- instead of public select policies on customer data tables.

create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  zalo_user_id text not null unique,
  display_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table customer_profiles
add column if not exists last_seen_at timestamptz not null default now();

alter table customer_profiles enable row level security;

drop policy if exists "customer_profiles_public_insert" on customer_profiles;
create policy "customer_profiles_public_insert"
  on customer_profiles for insert
  with check (true);

create index if not exists idx_customer_profiles_zalo_user
on customer_profiles(zalo_user_id);

create index if not exists idx_orders_zalo_user_created
on orders(zalo_user_id, created_at desc);

create index if not exists idx_custom_requests_zalo_user_created
on custom_requests(zalo_user_id, created_at desc);

create or replace function public.upsert_customer_profile(
  p_zalo_user_id text,
  p_display_name text default null,
  p_avatar_url text default null,
  p_phone text default null
)
returns table (
  id uuid,
  zalo_user_id text,
  display_name text,
  avatar_url text,
  phone text,
  created_at timestamptz,
  updated_at timestamptz,
  last_seen_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(p_zalo_user_id), '') is null then
    raise exception 'Missing Zalo user id' using errcode = '22023';
  end if;

  return query
  insert into customer_profiles (
    zalo_user_id,
    display_name,
    avatar_url,
    phone,
    last_seen_at,
    updated_at
  )
  values (
    trim(p_zalo_user_id),
    nullif(trim(coalesce(p_display_name, '')), ''),
    nullif(trim(coalesce(p_avatar_url, '')), ''),
    nullif(trim(coalesce(p_phone, '')), ''),
    now(),
    now()
  )
  on conflict on constraint customer_profiles_zalo_user_id_key do update
  set
    display_name = coalesce(excluded.display_name, customer_profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, customer_profiles.avatar_url),
    phone = coalesce(excluded.phone, customer_profiles.phone),
    last_seen_at = now(),
    updated_at = now()
  returning
    customer_profiles.id,
    customer_profiles.zalo_user_id,
    customer_profiles.display_name,
    customer_profiles.avatar_url,
    customer_profiles.phone,
    customer_profiles.created_at,
    customer_profiles.updated_at,
    customer_profiles.last_seen_at;
end;
$$;

create or replace function public.get_customer_account_summary(
  p_zalo_user_id text
)
returns table (
  profile_id uuid,
  zalo_user_id text,
  display_name text,
  avatar_url text,
  phone text,
  total_orders bigint,
  pending_orders bigint,
  paid_orders bigint,
  total_deposit_amount numeric,
  latest_order_at timestamptz,
  total_custom_requests bigint,
  pending_custom_requests bigint,
  latest_custom_request_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with target_profile as (
    select *
    from customer_profiles
    where customer_profiles.zalo_user_id = trim(p_zalo_user_id)
    limit 1
  ),
  order_stats as (
    select
      count(*)::bigint as total_orders,
      count(*) filter (
        where coalesce(orders.payment_status, 'pending') in ('pending', 'paid')
      )::bigint as pending_orders,
      count(*) filter (
        where coalesce(orders.deposit_amount, 0) > 0
          and coalesce(orders.payment_status, 'pending') not in ('failed', 'refunded')
      )::bigint as paid_orders,
      coalesce(
        sum(coalesce(orders.deposit_amount, 0)) filter (
          where coalesce(orders.payment_status, 'pending') not in ('failed', 'refunded')
        ),
        0
      )::numeric as total_deposit_amount,
      max(orders.created_at) as latest_order_at
    from orders
    where orders.zalo_user_id = trim(p_zalo_user_id)
  ),
  request_stats as (
    select
      count(*)::bigint as total_custom_requests,
      count(*) filter (
        where coalesce(custom_requests.status, 'pending') in ('pending', 'contacted')
      )::bigint as pending_custom_requests,
      max(custom_requests.created_at) as latest_custom_request_at
    from custom_requests
    where custom_requests.zalo_user_id = trim(p_zalo_user_id)
  )
  select
    target_profile.id as profile_id,
    trim(p_zalo_user_id) as zalo_user_id,
    target_profile.display_name,
    target_profile.avatar_url,
    target_profile.phone,
    order_stats.total_orders,
    order_stats.pending_orders,
    order_stats.paid_orders,
    order_stats.total_deposit_amount,
    order_stats.latest_order_at,
    request_stats.total_custom_requests,
    request_stats.pending_custom_requests,
    request_stats.latest_custom_request_at
  from order_stats
  cross join request_stats
  left join target_profile on true;
$$;

grant execute on function public.upsert_customer_profile(text, text, text, text) to anon, authenticated;
grant execute on function public.get_customer_account_summary(text) to anon, authenticated;

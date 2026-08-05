-- Yenni Crochet — feature tables after MVP
-- Run in Supabase Dashboard -> SQL Editor.
--
-- This file contains no secrets. It adds tables for:
-- - product categories
-- - promotions/offers
-- - customer account data
-- - saved addresses
-- - favorites
-- - order status timeline
-- - contact messages

-- =========================================
-- product_categories
-- =========================================
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products
add column if not exists category_id uuid references product_categories(id) on delete set null;

create index if not exists idx_product_categories_active_sort
on product_categories(is_active, sort_order);

create index if not exists idx_products_category_active
on products(category_id, is_active);

-- =========================================
-- promotions
-- =========================================
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  code text unique,
  discount_type text not null
    check (discount_type in ('percent', 'fixed_amount', 'free_shipping', 'gift')),
  discount_value integer not null default 0
    check (discount_value >= 0),
  min_order_value integer not null default 0
    check (min_order_value >= 0),
  banner_url text,
  campaign_id uuid references campaigns(id) on delete set null,
  start_date date not null,
  end_date date not null,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint promotions_end_after_start check (end_date >= start_date),
  constraint promotions_percent_value check (
    discount_type <> 'percent' or discount_value between 1 and 100
  )
);

create index if not exists idx_promotions_active_date
on promotions(is_active, start_date, end_date);

-- =========================================
-- customer_profiles
-- =========================================
create table if not exists customer_profiles (
  id uuid primary key default gen_random_uuid(),
  zalo_user_id text not null unique,
  display_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_profiles_zalo_user
on customer_profiles(zalo_user_id);

-- =========================================
-- customer_addresses
-- =========================================
create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  zalo_user_id text not null,
  receiver_name text not null,
  phone text not null,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_addresses_zalo_user
on customer_addresses(zalo_user_id);

-- =========================================
-- favorites
-- =========================================
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  zalo_user_id text not null,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint favorites_user_product_unique unique (zalo_user_id, product_id)
);

create index if not exists idx_favorites_zalo_user
on favorites(zalo_user_id);

-- =========================================
-- order_status_events
-- =========================================
create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null
    check (status in ('pending', 'confirmed', 'making', 'shipping', 'done', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_events_order_created
on order_status_events(order_id, created_at desc);

-- =========================================
-- contact_messages
-- =========================================
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  message text not null,
  zalo_user_id text,
  status text not null default 'new'
    check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_status_created
on contact_messages(status, created_at desc);

-- =========================================
-- RLS
-- =========================================
alter table product_categories enable row level security;
alter table promotions enable row level security;
alter table customer_profiles enable row level security;
alter table customer_addresses enable row level security;
alter table favorites enable row level security;
alter table order_status_events enable row level security;
alter table contact_messages enable row level security;

drop policy if exists "product_categories_public_read" on product_categories;
create policy "product_categories_public_read"
  on product_categories for select
  using (is_active = true);

drop policy if exists "promotions_public_read" on promotions;
create policy "promotions_public_read"
  on promotions for select
  using (
    is_active = true
    and current_date between start_date and end_date
    and (usage_limit is null or used_count < usage_limit)
  );

drop policy if exists "contact_messages_public_insert" on contact_messages;
create policy "contact_messages_public_insert"
  on contact_messages for insert
  with check (true);

-- These tables contain customer data. Keep them unreadable from anon clients
-- until Zalo auth / per-user RLS is implemented.
drop policy if exists "customer_profiles_public_insert" on customer_profiles;
create policy "customer_profiles_public_insert"
  on customer_profiles for insert
  with check (true);

drop policy if exists "customer_addresses_public_insert" on customer_addresses;
create policy "customer_addresses_public_insert"
  on customer_addresses for insert
  with check (true);

drop policy if exists "favorites_public_insert" on favorites;
create policy "favorites_public_insert"
  on favorites for insert
  with check (true);

-- Do not add public select policies for:
-- customer_profiles, customer_addresses, favorites, order_status_events.
-- They should become per-user readable only after auth is implemented.

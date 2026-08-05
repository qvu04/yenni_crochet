-- Yenni Crochet - cleanup unused MVP tables and sync core schema
-- Run manually in Supabase Dashboard -> SQL Editor after reviewing.
--
-- Current app uses:
-- products, campaigns, campaign_products, orders, order_items,
-- custom_requests, promotions, user_promotions.
--
-- The dropped tables below were planned for future admin/account features,
-- but the current app does not query them yet. Recreate them later when
-- those features are actually implemented.

begin;

-- =========================================
-- Drop unused/future tables
-- =========================================

-- Replaced by user_promotions in the current voucher flow.
drop table if exists public.promotion_redemptions cascade;

-- Not used by the current product/order UI.
drop table if exists public.product_price_tiers cascade;

-- Future account/auth features. Keep deleted until per-user auth/RLS is ready.
drop table if exists public.favorites cascade;
drop table if exists public.customer_addresses cascade;
drop table if exists public.customer_profiles cascade;

-- Future contact form/admin inbox. Current contact page uses direct links/copy.
drop table if exists public.contact_messages cascade;

-- Future admin order timeline. Current order status lives directly on orders.
drop table if exists public.order_status_events cascade;

-- Not used by the current UI. Product grouping is currently product_type.
alter table public.products
drop column if exists category_id;

drop table if exists public.product_categories cascade;

-- =========================================
-- Sync products with current frontend
-- =========================================

alter table public.products
add column if not exists product_type text,
add column if not exists is_pre_order boolean default false;

update public.products
set is_pre_order = false
where is_pre_order is null;

alter table public.products
alter column is_pre_order set default false,
alter column is_pre_order set not null;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = con.connamespace
    where nsp.nspname = 'public'
      and rel.relname = 'products'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%product_type%'
  loop
    execute format('alter table public.products drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.products
add constraint products_product_type_check
check (product_type is null or product_type in ('best_seller', 'new', 'pre_order'));

create index if not exists idx_products_type_active
on public.products(product_type, is_active);

-- =========================================
-- Sync custom_requests with current custom form
-- =========================================

alter table public.custom_requests
add column if not exists quantity integer default 1,
add column if not exists occasion text,
add column if not exists preferred_colors text,
add column if not exists note text;

update public.custom_requests
set quantity = 1
where quantity is null;

alter table public.custom_requests
alter column quantity set default 1,
alter column quantity set not null;

do $$
begin
  alter table public.custom_requests
    add constraint custom_requests_quantity_positive
    check (quantity > 0);
exception
  when duplicate_object then null;
end $$;

-- These fields were removed from the current UX.
alter table public.custom_requests
drop column if exists expected_date,
drop column if exists budget_range;

-- =========================================
-- Sync promotions with current voucher flow
-- =========================================

alter table public.promotions
add column if not exists max_order_value integer,
add column if not exists max_discount_value integer;

-- Older draft SQL used fixed_amount/gift. Current frontend supports:
-- percent, fixed, free_shipping.
update public.promotions
set discount_type = 'fixed'
where discount_type = 'fixed_amount';

update public.promotions
set discount_type = 'fixed'
where discount_type = 'gift';

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = con.connamespace
    where nsp.nspname = 'public'
      and rel.relname = 'promotions'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) like '%discount_type%'
  loop
    execute format('alter table public.promotions drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.promotions
add constraint promotions_discount_type_check
check (discount_type in ('percent', 'fixed', 'free_shipping'));

do $$
begin
  alter table public.promotions
    add constraint promotions_max_order_value_positive
    check (max_order_value is null or max_order_value >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.promotions
    add constraint promotions_max_discount_value_positive
    check (max_discount_value is null or max_discount_value >= 0);
exception
  when duplicate_object then null;
end $$;

-- =========================================
-- Sync orders with current cart + voucher checkout
-- =========================================

alter table public.orders
add column if not exists promotion_id uuid references public.promotions(id) on delete set null,
add column if not exists subtotal_price integer,
add column if not exists discount_amount integer not null default 0,
add column if not exists final_price integer;

create index if not exists idx_orders_promotion
on public.orders(promotion_id);

commit;

-- Yenni Crochet - product variants
-- Run manually in Supabase Dashboard -> SQL Editor before updating frontend code.
--
-- Goal:
-- - A product can have variants, for example colors.
-- - Each variant can have its own images, price override, and stock.
-- - Cart checkout supports items with or without variant_id.

begin;

-- =========================================
-- product_variants
-- =========================================

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  color_name text,
  color_hex text,
  images text[] not null default '{}',
  price integer,
  stock_quantity integer not null default 0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),

  constraint product_variants_price_non_negative
    check (price is null or price >= 0),
  constraint product_variants_stock_non_negative
    check (stock_quantity >= 0),
  constraint product_variants_color_hex_format
    check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

create index if not exists idx_product_variants_product_active_sort
on public.product_variants(product_id, is_active, sort_order);

create unique index if not exists product_variants_product_name_unique
on public.product_variants(product_id, lower(name));

alter table public.product_variants enable row level security;

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read"
  on public.product_variants
  for select
  using (is_active = true);

-- Keep products.stock_quantity as the total stock of active variants.
-- Variant stock is the source of truth once a product has variants.
create or replace function public.sync_product_stock_from_variants(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products p
  set stock_quantity = coalesce((
    select sum(pv.stock_quantity)
    from public.product_variants pv
    where pv.product_id = p_product_id
      and pv.is_active is true
  ), p.stock_quantity)
  where p.id = p_product_id
    and exists (
      select 1
      from public.product_variants pv
      where pv.product_id = p_product_id
        and pv.is_active is true
    );
end;
$$;

create or replace function public.trg_sync_product_stock_from_variants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_product_stock_from_variants(coalesce(new.product_id, old.product_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_product_variants_sync_product_stock on public.product_variants;
create trigger trg_product_variants_sync_product_stock
  after insert or update or delete on public.product_variants
  for each row
  execute function public.trg_sync_product_stock_from_variants();

update public.products p
set stock_quantity = variant_stock.total_stock
from (
  select product_id, sum(stock_quantity)::integer as total_stock
  from public.product_variants
  where is_active is true
  group by product_id
) variant_stock
where p.id = variant_stock.product_id;

-- =========================================
-- order_items variant snapshot
-- =========================================

alter table public.order_items
add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
add column if not exists variant_name text,
add column if not exists variant_color_name text,
add column if not exists variant_image text;

create index if not exists order_items_variant_id_idx
on public.order_items(variant_id);

-- Prevent duplicate same product + variant rows inside one order.
-- This stays safe with null variant_id by normalizing null to a sentinel uuid.
create unique index if not exists order_items_order_product_variant_unique
on public.order_items(
  order_id,
  product_id,
  coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Keep the older single-product order trigger compatible with cart orders.
-- Cart orders insert orders.product_id = null and decrement stock inside the RPC.
-- Single-product orders can still use this trigger if that old flow exists.
create or replace function public.decrement_product_stock()
returns trigger as $$
begin
  if new.product_id is null then
    return new;
  end if;

  update public.products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id
    and stock_quantity >= new.quantity;

  if not found then
    raise exception 'Sản phẩm không đủ tồn kho';
  end if;

  return new;
end;
$$ language plpgsql;

-- =========================================
-- Cart checkout RPC with variants
-- =========================================

create or replace function public.create_cart_order_with_promotion(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text default null,
  p_zalo_user_id text default null,
  p_promotion_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_subtotal integer := 0;
  v_discount_amount integer := 0;
  v_final_price integer := 0;
  v_total_quantity integer := 0;
  v_promotion promotions%rowtype;
  v_user_promotion_id uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Giỏ hàng đang trống';
  end if;

  create temporary table tmp_cart_items (
    product_id uuid not null,
    variant_id uuid,
    quantity integer not null,
    note text
  ) on commit drop;

  insert into tmp_cart_items (product_id, variant_id, quantity, note)
  select
    (item->>'product_id')::uuid,
    nullif(item->>'variant_id', '')::uuid,
    sum((item->>'quantity')::integer),
    nullif(string_agg(nullif(item->>'note', ''), '; '), '')
  from jsonb_array_elements(p_items) as item
  group by
    (item->>'product_id')::uuid,
    nullif(item->>'variant_id', '')::uuid;

  if exists (select 1 from tmp_cart_items where quantity <= 0) then
    raise exception 'Số lượng sản phẩm không hợp lệ';
  end if;

  if exists (
    select 1
    from tmp_cart_items ci
    left join products p on p.id = ci.product_id
    where p.id is null or p.is_active is not true
  ) then
    raise exception 'Có sản phẩm không còn khả dụng';
  end if;

  if exists (
    select 1
    from tmp_cart_items ci
    left join product_variants pv on pv.id = ci.variant_id
    where ci.variant_id is not null
      and (
        pv.id is null
        or pv.product_id <> ci.product_id
        or pv.is_active is not true
      )
  ) then
    raise exception 'Có phân loại sản phẩm không còn khả dụng';
  end if;

  perform 1
  from products p
  join tmp_cart_items ci on ci.product_id = p.id
  where ci.variant_id is null
  for update of p;

  perform 1
  from product_variants pv
  join tmp_cart_items ci on ci.variant_id = pv.id
  for update of pv;

  if exists (
    select 1
    from tmp_cart_items ci
    join products p on p.id = ci.product_id
    where ci.variant_id is null
      and p.stock_quantity < ci.quantity
  ) then
    raise exception 'Sản phẩm không đủ tồn kho';
  end if;

  if exists (
    select 1
    from tmp_cart_items ci
    join product_variants pv on pv.id = ci.variant_id
    where pv.stock_quantity < ci.quantity
  ) then
    raise exception 'Phân loại sản phẩm không đủ tồn kho';
  end if;

  select
    coalesce(sum(coalesce(pv.price, p.price)::integer * ci.quantity), 0)::integer,
    coalesce(sum(ci.quantity), 0)::integer
  into v_subtotal, v_total_quantity
  from tmp_cart_items ci
  join products p on p.id = ci.product_id
  left join product_variants pv on pv.id = ci.variant_id;

  v_final_price := v_subtotal;

  if p_promotion_id is not null then
    select p.*
    into v_promotion
    from promotions p
    where p.id = p_promotion_id
      and p.is_active is true
      and p.start_date <= current_date
      and p.end_date >= current_date
      and (p.usage_limit is null or p.used_count < p.usage_limit)
    for update;

    if not found then
      raise exception 'Voucher không khả dụng';
    end if;

    select up.id
    into v_user_promotion_id
    from user_promotions up
    where up.promotion_id = p_promotion_id
      and up.zalo_user_id = p_zalo_user_id
      and up.status = 'claimed'
    for update;

    if v_user_promotion_id is null then
      raise exception 'Voucher chưa được đổi hoặc đã sử dụng';
    end if;

    if v_promotion.min_order_value is not null and v_subtotal < v_promotion.min_order_value then
      raise exception 'Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher';
    end if;

    if v_promotion.max_order_value is not null and v_subtotal > v_promotion.max_order_value then
      raise exception 'Đơn hàng vượt giá trị tối đa để dùng voucher';
    end if;

    if v_promotion.discount_type = 'percent' then
      v_discount_amount := floor(v_subtotal * v_promotion.discount_value / 100.0)::integer;
      if v_promotion.max_discount_value is not null then
        v_discount_amount := least(v_discount_amount, v_promotion.max_discount_value);
      end if;
    elsif v_promotion.discount_type = 'fixed' then
      v_discount_amount := v_promotion.discount_value;
    else
      v_discount_amount := 0;
    end if;

    v_discount_amount := least(v_discount_amount, v_subtotal);
    v_final_price := v_subtotal - v_discount_amount;
  end if;

  insert into orders (
    product_id,
    quantity,
    customer_name,
    phone,
    address,
    note,
    zalo_user_id,
    promotion_id,
    subtotal_price,
    discount_amount,
    final_price,
    status
  )
  values (
    null,
    v_total_quantity,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    nullif(trim(coalesce(p_note, '')), ''),
    p_zalo_user_id,
    p_promotion_id,
    v_subtotal,
    v_discount_amount,
    v_final_price,
    'pending'
  )
  returning id into v_order_id;

  insert into order_items (
    order_id,
    product_id,
    variant_id,
    variant_name,
    variant_color_name,
    variant_image,
    quantity,
    unit_price,
    note
  )
  select
    v_order_id,
    ci.product_id,
    ci.variant_id,
    pv.name,
    pv.color_name,
    pv.images[1],
    ci.quantity,
    coalesce(pv.price, p.price)::integer,
    ci.note
  from tmp_cart_items ci
  join products p on p.id = ci.product_id
  left join product_variants pv on pv.id = ci.variant_id;

  update products p
  set stock_quantity = p.stock_quantity - ci.quantity
  from tmp_cart_items ci
  where p.id = ci.product_id
    and ci.variant_id is null;

  update product_variants pv
  set stock_quantity = pv.stock_quantity - ci.quantity
  from tmp_cart_items ci
  where pv.id = ci.variant_id;

  if p_promotion_id is not null then
    update user_promotions
    set status = 'used',
        used_at = now(),
        order_id = v_order_id
    where id = v_user_promotion_id;

    update promotions
    set used_count = used_count + 1
    where id = p_promotion_id;
  end if;

  return v_order_id;
end;
$$;

grant execute on function public.create_cart_order_with_promotion(
  jsonb,
  text,
  text,
  text,
  text,
  text,
  uuid
) to anon, authenticated;

commit;

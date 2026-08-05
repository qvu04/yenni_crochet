-- Cart checkout support: one order can contain many products.
-- Run this in Supabase SQL Editor before deploying the frontend cart flow.

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  total_price integer generated always as (quantity * unit_price) stored,
  note text,
  created_at timestamptz default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

alter table public.order_items enable row level security;

drop policy if exists "order_items_no_public_select" on public.order_items;
create policy "order_items_no_public_select"
on public.order_items
for select
to anon, authenticated
using (false);

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
    quantity integer not null,
    note text
  ) on commit drop;

  insert into tmp_cart_items (product_id, quantity, note)
  select
    (item->>'product_id')::uuid,
    sum((item->>'quantity')::integer),
    nullif(string_agg(nullif(item->>'note', ''), '; '), '')
  from jsonb_array_elements(p_items) as item
  group by (item->>'product_id')::uuid;

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

  perform 1
  from products p
  join tmp_cart_items ci on ci.product_id = p.id
  for update of p;

  if exists (
    select 1
    from tmp_cart_items ci
    join products p on p.id = ci.product_id
    where p.stock_quantity < ci.quantity
  ) then
    raise exception 'Sản phẩm không đủ tồn kho';
  end if;

  select
    coalesce(sum(p.price * ci.quantity), 0)::integer,
    coalesce(sum(ci.quantity), 0)::integer
  into v_subtotal, v_total_quantity
  from tmp_cart_items ci
  join products p on p.id = ci.product_id;

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

  insert into order_items (order_id, product_id, quantity, unit_price, note)
  select v_order_id, ci.product_id, ci.quantity, p.price, ci.note
  from tmp_cart_items ci
  join products p on p.id = ci.product_id;

  update products p
  set stock_quantity = p.stock_quantity - ci.quantity
  from tmp_cart_items ci
  where p.id = ci.product_id;

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

-- Deposit checkout support for cart orders.
-- Run this after the existing cart/order item SQL files.

alter table public.orders
add column if not exists payment_type text not null default 'deposit',
add column if not exists payment_status text not null default 'pending',
add column if not exists deposit_rate numeric(5, 4),
add column if not exists deposit_amount integer not null default 0,
add column if not exists remaining_amount integer not null default 0,
add column if not exists checkout_order_id text,
add column if not exists checkout_transaction_id text,
add column if not exists checkout_message_token text,
add column if not exists paid_at timestamptz,
add column if not exists delivery_latitude numeric,
add column if not exists delivery_longitude numeric,
add column if not exists delivery_location_accuracy numeric,
add column if not exists delivery_location_token text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_type_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_type_check
      check (payment_type in ('deposit', 'full', 'none'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('pending', 'paid', 'failed', 'refunded'));
  end if;
end $$;

create index if not exists idx_orders_payment_status
on public.orders(payment_status);

create unique index if not exists idx_orders_checkout_order_id
on public.orders(checkout_order_id)
where checkout_order_id is not null;

drop function if exists public.create_cart_order_with_promotion(
  jsonb,
  text,
  text,
  text,
  text,
  text,
  uuid
);

drop function if exists public.create_cart_order_with_promotion(
  jsonb,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  text,
  numeric,
  integer,
  integer,
  text,
  text,
  text
);

create or replace function public.create_cart_order_with_promotion(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text default null,
  p_zalo_user_id text default null,
  p_promotion_id uuid default null,
  p_payment_type text default 'deposit',
  p_payment_status text default 'paid',
  p_deposit_rate numeric default null,
  p_deposit_amount integer default 0,
  p_remaining_amount integer default 0,
  p_checkout_order_id text default null,
  p_checkout_transaction_id text default null,
  p_checkout_message_token text default null,
  p_delivery_latitude numeric default null,
  p_delivery_longitude numeric default null,
  p_delivery_location_accuracy numeric default null,
  p_delivery_location_token text default null
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
  v_payment_type text := coalesce(nullif(trim(p_payment_type), ''), 'deposit');
  v_payment_status text := coalesce(nullif(trim(p_payment_status), ''), 'paid');
  v_order_status text;
  v_deposit_amount integer := greatest(coalesce(p_deposit_amount, 0), 0);
  v_remaining_amount integer := greatest(coalesce(p_remaining_amount, 0), 0);
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Giỏ hàng đang trống';
  end if;

  if v_payment_type not in ('deposit', 'full', 'none') then
    raise exception 'Loại thanh toán không hợp lệ';
  end if;

  if v_payment_status not in ('pending', 'paid', 'failed', 'refunded') then
    raise exception 'Trạng thái thanh toán không hợp lệ';
  end if;

  v_order_status := case
    when v_payment_status = 'paid' then 'awaiting_confirmation'
    else 'pending'
  end;

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

  if v_deposit_amount > v_final_price then
    raise exception 'Tiền cọc vượt quá tổng đơn';
  end if;

  if v_remaining_amount <> v_final_price - v_deposit_amount then
    v_remaining_amount := greatest(v_final_price - v_deposit_amount, 0);
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
    payment_type,
    payment_status,
    deposit_rate,
    deposit_amount,
    remaining_amount,
    checkout_order_id,
    checkout_transaction_id,
    checkout_message_token,
    paid_at,
    delivery_latitude,
    delivery_longitude,
    delivery_location_accuracy,
    delivery_location_token,
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
    v_payment_type,
    v_payment_status,
    p_deposit_rate,
    v_deposit_amount,
    v_remaining_amount,
    nullif(trim(coalesce(p_checkout_order_id, '')), ''),
    nullif(trim(coalesce(p_checkout_transaction_id, '')), ''),
    nullif(trim(coalesce(p_checkout_message_token, '')), ''),
    case when v_payment_status = 'paid' then now() else null end,
    p_delivery_latitude,
    p_delivery_longitude,
    p_delivery_location_accuracy,
    nullif(trim(coalesce(p_delivery_location_token, '')), ''),
    v_order_status
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
  uuid,
  text,
  text,
  numeric,
  integer,
  integer,
  text,
  text,
  text,
  numeric,
  numeric,
  numeric,
  text
) to anon, authenticated;

-- Secure checkout migration
-- Run after order-deposit-checkout.sql (and the latest product/order RPC migration).
--
-- The old create_cart_order_with_promotion RPC accepts payment fields from the
-- browser. Keep it for compatibility, but remove public access and expose this
-- smaller wrapper to the Mini App instead. The wrapper always creates a pending
-- order and calculates the payment amount in the database.

revoke all on function public.create_cart_order_with_promotion(
  jsonb, text, text, text, text, text, uuid, text, text, numeric, integer,
  integer, integer, text, text, text, numeric, numeric, numeric, text
) from anon, authenticated;

alter table public.orders
  add column if not exists payment_expires_at timestamptz,
  add column if not exists stock_released_at timestamptz;

create index if not exists idx_orders_pending_payment_expiry
on public.orders(status, payment_status, payment_expires_at)
where status = 'pending' and payment_status in ('pending', 'failed');

create or replace function public.create_pending_cart_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text default null,
  p_zalo_user_id text default null,
  p_promotion_id uuid default null,
  p_payment_type text default 'deposit',
  p_deposit_rate numeric default 0.3,
  p_checkout_order_id text default null,
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
  v_payment_type text := coalesce(nullif(trim(p_payment_type), ''), 'deposit');
  v_deposit_rate numeric := coalesce(p_deposit_rate, 0.3);
  v_payable_amount integer;
  v_deposit_amount integer;
begin
  if v_payment_type not in ('deposit', 'full') then
    raise exception 'Loại thanh toán không hợp lệ';
  end if;

  if nullif(trim(coalesce(p_zalo_user_id, '')), '') is null then
    raise exception 'Thiếu định danh khách hàng';
  end if;

  if v_deposit_rate < 0 or v_deposit_rate > 1 then
    raise exception 'Tỷ lệ đặt cọc không hợp lệ';
  end if;

  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 120
    or length(trim(coalesce(p_phone, ''))) not between 10 and 13
    or length(trim(coalesce(p_address, ''))) not between 8 and 500
    or length(coalesce(p_note, '')) > 500 then
    raise exception 'Thông tin người nhận không hợp lệ';
  end if;

  -- The old RPC remains the single source of truth for product prices,
  -- promotion validation and stock locking. It receives only server-owned
  -- payment values here.
  select public.create_cart_order_with_promotion(
    p_items,
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    p_note,
    p_zalo_user_id,
    p_promotion_id,
    'none',                 -- never mark a new order as paid
    'pending',
    0,
    0,
    0,
    30000,                  -- server-owned shipping fee
    nullif(trim(coalesce(p_checkout_order_id, '')), ''),
    null,
    null,
    p_delivery_latitude,
    p_delivery_longitude,
    p_delivery_location_accuracy,
    p_delivery_location_token
  ) into v_order_id;

  select (o.final_price + o.shipping_fee)::integer
  into v_payable_amount
  from public.orders o
  where o.id = v_order_id;

  if v_payment_type = 'full' then
    v_deposit_amount := v_payable_amount;
  else
    v_deposit_amount := least(
      greatest(ceil((v_payable_amount - 30000) * v_deposit_rate / 1000.0) * 1000, 10000),
      200000,
      v_payable_amount
    );
  end if;

  update public.orders
  set payment_type = v_payment_type,
      deposit_rate = case when v_payment_type = 'full' then 1 else v_deposit_rate end,
      deposit_amount = v_deposit_amount,
      remaining_amount = greatest(v_payable_amount - v_deposit_amount, 0),
      payment_expires_at = now() + interval '30 minutes'
  where id = v_order_id;

  return v_order_id;
end;
$$;

revoke all on function public.create_pending_cart_order(
  jsonb, text, text, text, text, text, uuid, text, numeric, text,
  numeric, numeric, numeric, text
) from public;
grant execute on function public.create_pending_cart_order(
  jsonb, text, text, text, text, text, uuid, text, numeric, text,
  numeric, numeric, numeric, text
) to anon, authenticated;

-- Reuse the same pending order when the customer retries payment from order
-- history. This never changes prices or stock and only replaces the checkout
-- session identifier.
create or replace function public.attach_pending_checkout_order(
  p_order_id uuid,
  p_zalo_user_id text,
  p_checkout_order_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_callback_result integer;
  v_callback_amount integer;
  v_payable_amount integer;
  v_expected_amount integer;
begin
  if nullif(trim(coalesce(p_checkout_order_id, '')), '') is null then
    raise exception 'Thiếu mã checkout';
  end if;

  if nullif(trim(coalesce(p_zalo_user_id, '')), '') is null then
    raise exception 'Thiếu định danh khách hàng';
  end if;

  update public.orders
  set checkout_order_id = trim(p_checkout_order_id),
      checkout_transaction_id = null,
      payment_status = 'pending',
      paid_at = null,
      payment_expires_at = now() + interval '30 minutes'
  where id = p_order_id
    and status = 'pending'
    and payment_status in ('pending', 'failed')
    and (payment_expires_at is null or payment_expires_at > now())
    and zalo_user_id = trim(p_zalo_user_id);

  if not found then
    raise exception 'Đơn hàng không còn chờ thanh toán';
  end if;

  -- Close the small race where Zalo sends the callback before this RPC finishes
  -- attaching the checkout id to the order.
  if to_regclass('public.zalo_checkout_callbacks') is not null then
    execute $query$
      select result_code, amount
      from public.zalo_checkout_callbacks
      where checkout_order_id = $1
        and is_verified = true
      order by received_at desc
      limit 1
    $query$
    into v_callback_result, v_callback_amount
    using trim(p_checkout_order_id);

    select (final_price + shipping_fee)::integer,
           case when payment_type = 'full' then (final_price + shipping_fee)::integer else deposit_amount end
    into v_payable_amount, v_expected_amount
    from public.orders
    where id = p_order_id;

    if v_callback_result = 1 and v_callback_amount = v_expected_amount then
      update public.orders
      set payment_status = 'paid',
          status = 'awaiting_confirmation',
          deposit_amount = v_callback_amount,
          remaining_amount = greatest(v_payable_amount - v_callback_amount, 0),
          paid_at = now()
      where id = p_order_id;
    end if;
  end if;
end;
$$;

revoke all on function public.attach_pending_checkout_order(uuid, text, text) from public;
grant execute on function public.attach_pending_checkout_order(uuid, text, text) to anon, authenticated;

-- Release inventory for unpaid orders after their 30-minute reservation.
-- Schedule this function from pg_cron or an external scheduler in production.
create or replace function public.expire_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_order record;
  order_item record;
  expired_count integer := 0;
begin
  for expired_order in
    select id
    from public.orders
    where status = 'pending'
      and payment_status in ('pending', 'failed')
      and payment_expires_at is not null
      and payment_expires_at <= now()
      and stock_released_at is null
    for update skip locked
  loop
    for order_item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = expired_order.id
    loop
      if order_item.variant_id is null then
        update public.products
        set stock_quantity = stock_quantity + order_item.quantity
        where id = order_item.product_id;
      else
        update public.product_variants
        set stock_quantity = stock_quantity + order_item.quantity
        where id = order_item.variant_id;
      end if;
    end loop;

    update public.orders
    set status = 'cancelled',
        stock_released_at = now()
    where id = expired_order.id;

    expired_count := expired_count + 1;
  end loop;

  return expired_count;
end;
$$;

revoke all on function public.expire_pending_orders() from public;

-- Customer order history must not be callable anonymously. Re-enable it only
-- after the Zalo access token has been exchanged for a verified Supabase JWT.
revoke execute on function public.get_user_order_history(text, text) from anon;
revoke execute on function public.get_user_order_detail(text, uuid) from anon;

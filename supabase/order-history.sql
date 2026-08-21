-- Yenni Crochet - customer order history
-- Run in Supabase Dashboard -> SQL Editor after orders/order_items/products exist.

create index if not exists idx_orders_zalo_user_status_created
on orders(zalo_user_id, status, created_at desc);

create index if not exists idx_order_items_order_id
on order_items(order_id);

drop function if exists public.get_user_order_history(text, text);

create or replace function public.get_user_order_history(
  p_zalo_user_id text,
  p_status text default null
)
returns table (
  id uuid,
  created_at timestamptz,
  status text,
  payment_status text,
  payment_type text,
  customer_name text,
  phone text,
  address text,
  note text,
  subtotal_price integer,
  discount_amount integer,
  final_price integer,
  shipping_fee integer,
  deposit_amount integer,
  remaining_amount integer,
  paid_at timestamptz,
  items jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    orders.id,
    orders.created_at,
    orders.status,
    orders.payment_status,
    orders.payment_type,
    orders.customer_name,
    orders.phone,
    orders.address,
    orders.note,
    coalesce(orders.subtotal_price, 0)::integer as subtotal_price,
    coalesce(orders.discount_amount, 0)::integer as discount_amount,
    coalesce(orders.final_price, 0)::integer as final_price,
    coalesce(orders.shipping_fee, 0)::integer as shipping_fee,
    coalesce(orders.deposit_amount, 0)::integer as deposit_amount,
    coalesce(orders.remaining_amount, 0)::integer as remaining_amount,
    orders.paid_at,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', order_items.id,
          'product_id', order_items.product_id,
          'variant_id', order_items.variant_id,
          'variant_name', order_items.variant_name,
          'variant_color_name', order_items.variant_color_name,
          'variant_image', order_items.variant_image,
          'quantity', order_items.quantity,
          'unit_price', order_items.unit_price,
          'total_price', coalesce(order_items.total_price, order_items.unit_price * order_items.quantity),
          'note', order_items.note,
          'product_name', products.name,
          'product_image', coalesce(order_items.variant_image, products.images[1])
        )
        order by order_items.created_at asc
      ) filter (where order_items.id is not null),
      '[]'::jsonb
    ) as items
  from orders
  left join order_items on order_items.order_id = orders.id
  left join products on products.id = order_items.product_id
  where orders.zalo_user_id = trim(p_zalo_user_id)
    and (
      p_status is null
      or p_status = 'all'
      or orders.status = p_status
      or (p_status = 'shipping' and orders.status = 'delivering')
      or (p_status = 'done' and orders.status = 'completed')
      or (p_status = 'cancelled' and orders.status = 'canceled')
      or (p_status = 'waiting_payment' and orders.status = 'pending' and orders.payment_status = 'pending')
      or (p_status = 'paid_deposit' and (
        orders.status = 'awaiting_confirmation'
        or (orders.status = 'pending' and orders.payment_status = 'paid')
      ))
    )
  group by orders.id
  order by orders.created_at desc;
$$;

drop function if exists public.get_user_order_detail(text, uuid);

create or replace function public.get_user_order_detail(
  p_zalo_user_id text,
  p_order_id uuid
)
returns table (
  id uuid,
  created_at timestamptz,
  status text,
  payment_status text,
  payment_type text,
  customer_name text,
  phone text,
  address text,
  note text,
  subtotal_price integer,
  discount_amount integer,
  final_price integer,
  shipping_fee integer,
  deposit_amount integer,
  remaining_amount integer,
  paid_at timestamptz,
  delivery_latitude numeric,
  delivery_longitude numeric,
  delivery_location_accuracy numeric,
  delivery_location_token text,
  items jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    orders.id,
    orders.created_at,
    orders.status,
    orders.payment_status,
    orders.payment_type,
    orders.customer_name,
    orders.phone,
    orders.address,
    orders.note,
    coalesce(orders.subtotal_price, 0)::integer as subtotal_price,
    coalesce(orders.discount_amount, 0)::integer as discount_amount,
    coalesce(orders.final_price, 0)::integer as final_price,
    coalesce(orders.shipping_fee, 0)::integer as shipping_fee,
    coalesce(orders.deposit_amount, 0)::integer as deposit_amount,
    coalesce(orders.remaining_amount, 0)::integer as remaining_amount,
    orders.paid_at,
    orders.delivery_latitude,
    orders.delivery_longitude,
    orders.delivery_location_accuracy,
    orders.delivery_location_token,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', order_items.id,
          'product_id', order_items.product_id,
          'variant_id', order_items.variant_id,
          'variant_name', order_items.variant_name,
          'variant_color_name', order_items.variant_color_name,
          'variant_image', order_items.variant_image,
          'quantity', order_items.quantity,
          'unit_price', order_items.unit_price,
          'total_price', coalesce(order_items.total_price, order_items.unit_price * order_items.quantity),
          'note', order_items.note,
          'product_name', products.name,
          'product_image', coalesce(order_items.variant_image, products.images[1])
        )
        order by order_items.created_at asc
      ) filter (where order_items.id is not null),
      '[]'::jsonb
    ) as items
  from orders
  left join order_items on order_items.order_id = orders.id
  left join products on products.id = order_items.product_id
  where orders.zalo_user_id = trim(p_zalo_user_id)
    and orders.id = p_order_id
  group by orders.id
  limit 1;
$$;

grant execute on function public.get_user_order_history(text, text) to anon, authenticated;
grant execute on function public.get_user_order_detail(text, uuid) to anon, authenticated;

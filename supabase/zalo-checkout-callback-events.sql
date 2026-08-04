-- Checkout SDK callback audit log.
-- Run this before deploying `zalo-checkout-callback` if you want to persist callbacks.

create table if not exists public.zalo_checkout_callbacks (
  id uuid primary key default gen_random_uuid(),
  checkout_order_id text,
  checkout_transaction_id text,
  method text,
  result_code integer,
  amount integer,
  message text,
  is_verified boolean not null default false,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_zalo_checkout_callbacks_order_id
on public.zalo_checkout_callbacks(checkout_order_id);

create index if not exists idx_zalo_checkout_callbacks_received_at
on public.zalo_checkout_callbacks(received_at desc);

alter table public.zalo_checkout_callbacks enable row level security;

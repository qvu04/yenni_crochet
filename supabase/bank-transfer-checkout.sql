-- Manual bank-transfer checkout.
-- Run after order-deposit-checkout.sql, secure-checkout.sql and admin-auth.sql.

alter table public.orders
  add column if not exists bank_transfer_reference text,
  add column if not exists payment_submitted_at timestamptz;

-- A pending order has not paid anything yet. Keep deposit_amount as the amount
-- required for this payment, but expose the full order as remaining_amount
-- until an admin verifies the bank transfer.
create or replace function public.keep_pending_order_balance_consistent()
returns trigger
language plpgsql
as $$
begin
  if new.payment_status in ('pending', 'failed') and new.paid_at is null then
    new.remaining_amount := greatest(coalesce(new.final_price, 0) + coalesce(new.shipping_fee, 0), 0);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_keep_pending_order_balance_consistent on public.orders;
create trigger trg_keep_pending_order_balance_consistent
  before insert or update of payment_status, deposit_amount, remaining_amount, paid_at
  on public.orders
  for each row
  execute function public.keep_pending_order_balance_consistent();

update public.orders
set remaining_amount = greatest(coalesce(final_price, 0) + coalesce(shipping_fee, 0), 0)
where payment_status in ('pending', 'failed')
  and paid_at is null;

create or replace function public.submit_bank_transfer(
  p_order_id uuid,
  p_zalo_user_id text,
  p_transfer_reference text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(coalesce(p_zalo_user_id, '')), '') is null
    or trim(p_zalo_user_id) <> auth.jwt() ->> 'zalo_user_id' then
    raise exception 'Không xác thực được khách hàng';
  end if;

  update public.orders
  set bank_transfer_reference = nullif(trim(coalesce(p_transfer_reference, '')), ''),
      payment_submitted_at = now()
  where id = p_order_id
    and zalo_user_id = trim(p_zalo_user_id)
    and status = 'pending'
    and payment_status in ('pending', 'failed')
    and (payment_expires_at is null or payment_expires_at > now());

  if not found then
    raise exception 'Đơn hàng không còn chờ thanh toán hoặc đã hết hạn';
  end if;
end;
$$;

revoke all on function public.submit_bank_transfer(uuid, text, text) from public;
grant execute on function public.submit_bank_transfer(uuid, text, text) to anon, authenticated;

-- Shop calls this only after checking the bank statement. The amount must be
-- exactly the amount required by the order; the client can never mark itself
-- as paid through this function.
create or replace function public.confirm_bank_transfer(
  p_order_id uuid,
  p_paid_amount integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_expected_amount integer;
  v_paid_amount integer;
  v_payable_amount integer;
begin
  if not public.is_admin() then
    raise exception 'Không có quyền xác nhận thanh toán';
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found or v_order.status <> 'pending' then
    raise exception 'Đơn hàng không còn ở trạng thái chờ thanh toán';
  end if;

  v_payable_amount := coalesce(v_order.final_price, 0) + coalesce(v_order.shipping_fee, 0);
  v_expected_amount := case
    when v_order.payment_type = 'full' then v_payable_amount
    else coalesce(v_order.deposit_amount, 0)
  end;
  v_paid_amount := coalesce(p_paid_amount, v_expected_amount);

  if v_paid_amount <> v_expected_amount then
    raise exception 'Số tiền chuyển khoản không khớp số tiền cần thanh toán';
  end if;

  update public.orders
  set payment_status = 'paid',
      status = 'awaiting_confirmation',
      paid_at = now(),
      remaining_amount = greatest(v_payable_amount - v_paid_amount, 0)
  where id = p_order_id;
end;
$$;

revoke all on function public.confirm_bank_transfer(uuid, integer) from public;
grant execute on function public.confirm_bank_transfer(uuid, integer) to authenticated;

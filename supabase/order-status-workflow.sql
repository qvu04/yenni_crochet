-- Yenni Crochet - order workflow status constraint
-- Run in Supabase Dashboard -> SQL Editor if updating orders.status to
-- confirmed/making/shipping/done/cancelled is rejected.
-- It also accepts old aliases (delivering/completed/canceled) so older rows do
-- not block the migration; the Mini App maps them to the same UI states.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any(c.conkey)
    where c.conrelid = 'public.orders'::regclass
      and c.contype = 'c'
      and a.attname = 'status'
  loop
    execute format('alter table public.orders drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.orders
alter column status set default 'pending';

alter table public.orders
add constraint orders_status_check
check (status in (
  'pending',
  'confirmed',
  'making',
  'shipping',
  'delivering',
  'done',
  'completed',
  'cancelled',
  'canceled'
));

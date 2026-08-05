-- Yenni Crochet — trigger gọi Edge Function notify-order khi có đơn mới
-- Chạy SAU khi đã deploy function notify-order (xem TODO trong function).
-- Chạy trong Supabase Dashboard → SQL Editor.
--
-- Cách hoạt động: after-insert trigger trên `orders` dùng pg_net gửi HTTP POST
-- (bất đồng bộ, không block transaction) đến Edge Function. Insert đơn LUÔN
-- thành công kể cả khi gửi email lỗi — đúng yêu cầu "thông báo không được
-- làm fail việc tạo đơn".
--
-- THAY 2 GIÁ TRỊ trước khi chạy:
--   <PROJECT_REF>          : ref của project (Dashboard → Settings → General)
--   <ORDER_WEBHOOK_SECRET> : đúng chuỗi đã set qua `supabase secrets set`

create extension if not exists pg_net;

create or replace function notify_new_order()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://nexviypjwylaxjichtsw.supabase.co/functions/v1/notify-order',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'yenni_order_secret_123456'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'orders',
      'record', to_jsonb(new)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_new_order on orders;
create trigger trg_notify_new_order
  after insert on orders
  for each row
  execute function notify_new_order();

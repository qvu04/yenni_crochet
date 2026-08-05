-- Yenni Crochet — trigger gọi Edge Function notify-custom-request khi có yêu cầu đặt riêng mới
-- Chạy SAU khi đã deploy function notify-custom-request.
-- Chạy trong Supabase Dashboard -> SQL Editor.
--
-- THAY 2 GIÁ TRỊ trước khi chạy:
--   <PROJECT_REF>          : ref của project (Dashboard -> Settings -> General)
--   <ORDER_WEBHOOK_SECRET> : đúng chuỗi đã set trong Edge Function Secrets

create extension if not exists pg_net;

create or replace function notify_new_custom_request()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://nexviypjwylaxjichtsw.supabase.co/functions/v1/notify-custom-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'yenni_order_secret_123456'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'custom_requests',
      'record', to_jsonb(new)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notify_new_custom_request on custom_requests;
create trigger trg_notify_new_custom_request
  after insert on custom_requests
  for each row
  execute function notify_new_custom_request();

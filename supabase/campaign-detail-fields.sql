alter table campaigns
add column if not exists campaign_type text default 'collection',
add column if not exists subtitle text,
add column if not exists description text,
add column if not exists content text,
add column if not exists detail_image_url text,
add column if not exists event_location text,
add column if not exists start_at timestamptz,
add column if not exists end_at timestamptz,
add column if not exists cta_label text default 'Xem hàng ngay',
add column if not exists cta_action text default 'products',
add column if not exists is_active boolean default true;

do $$
begin
  alter table campaigns
    add constraint campaigns_campaign_type_check
    check (campaign_type in ('collection', 'event', 'promotion'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table campaigns
    add constraint campaigns_cta_action_check
    check (cta_action in ('products', 'contact', 'custom_request'));
exception
  when duplicate_object then null;
end $$;

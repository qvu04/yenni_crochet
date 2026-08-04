-- Yenni Crochet - wishlist/favorites
-- Run in Supabase Dashboard -> SQL Editor after products exists.

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  zalo_user_id text not null,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint favorites_user_product_unique unique (zalo_user_id, product_id)
);

create index if not exists idx_favorites_zalo_user
on favorites(zalo_user_id, created_at desc);

create index if not exists idx_favorites_product
on favorites(product_id);

alter table favorites enable row level security;

drop policy if exists "favorites_public_insert" on favorites;
create policy "favorites_public_insert"
  on favorites for insert
  with check (true);

create or replace function public.get_user_wishlist(
  p_zalo_user_id text
)
returns table (
  id uuid,
  product_id uuid,
  created_at timestamptz,
  product jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    favorites.id,
    favorites.product_id,
    favorites.created_at,
    to_jsonb(products.*) as product
  from favorites
  join products on products.id = favorites.product_id
  where favorites.zalo_user_id = trim(p_zalo_user_id)
    and products.is_active = true
  order by favorites.created_at desc;
$$;

create or replace function public.is_product_favorited(
  p_zalo_user_id text,
  p_product_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from favorites
    where favorites.zalo_user_id = trim(p_zalo_user_id)
      and favorites.product_id = p_product_id
  );
$$;

create or replace function public.toggle_favorite_product(
  p_zalo_user_id text,
  p_product_id uuid
)
returns table (
  product_id uuid,
  is_favorited boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted_product_id uuid;
begin
  if nullif(trim(p_zalo_user_id), '') is null then
    raise exception 'Missing Zalo user id' using errcode = '22023';
  end if;

  delete from favorites
  where favorites.zalo_user_id = trim(p_zalo_user_id)
    and favorites.product_id = p_product_id
  returning favorites.product_id into v_deleted_product_id;

  if v_deleted_product_id is not null then
    return query select p_product_id, false;
    return;
  end if;

  insert into favorites (zalo_user_id, product_id)
  values (trim(p_zalo_user_id), p_product_id)
  on conflict on constraint favorites_user_product_unique do nothing;

  return query select p_product_id, true;
end;
$$;

grant execute on function public.get_user_wishlist(text) to anon, authenticated;
grant execute on function public.is_product_favorited(text, uuid) to anon, authenticated;
grant execute on function public.toggle_favorite_product(text, uuid) to anon, authenticated;

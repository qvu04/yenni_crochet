-- Chạy file này trên database ĐÃ CÓ SẴN dữ liệu.
-- Mục tiêu:
-- - product_type chỉ còn: best_seller, pre_order
-- - null nghĩa là sản phẩm thường, vẫn xuất hiện trong "Tất cả sản phẩm"

alter table products
add column if not exists product_type text;

do $$
declare
  constraint_name text;
begin
  select con.conname
  into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = con.connamespace
  where nsp.nspname = 'public'
    and rel.relname = 'products'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%product_type%';

  if constraint_name is not null then
    execute format('alter table products drop constraint %I', constraint_name);
  end if;
end $$;

update products
set product_type = case product_type
  when 'retail' then 'best_seller'
  when 'wholesale' then 'pre_order'
  when 'blank' then null
  else product_type
end;

alter table products
add constraint products_product_type_check
check (product_type is null or product_type in ('best_seller', 'pre_order'));

create index if not exists idx_products_type_active
on products(product_type, is_active);

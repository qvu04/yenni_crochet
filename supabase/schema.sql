-- Yenni Crochet — schema cho MVP
-- Chạy trong Supabase Dashboard → SQL Editor → New query → paste và Run

-- =========================================
-- products
-- =========================================
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  images text[] default '{}',              -- danh sách URL ảnh (Supabase Storage)
  estimated_days text,                     -- vd "5-7 ngày" — hiển thị cho khách trước khi đặt
  allow_customization boolean default true, -- có hiện ô ghi chú tùy chỉnh (màu/tên...) không
  is_active boolean default true,          -- ẩn sản phẩm mà không cần xoá
  is_featured boolean default false,       -- giữ lại để tương thích dữ liệu cũ, FE hiện dùng product_type
  product_type text check (product_type in ('best_seller', 'pre_order')),
                                          -- null = sản phẩm thường, không thuộc row nổi bật riêng
  stock_quantity int not null default 0,   -- tồn kho thật — "hết hàng" = stock_quantity <= 0
  created_at timestamptz default now(),

  constraint stock_quantity_non_negative check (stock_quantity >= 0)
);

-- =========================================
-- campaigns
-- =========================================
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- vd "8/3", "Trung thu 2026"
  banner_url text,
  start_date date not null,
  end_date date not null,
  created_at timestamptz default now(),

  constraint end_after_start check (end_date >= start_date)
);

-- campaign <-> product là nhiều-nhiều: một campaign có nhiều sản phẩm nổi bật,
-- một sản phẩm có thể nổi bật ở nhiều campaign khác nhau
create table campaign_products (
  campaign_id uuid references campaigns(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (campaign_id, product_id)
);

-- =========================================
-- orders
-- =========================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  quantity int not null default 1,

  customer_name text not null,
  phone text not null,
  address text not null,
  note text,                         -- ghi chú tùy chỉnh: màu, tên thêu, yêu cầu riêng

  zalo_user_id text,                 -- để dành cho "đơn hàng của tôi" sau này — MVP chưa dùng

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'done', 'cancelled')),

  created_at timestamptz default now()
);

-- =========================================
-- custom_requests — yêu cầu thiết kế riêng, KHÔNG gắn với product_id
-- (tách khỏi `orders` vì: không có giá cố định, không có product_id/quantity
-- để trigger trừ tồn kho hoạt động — đây là "yêu cầu tư vấn", không phải đơn hàng)
-- =========================================
create table custom_requests (
  id uuid primary key default gen_random_uuid(),

  customer_name text not null,
  phone text not null,
  description text not null,          -- khách mô tả họ muốn làm gì
  reference_images text[] default '{}', -- ảnh mẫu khách muốn làm theo (tùy chọn)

  zalo_user_id text,                  -- để dành cho sau này, giống orders

  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'completed', 'cancelled')),
    -- pending: chưa liên hệ | contacted: đã gọi cho khách | completed/cancelled: đã chốt

  created_at timestamptz default now()
);

create index idx_custom_requests_status on custom_requests(status);

-- =========================================
-- Trigger: mỗi khi có đơn mới, tự trừ tồn kho ở database
-- (không để frontend tự trừ — 2 khách đặt cùng lúc dễ bị race condition,
-- database xử lý tuần tự từng transaction nên luôn đúng)
-- =========================================
create function decrement_product_stock()
returns trigger as $$
begin
  update products
  set stock_quantity = stock_quantity - new.quantity
  where id = new.product_id;

  if not found or (select stock_quantity from products where id = new.product_id) < 0 then
    raise exception 'Sản phẩm không đủ tồn kho';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_decrement_stock
  after insert on orders
  for each row
  execute function decrement_product_stock();

-- =========================================
-- Index cho các query hay dùng
-- =========================================
create index idx_orders_product on orders(product_id);
create index idx_orders_status on orders(status);
create index idx_campaigns_date_range on campaigns(start_date, end_date);
create index idx_products_type_active on products(product_type, is_active);

-- =========================================
-- Query mẫu: lấy campaign đang active hôm nay + sản phẩm nổi bật của nó
-- (app gọi cái này mỗi lần mở home)
-- =========================================
-- select c.*, p.*
-- from campaigns c
-- join campaign_products cp on cp.campaign_id = c.id
-- join products p on p.id = cp.product_id
-- where current_date between c.start_date and c.end_date;

-- Yenni Crochet — Row Level Security (RLS)
-- Chạy SAU schema.sql, trong Supabase Dashboard → SQL Editor
--
-- Vì sao cần file này: app chỉ dùng "anon key" — key này nằm ngay trong code
-- frontend nên bất kỳ ai cũng lấy được (mở DevTools là thấy). Nếu không bật RLS,
-- ai cầm anon key cũng đọc/sửa/xoá được toàn bộ dữ liệu qua API REST mà Supabase
-- tự sinh. RLS là luật viết ở tầng database, chặn theo TỪNG BẢNG, không phụ
-- thuộc code frontend có kiểm tra hay không.
--
-- Bạn (chủ shop) quản lý dữ liệu qua Supabase Dashboard, việc đó dùng
-- "service_role key" — key này BYPASS toàn bộ RLS, không cần policy riêng cho bạn.

-- =========================================
-- products — ai cũng đọc được, không ai ghi được qua app
-- =========================================
alter table products enable row level security;

create policy "products_public_read"
  on products for select
  using (true);

-- Không tạo policy insert/update/delete → mặc định bị chặn hết cho anon key.
-- Bạn sửa sản phẩm qua Supabase Dashboard (dùng service_role, không bị chặn).

-- =========================================
-- campaigns — giống products: đọc công khai, ghi qua Dashboard
-- =========================================
alter table campaigns enable row level security;

create policy "campaigns_public_read"
  on campaigns for select
  using (true);

-- =========================================
-- campaign_products — cần đọc được để join lấy sản phẩm nổi bật theo campaign
-- =========================================
alter table campaign_products enable row level security;

create policy "campaign_products_public_read"
  on campaign_products for select
  using (true);

-- =========================================
-- orders — khách được TẠO đơn (insert), nhưng KHÔNG được đọc đơn của ai cả
-- (kể cả đơn của chính mình) — tránh lộ SĐT/địa chỉ của khách khác
-- =========================================
alter table orders enable row level security;

create policy "orders_public_insert"
  on orders for insert
  with check (true);

-- Không có policy "select" cho orders → anon key không đọc được bảng này.
-- Bạn xem đơn qua Supabase Dashboard (service_role, không bị chặn).

-- =========================================
-- custom_requests — giống orders: khách TẠO được, không đọc được của ai
-- =========================================
alter table custom_requests enable row level security;

create policy "custom_requests_public_insert"
  on custom_requests for insert
  with check (true);

-- Không có policy "select" → anon key không đọc được. Bạn xem qua Dashboard.

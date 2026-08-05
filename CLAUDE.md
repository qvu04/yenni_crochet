# CLAUDE.md — Yenni Crochet

## 1. Dự án này làm gì?

**Yenni Crochet** là **Zalo Mini App** bán đồ handmade (crochet — móc len) theo mô hình **pre-order**:

1. Người dùng mở app trong Zalo → xem danh sách + chi tiết sản phẩm (ảnh, giá, mô tả, thời gian làm dự kiến "đặt trước 5-7 ngày").
2. Đặt hàng **trực tiếp từ trang sản phẩm** (MVP không có giỏ hàng): tên, SĐT, địa chỉ, số lượng, ghi chú tùy chỉnh (chọn màu, thêm tên riêng). Tên/SĐT lấy sẵn từ **Zalo API** (xin phép người dùng) — khách gần như không phải gõ gì.
3. Đơn hàng ghi vào bảng `orders` trên **Supabase**; chủ shop nhận thông báo đơn mới qua **email (Resend API)** — trigger `pg_net` trên `orders` gọi Edge Function `notify-order` (`supabase/functions/notify-order/`, trigger tại `supabase/notify-order-trigger.sql`).
4. **Campaigns theo dịp lễ** (8/3, 20/10, Valentine, Trung thu, Tết…): bảng `campaigns` chứa tên dịp, ngày bắt đầu/kết thúc, banner, sản phẩm nổi bật. App check ngày hiện tại → hiện banner + sản phẩm nổi bật lên đầu. Thêm dịp mới chỉ cần insert row — **không sửa code**.

Toàn bộ giao diện bằng **tiếng Việt**, tối ưu cho **mobile trong Zalo** (safe-area, bottom nav).

---

## 2. Stack công nghệ chính

### Runtime & Build
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.7 | Type safety (`npm run type-check`) |
| Vite + `zmp-vite-plugin` | 5.x | Build tool cho Zalo Mini App |
| Tailwind CSS + SCSS | 3.4 | Styling (`src/css/`) |

### Zalo Mini App
| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| `zmp-ui` | 1.11.11 (pin) | UI kit chính thức của Zalo |
| `zmp-sdk` | 2.47.2 (pin) | SDK: user info, phone, share, payment… |
| ZMP CLI | — | `zmp start` / `zmp build` / `zmp deploy` |

### Data & State
| Công nghệ | Vai trò |
|---|---|
| `@supabase/supabase-js` | Backend: bảng `products`, `orders`, `campaigns`; client tại `src/services/supabase.ts` |
| TanStack React Query | Server state / data fetching (`src/queries/`) |
| Zustand | Client state (`src/stores/`, ví dụ `productSheet.ts`) |
| React Router v6 | Routing — dùng **MemoryRouter** (bắt buộc với Zalo Mini App) |

### UI phụ trợ
antd-mobile, styled-components, motion (Framer Motion), react-icons.

---

## 3. Commands

```
npm run dev          # chạy trên browser (Vite)
zmp start            # chạy trên ZMP simulator
npm run type-check   # tsc --noEmit
zmp build            # build production
zmp deploy           # deploy lên Zalo
zmp login            # đăng nhập ZMP CLI
```

---

## 4. Cấu trúc thư mục

```
src/
  app.ts              # entry, mount React
  components/
    app.tsx           # root: Splash → AppProviders → MemoryRouter → routes
    Layout/           # AppHeader, BottomNav
    common/           # SplashScreen, ProductDetailSheet…
    ui/, icons/
  pages/              # home/, products/, cart/
  services/           # supabase.ts, products.ts, orders.ts, campaigns.ts
  queries/            # React Query hooks: products, orders, campaigns
  stores/             # Zustand stores (productSheet.ts)
  providers/          # AppProviders (React Query…)
  hooks/, utils/, types/, constant/, assets/, css/
supabase/             # config / Edge Functions
```

---

## 5. File không được đụng vào

Các file sau **tuyệt đối không sửa, xóa, hoặc commit** trừ khi có lý do rõ ràng và đã review kỹ:

```
# Biến môi trường — chứa secret keys (Supabase URL/key)
.env

# Template môi trường — không thêm giá trị thật vào đây
.env.example

# Lock file — không sửa tay, chỉ để package manager cập nhật
package-lock.json

# Config Zalo Mini App — sai sẽ hỏng build/deploy lên Zalo
zmp-cli.json
app-config.json

# Config build gốc — thay đổi ảnh hưởng toàn bộ app
vite.config.mts
tailwind.config.js
postcss.config.js
tsconfig.json
```

> **Không nâng version `zmp-ui` / `zmp-sdk`** tùy tiện — hai package này được pin version vì Zalo Mini App runtime rất nhạy với breaking change.

---

## 6. Coding Convention

### Chung
- Ngôn ngữ code: **tiếng Anh** (biến, hàm, comment kỹ thuật).
- Ngôn ngữ giao diện: **tiếng Việt** (label, placeholder, thông báo).
- TypeScript strict — không dùng `any` trừ khi bất khả kháng (ghi chú lý do).
- Không commit `console.log` debug còn sót.
- Mỗi file một việc (Single Responsibility).
- Chỉ comment "WHY" (quirk của Zalo SDK, workaround) — không comment "WHAT".

### Đặt tên
| Loại | Convention | Ví dụ |
|---|---|---|
| Biến / hàm | `camelCase` | `getProducts`, `activeCampaign` |
| Component React | `PascalCase` | `ProductDetailSheet`, `BottomNav` |
| File component | `PascalCase.tsx` hoặc theo thư mục hiện có | `Layout/AppHeader.tsx` |
| File service / store / hook | `camelCase.ts` | `productSheet.ts`, `orders.ts` |
| Hằng số | `UPPER_SNAKE_CASE` | `LEAD_TIME_DAYS` |
| Bảng / cột DB | `snake_case` | `orders`, `created_at` |

### Kiến trúc frontend
- **Functional component + hooks** — không dùng class component.
- Routing dùng **MemoryRouter**; routes hiện có: `/` (Home), `/products`.
- Chi tiết sản phẩm hiển thị qua **ProductDetailSheet** (bottom sheet global, điều khiển bởi Zustand store `productSheet.ts`) — **không phải route riêng**.
- Import path **tuyệt đối từ `src/`** (ví dụ `import { HomePage } from "pages/home"`).
- Phân tầng data: component → hook trong `queries/` (React Query) → hàm trong `services/` → Supabase. **Component không gọi Supabase trực tiếp.**
- Client state (UI state, sheet mở/đóng…) → Zustand. Server state (products, orders, campaigns) → React Query. Không trộn lẫn.
- Layout luôn có AppHeader + BottomNav; content phải chừa padding-bottom theo `--zaui-safe-area-inset-bottom`.
- Ưu tiên component từ `zmp-ui` trước, rồi mới đến antd-mobile / tự viết.
- Styling bằng Tailwind class — hạn chế styled-components cho code mới.

### Git
- Branch: `feature/<tên-ngắn>`, `fix/<tên-lỗi>`, `chore/<việc-vặt>`.
- Commit theo **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Không commit thẳng vào `main`.

---

## 7. Security Baseline

### 7.1 Secret & Biến môi trường
- **Không commit `.env`** — `.gitignore` phải có `.env*`.
- `.env.example` chỉ chứa placeholder, không chứa giá trị thật.
- Frontend chỉ được dùng **Supabase `anon` key** — tuyệt đối không nhúng `service_role` key vào Mini App (code client ai cũng đọc được).
- `service_role` key chỉ dùng trong **Supabase Edge Functions** (server-side), lưu qua Supabase secrets, không hardcode.

### 7.2 Supabase & Row Level Security (RLS)
- Bật **RLS trên mọi bảng**:
  - `products`, `campaigns`: public **read-only** — không cho client insert/update/delete.
  - `orders`: client chỉ được **insert**; đọc đơn chỉ giới hạn đơn của chính user (theo Zalo user ID) hoặc chỉ qua dashboard/Edge Function.
- Không expose thông tin khách (SĐT, địa chỉ) qua policy public.

### 7.3 Input Validation
- Validate form đặt hàng phía client **và** ràng buộc phía DB/Edge Function: SĐT đúng format VN, số lượng là số nguyên dương có giới hạn trên, ghi chú giới hạn độ dài.
- Không tin giá tiền từ client — giá lấy từ bảng `products` khi tính toán/xác nhận đơn.
- Không render HTML từ dữ liệu người dùng bằng `dangerouslySetInnerHTML`.

### 7.4 Zalo API & Privacy
- Tên/SĐT lấy từ Zalo API phải qua flow **xin phép người dùng** (`zmp-sdk` permission) — không tự ý thu thập.
- SĐT, địa chỉ là dữ liệu nhạy cảm: chỉ lưu vào `orders` khi khách bấm đặt hàng, không log ra console/analytics.
- Thông báo đơn qua Telegram/email: chỉ gửi thông tin tối thiểu cần thiết để xử lý đơn.

### 7.5 Dependency
- Chạy `npm audit` trước khi deploy — không deploy nếu còn lỗ hổng `high` / `critical`.
- Không tự ý nâng `zmp-ui` / `zmp-sdk` (xem mục 5).

---

## 8. Product Context & Roadmap

### MVP (từ README)
1. **Bán được hàng** — danh sách + chi tiết sản phẩm, form đặt hàng ghi vào `orders`, xem đơn qua Supabase dashboard.
2. **Biết có đơn ngay** — thông báo Telegram/email qua Edge Function.
3. **Campaigns** — banner + sản phẩm nổi bật theo dịp lễ (mở campaign sớm vài tuần vì khách phải đặt trước).
4. **Sau MVP** — Zalo OA notification, ZNS, trang quản lý đơn riêng.

### Nguyên tắc sản phẩm
- MVP **không có giỏ hàng** (thư mục `pages/cart/` để dành cho sau).
- Sau khi đặt hàng: màn "Đặt hàng thành công" + nút nhắn tin cho OA — chưa dùng ZNS (tốn phí, cần duyệt template).
- Quản lý đơn qua Supabase dashboard — chỉ build UI admin khi đơn nhiều.

### Hướng mở rộng (đã thống nhất)
- Ưu tiên cao: theo dõi trạng thái đơn hàng cho khách, Zalo OA/ZNS thông báo, tìm kiếm + lọc danh mục.
- Trung bình: wishlist, ảnh feedback từ khách, share qua Zalo, mã giảm giá theo campaign.
- Sau này: trang admin, giỏ hàng, thanh toán Zalo Pay.

---

## PRD (Product Requirements Document)
Xem chi tiết tại **[PRD.md](./PRD.md)**.

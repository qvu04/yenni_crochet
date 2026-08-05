# PRD — Yenni Crochet 🧶

> Product Requirements Document cho Zalo Mini App bán đồ handmade (crochet).
> Tài liệu kỹ thuật & convention: xem [CLAUDE.md](./CLAUDE.md).

---

## 1. Tổng quan

### 1.1 Vấn đề
Người bán đồ móc len handmade hiện chốt đơn thủ công qua chat Zalo/Facebook:
- Khách phải hỏi từng món: còn hàng không, giá bao nhiêu, làm mất bao lâu.
- Chủ shop phải gõ lại thông tin khách (tên, SĐT, địa chỉ) vào sổ/Excel — dễ sót, dễ sai.
- Mỗi dịp lễ (8/3, 20/10, Valentine, Trung thu, Tết) phải đăng bài quảng bá thủ công, khách đặt sát ngày thì không kịp làm (đồ handmade cần 5-7 ngày).

### 1.2 Giải pháp
Zalo Mini App cho phép khách **tự xem sản phẩm và đặt hàng trong 1-2 phút** ngay trong Zalo, không cần cài app, không cần đăng ký tài khoản:
- Tên/SĐT lấy sẵn từ Zalo API (có xin phép) — khách gần như không phải gõ gì.
- Đơn ghi thẳng vào Supabase, chủ shop nhận thông báo tức thì.
- Campaign theo dịp lễ tự bật/tắt theo ngày — không cần sửa code mỗi dịp.

### 1.3 Đối tượng người dùng
| Persona | Mô tả | Nhu cầu chính |
|---|---|---|
| **Khách mua** | Người dùng Zalo (đa số nữ, 18-35), mua tặng dịp lễ hoặc sưu tầm | Xem mẫu nhanh, đặt hàng ít thao tác, biết khi nào nhận được hàng |
| **Chủ shop** (Yenni) | Người làm đồ handmade, kiêm bán hàng, không rành kỹ thuật | Biết có đơn ngay, xem thông tin đơn đủ để làm và giao, mở campaign lễ không cần dev |

### 1.4 Mục tiêu & chỉ số thành công
| Mục tiêu | Chỉ số (3 tháng đầu) |
|---|---|
| Khách đặt được hàng end-to-end | ≥ 90% đơn tạo thành công không cần chat hỗ trợ |
| Giảm thao tác nhập liệu | Thời gian đặt 1 đơn < 2 phút |
| Chủ shop phản hồi nhanh | Thông báo đơn mới đến trong < 1 phút |
| Campaign hiệu quả | ≥ 30% đơn trong mùa lễ đến từ sản phẩm nổi bật của campaign |

---

## 2. Phạm vi

### 2.1 Trong phạm vi (MVP)
1. Danh sách + chi tiết sản phẩm
2. Form đặt hàng trực tiếp từ trang sản phẩm (không giỏ hàng)
3. Campaigns theo dịp lễ
4. Thông báo đơn mới cho chủ shop (Telegram/email)
5. Màn hình "Đặt hàng thành công" + nút nhắn tin OA

### 2.2 Ngoài phạm vi (MVP) — làm sau
- Giỏ hàng, mua nhiều món/đơn (`pages/cart/` để dành)
- Thanh toán online (Zalo Pay) — MVP chốt COD/chuyển khoản qua chat
- ZNS gửi tin cho khách (tốn phí, cần duyệt template)
- Trang admin quản lý đơn/sản phẩm — dùng Supabase dashboard
- Tài khoản/đăng nhập riêng — định danh bằng Zalo user ID

---

## 3. Yêu cầu chức năng (MVP)

### F1 — Danh sách sản phẩm
**User story:** Là khách, tôi muốn lướt xem tất cả sản phẩm để chọn món ưng ý.

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| F1.1 | Hiển thị grid sản phẩm: ảnh đại diện, tên, giá | Must |
| F1.2 | Dữ liệu lấy từ bảng `products` (chỉ hiện sản phẩm `is_active = true`) | Must |
| F1.3 | Loading skeleton khi đang tải; empty state khi chưa có sản phẩm | Must |
| F1.4 | Pull-to-refresh / refetch khi quay lại app | Should |
| F1.5 | Lọc theo danh mục (móc khóa, thú bông, hoa len…) | Later |

### F2 — Chi tiết sản phẩm (ProductDetailSheet)
**User story:** Là khách, tôi muốn xem đầy đủ thông tin và yêu cầu tùy chỉnh trước khi đặt.

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| F2.1 | Bottom sheet global (Zustand `productSheet.ts`), không phải route riêng | Must |
| F2.2 | Hiển thị: nhiều ảnh (swipe), tên, giá, mô tả | Must |
| F2.3 | Hiển thị **thời gian làm dự kiến** (ví dụ "đặt trước 5-7 ngày") — vị trí nổi bật | Must |
| F2.4 | Ô ghi chú tùy chỉnh: chọn màu, thêm tên, yêu cầu riêng (textarea, giới hạn 500 ký tự) | Must |
| F2.5 | Chọn số lượng (1-20) | Must |
| F2.6 | Nút "Đặt hàng" mở form đặt hàng (F3) | Must |

### F3 — Form đặt hàng
**User story:** Là khách, tôi muốn đặt hàng với ít thao tác gõ nhất.

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| F3.1 | Trường: họ tên, SĐT, địa chỉ giao hàng, sản phẩm + số lượng (mang từ F2 sang), ghi chú | Must |
| F3.2 | Tên + SĐT tự điền từ `zmp-sdk` (getUserInfo / getPhoneNumber) sau khi user cấp quyền; nếu từ chối → cho nhập tay | Must |
| F3.3 | Validate: SĐT format VN, tên/địa chỉ không rỗng, số lượng 1-20 | Must |
| F3.4 | Submit → insert vào bảng `orders`; giá đơn tính từ bảng `products` (không tin giá từ client) | Must |
| F3.5 | Sau khi đặt: màn "Đặt hàng thành công" + mã đơn + nhắc thời gian làm + nút "Nhắn tin cho shop" (mở chat OA) | Must |
| F3.6 | Chống double-submit (disable nút khi đang gửi) | Must |
| F3.7 | Lỗi mạng → toast tiếng Việt, giữ nguyên dữ liệu form | Must |

### F4 — Campaigns theo dịp lễ
**User story:** Là chủ shop, tôi muốn mở chiến dịch lễ chỉ bằng cách thêm 1 dòng trong Supabase.

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| F4.1 | Khi mở app, query bảng `campaigns` tìm campaign có `start_date ≤ hôm nay ≤ end_date` | Must |
| F4.2 | Có campaign active → hiện banner + section sản phẩm nổi bật lên đầu trang Home | Must |
| F4.3 | Không có campaign → hiện list sản phẩm bình thường | Must |
| F4.4 | Nếu nhiều campaign trùng ngày → lấy campaign có `priority` cao nhất (hoặc `start_date` gần nhất) | Should |
| F4.5 | Banner có thể tap → scroll/điều hướng đến sản phẩm nổi bật | Should |

### F5 — Thông báo đơn mới (chủ shop)
**User story:** Là chủ shop, tôi muốn biết có đơn mới trong vòng 1 phút để xác nhận với khách sớm.

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| F5.1 | Supabase Edge Function trigger khi có row mới trong `orders` (database webhook) | Must |
| F5.2 | Gửi Telegram bot message (hoặc email): mã đơn, tên khách, SĐT, sản phẩm, số lượng, ghi chú, địa chỉ | Must |
| F5.3 | Gửi thất bại không được làm fail việc tạo đơn (fire-and-forget / retry) | Must |
| F5.4 | Nâng cấp sau: gọi Zalo OA API gửi tin đến tài khoản chủ shop | Later |

---

## 4. Data model (Supabase / PostgreSQL)

> Chi tiết cột có thể điều chỉnh khi implement — đây là baseline.

### `products`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `description` | text | |
| `price` | integer | VNĐ, không dùng float |
| `images` | text[] | URL ảnh (Supabase Storage) |
| `lead_time_days` | int4range hoặc text | "5-7 ngày" |
| `category` | text | dùng cho filter sau này |
| `is_active` | boolean | ẩn/hiện sản phẩm |
| `created_at` | timestamptz | |

### `orders`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `order_code` | text unique | mã ngắn hiện cho khách |
| `zalo_user_id` | text | định danh khách, phục vụ "Đơn của tôi" sau này |
| `customer_name` | text | |
| `customer_phone` | text | |
| `shipping_address` | text | |
| `product_id` | uuid FK → products | |
| `quantity` | integer | check 1-20 |
| `note` | text | ghi chú tùy chỉnh, max 500 |
| `unit_price` | integer | snapshot giá lúc đặt |
| `total_price` | integer | server-side tính |
| `status` | text | `new` → `confirmed` → `making` → `shipping` → `done` / `cancelled` |
| `created_at` | timestamptz | |

### `campaigns`
| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | "Valentine 2027" |
| `banner_url` | text | |
| `start_date` / `end_date` | date | |
| `featured_product_ids` | uuid[] | sản phẩm nổi bật |
| `priority` | integer | xử lý trùng ngày |
| `is_active` | boolean | tắt khẩn cấp không cần xóa |

### RLS (bắt buộc)
- `products`, `campaigns`: public **SELECT** only.
- `orders`: public **INSERT** only; SELECT giới hạn theo `zalo_user_id` (khi làm "Đơn của tôi") hoặc chỉ qua service role.

---

## 5. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| **Hiệu năng** | Home hiển thị được nội dung < 2s trên 4G; ảnh sản phẩm nén/resize (Supabase Storage transform) |
| **Ngôn ngữ** | 100% UI tiếng Việt |
| **Tương thích** | Chạy trong Zalo (ZMP runtime) + browser dev; tôn trọng safe-area inset |
| **Bảo mật** | Theo CLAUDE.md mục 7: anon key only, RLS mọi bảng, validate input, không log SĐT/địa chỉ |
| **Privacy** | Chỉ xin quyền Zalo (tên/SĐT) tại thời điểm đặt hàng, giải thích lý do rõ ràng |
| **Độ tin cậy** | Tạo đơn không phụ thuộc vào việc gửi thông báo thành công |

---

## 6. Luồng người dùng chính

```
Mở app → Splash → Home
  ├── Có campaign active → Banner lễ + sản phẩm nổi bật + list thường
  └── Không → List sản phẩm

Tap sản phẩm → ProductDetailSheet
  → chọn số lượng + ghi chú tùy chỉnh → "Đặt hàng"
  → Form đặt hàng (tên/SĐT auto-fill từ Zalo, nhập địa chỉ)
  → Submit → insert `orders` + trigger thông báo
  → Màn "Đặt hàng thành công" (mã đơn + lead time + nút nhắn OA)
```

---

## 7. Milestones

| # | Milestone | Nội dung | Definition of Done |
|---|---|---|---|
| 1 | **Bán được hàng** | F1, F2, F3 | Khách đặt đơn end-to-end, đơn xem được trong Supabase dashboard |
| 2 | **Biết có đơn ngay** | F5 | Đơn mới → Telegram/email trong < 1 phút |
| 3 | **Campaigns** | F4 | Thêm row campaign trong Supabase → banner tự hiện đúng ngày, không sửa code |
| 4 | **Sau MVP** | OA notification, ZNS, "Đơn của tôi", tìm kiếm/lọc, wishlist, admin, giỏ hàng, Zalo Pay | Theo roadmap CLAUDE.md mục 8 |

---

## 8. Rủi ro & giả định

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Khách từ chối cấp quyền SĐT từ Zalo | Trung bình | Fallback nhập tay, form vẫn hoạt động đầy đủ |
| Duyệt Mini App bởi Zalo chậm/bị từ chối | Cao | Tuân thủ guideline ZMP, không dùng API ngoài whitelist, chuẩn bị sớm |
| Đơn ảo / spam form | Trung bình | Validate + giới hạn số lượng; nếu bị spam thêm rate limit qua Edge Function |
| Đặt sát lễ không kịp làm | Trung bình | Lead time hiển thị nổi bật; campaign mở sớm vài tuần; cảnh báo trên banner |
| Telegram/email gửi lỗi → sót đơn | Thấp | Chủ shop check Supabase dashboard định kỳ; retry trong Edge Function |

**Giả định:**
- Chủ shop tự quản lý sản phẩm/campaign qua Supabase dashboard ở giai đoạn đầu.
- Thanh toán chốt qua chat (COD/chuyển khoản), chưa cần online payment.
- Lượng đơn giai đoạn đầu < 30 đơn/ngày — chưa cần admin UI.

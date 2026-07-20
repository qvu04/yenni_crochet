# Yenni Crochet 🧶

Zalo Mini App bán đồ handmade (crochet) — đặt hàng, xem sản phẩm, campaign theo dịp lễ.

Chạy app: `npm run dev` (browser) hoặc `zmp start` (ZMP simulator).
Check type: `npm run type-check`.

## MVP — những gì cần có để dùng được thật

**1. Danh sách + chi tiết sản phẩm**
- Ảnh, giá, mô tả
- Ô ghi chú tùy chỉnh (chọn màu, thêm tên, yêu cầu riêng)
- Thời gian làm dự kiến (ví dụ "đặt trước 5-7 ngày")

**2. Form đặt hàng** — trực tiếp từ trang sản phẩm, **không có giỏ hàng** ở bản đầu
- Tên, số điện thoại, địa chỉ, sản phẩm + số lượng, ghi chú
- Tên/SĐT lấy sẵn từ Zalo API (xin phép người dùng) — khách gần như không phải gõ gì

**3. Bộ sưu tập theo dịp (campaigns)**
- Bảng `campaigns` trong Supabase: tên dịp, ngày bắt đầu, ngày kết thúc, banner, danh sách sản phẩm nổi bật
- Mỗi lần mở app, check ngày hôm nay có nằm trong campaign đang active không (8/3, 20/10, Valentine, Trung thu, Tết...)
  - Có → hiện banner + sản phẩm nổi bật của dịp đó lên đầu
  - Không có → hiện list sản phẩm bình thường
- Không cần sửa code mỗi dịp lễ — chỉ cần thêm một dòng trong Supabase trước lễ vài tuần
- Đồ handmade nên mở campaign sớm vì khách phải đặt trước để kịp làm

**4. Thông báo đơn mới**
- Bản đầu: Telegram bot hoặc email qua Supabase Edge Function (setup nhanh, không chặn ra mắt)
- Nâng cấp sau: Zalo OA — Edge Function gọi API Zalo OA để gửi tin nhắn đến tài khoản của mình khi có đơn mới (cần có OA và tài khoản đã tương tác với OA đó)
- Báo cho khách: bản đầu chỉ cần màn hình "Đặt hàng thành công" kèm nút nhắn tin cho OA — chưa cần ZNS (tốn phí, cần duyệt template)

**5. Quản lý đơn** — bản đầu xem trực tiếp trong Supabase dashboard, chưa cần build UI riêng (chỉ làm khi đơn nhiều)

## Thứ tự build (milestone)

1. **Bán được hàng** — danh sách + chi tiết sản phẩm, form đặt hàng ghi vào bảng `orders`, xem đơn qua Supabase dashboard
2. **Biết có đơn ngay** — thông báo Telegram/email qua Edge Function
3. **Campaigns** — banner + sản phẩm nổi bật theo dịp lễ
4. **Sau MVP** — Zalo OA notification, ZNS, trang quản lý đơn riêng

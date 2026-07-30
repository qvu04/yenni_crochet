// Edge Function: gửi email cho chủ shop khi có đơn hàng mới.
//
// Luồng: khách đặt hàng → row mới trong `orders` → Database Webhook/trigger
// gọi function này → function gửi email qua Resend API về Gmail của chủ shop.
// Việc gửi email là async (sau khi order đã insert xong) nên có lỗi cũng
// KHÔNG ảnh hưởng việc tạo đơn.
//
// Vì sao dùng Resend thay vì Gmail SMTP: Deno edge runtime không hỗ trợ SMTP
// ổn định, và Google đã bỏ "less secure apps". Resend free 3.000 email/tháng,
// gửi về Gmail bình thường.
//
// TODO trước khi deploy:
// 1. Tạo tài khoản https://resend.com (đăng ký bằng Gmail muốn nhận thông báo)
//    → lấy API key. Chưa verify domain thì chỉ gửi được TỚI email đã đăng ký
//    Resend — đủ dùng cho việc báo đơn về Gmail của mình.
// 2. Set secrets:
//    supabase secrets set RESEND_API_KEY=re_xxx
//    supabase secrets set ORDER_NOTIFY_EMAIL=emailcuaban@gmail.com
//    supabase secrets set ORDER_WEBHOOK_SECRET=<chuỗi random dài, tự sinh>
// 3. Deploy KHÔNG verify JWT (webhook từ DB không mang JWT của user):
//    supabase functions deploy notify-order --no-verify-jwt
//    → bảo vệ bằng ORDER_WEBHOOK_SECRET thay cho JWT.
// 4. Chạy supabase/notify-order-trigger.sql (xem file đó) để nối trigger.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_EMAIL = Deno.env.get("ORDER_NOTIFY_EMAIL") ?? "";
const WEBHOOK_SECRET = Deno.env.get("ORDER_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface OrderRecord {
  id: string;
  product_id: string | null;
  quantity: number;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  created_at: string;
  subtotal_price?: number | null;
  discount_amount?: number | null;
  final_price?: number | null;
}

interface OrderItemRecord {
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name: string | null;
  variant_color_name: string | null;
  note: string | null;
  products?: {
    name?: string | null;
  } | null;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const renderRows = (rows: [string, string][]) =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 6px 12px 6px 0; color: #6b7280; white-space: nowrap; vertical-align: top;">${label}</td>
          <td style="padding: 6px 0; font-weight: 600;">${value}</td>
        </tr>`,
    )
    .join("");

const sendEmail = async ({ subject, html }: { subject: string; html: string }) => {
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YenniCrochet Store <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL],
      subject,
      html,
    }),
  });

  if (!emailRes.ok) {
    const detail = await emailRes.text();
    console.error("Resend error:", detail);
    return new Response(JSON.stringify({ error: "Gửi email thất bại", detail }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    if (payload.type !== "INSERT" || payload.table !== "orders") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let order = payload.record as OrderRecord;

    const orderRes = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}&select=id,product_id,quantity,customer_name,phone,address,note,created_at,subtotal_price,discount_amount,final_price`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (orderRes.ok) {
      const [latestOrder] = await orderRes.json();
      if (latestOrder) {
        order = latestOrder as OrderRecord;
      }
    }

    let productName = order.product_id ?? "Nhiều sản phẩm";
    let productSummary = "";
    let totalText = order.subtotal_price != null ? formatPrice(Number(order.subtotal_price)) : "";

    // The orders trigger can fire before the cart item query sees committed rows.
    // A tiny delay makes cart emails much more reliable without affecting checkout.
    await wait(250);

    const itemsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=quantity,unit_price,total_price,variant_name,variant_color_name,note,products(name)`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (itemsRes.ok) {
      const orderItems = (await itemsRes.json()) as OrderItemRecord[];
      if (orderItems.length > 0) {
        productName = orderItems.length === 1
          ? orderItems[0].products?.name ?? "Sản phẩm"
          : `${orderItems.length} sản phẩm`;
        productSummary = `
          <ul style="margin: 0; padding-left: 18px;">
            ${orderItems
            .map((item) => {
              const name = escapeHtml(item.products?.name ?? "Sản phẩm");
              const variantLabel = item.variant_color_name || item.variant_name;
              const variant = variantLabel ? ` - ${escapeHtml(variantLabel)}` : "";
              const note = item.note ? ` — ${escapeHtml(item.note)}` : "";
              return `<li>${name}${variant} × ${item.quantity} (${formatPrice(Number(item.total_price))})${note}</li>`;
            })
            .join("")}
          </ul>`;
        totalText = formatPrice(orderItems.reduce((total, item) => total + Number(item.total_price), 0));
      }
    }

    if (!productSummary && order.product_id) {
      const productRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${order.product_id}&select=name,price`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        },
      );
      if (productRes.ok) {
        const [product] = await productRes.json();
        if (product) {
          productName = product.name;
          totalText = formatPrice(Number(product.price) * order.quantity);
          productSummary = `${escapeHtml(productName)} × ${order.quantity}`;
        }
      }
    }

    const rows: [string, string][] = [
      ["Sản phẩm", productSummary || escapeHtml(productName)],
      ["Tạm tính", totalText || "—"],
      ["Giảm giá", order.discount_amount != null ? `-${formatPrice(Number(order.discount_amount))}` : "—"],
      ["Tổng thanh toán", order.final_price != null ? formatPrice(Number(order.final_price)) : totalText || "—"],
      ["Khách hàng", escapeHtml(order.customer_name)],
      ["SĐT", escapeHtml(order.phone)],
      ["Địa chỉ", escapeHtml(order.address)],
      ["Ghi chú", order.note ? escapeHtml(order.note) : "—"],
      ["Thời gian", formatDateTime(order.created_at)],
      ["Mã đơn", order.id],
    ];

    const html = `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="margin: 0 0 12px;">🧶 Đơn hàng mới!</h2>
        <table style="border-collapse: collapse; width: 100%;">
          ${renderRows(rows)}
        </table>
        <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
          Xem chi tiết trong Supabase Dashboard → Table Editor → orders.
        </p>
      </div>`;

    return sendEmail({
      subject: `🧶 Đơn mới: ${productName} — ${order.customer_name}`,
      html,
    });
  } catch (err) {
    console.error("notify-order error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

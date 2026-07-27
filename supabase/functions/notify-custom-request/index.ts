// Edge Function: gửi email cho chủ shop khi có yêu cầu đặt riêng mới.
//
// Luồng: khách gửi form Đặt riêng -> row mới trong `custom_requests` ->
// trigger pg_net gọi function này -> function gửi email qua Resend về Gmail.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_EMAIL = Deno.env.get("ORDER_NOTIFY_EMAIL") ?? "";
const WEBHOOK_SECRET = Deno.env.get("ORDER_WEBHOOK_SECRET") ?? "";

interface CustomRequestRecord {
  id: string;
  customer_name: string;
  phone: string;
  description: string;
  reference_images: string[] | null;
  occasion: string | null;
  preferred_colors: string | null;
  expected_date: string | null;
  budget_range: string | null;
  note: string | null;
  status: string;
  created_at: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

const occasionLabel: Record<string, string> = {
  birthday: "Sinh nhật",
  anniversary: "Kỷ niệm",
  holiday: "Dịp lễ",
  other: "Khác",
};

const budgetLabel: Record<string, string> = {
  under_100k: "< 100k",
  "100k_200k": "100-200k",
  "200k_500k": "200-500k",
  over_500k: "> 500k",
  need_consult: "Cần tư vấn",
};

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

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    if (payload.type !== "INSERT" || payload.table !== "custom_requests") {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const customRequest = payload.record as CustomRequestRecord;
    const referenceImages = customRequest.reference_images ?? [];
    const imageLinks = referenceImages.length
      ? referenceImages
        .map((url, index) => `<a href="${escapeHtml(url)}">Ảnh ${index + 1}</a>`)
        .join(" · ")
      : "—";

    const rows: [string, string][] = [
      ["Khách hàng", escapeHtml(customRequest.customer_name)],
      ["SĐT", escapeHtml(customRequest.phone)],
      ["Mô tả", escapeHtml(customRequest.description)],
      [
        "Dịp tặng",
        customRequest.occasion
          ? escapeHtml(occasionLabel[customRequest.occasion] ?? customRequest.occasion)
          : "—",
      ],
      ["Tone màu", customRequest.preferred_colors ? escapeHtml(customRequest.preferred_colors) : "—"],
      ["Cần trước ngày", customRequest.expected_date ? formatDate(customRequest.expected_date) : "—"],
      [
        "Ngân sách",
        customRequest.budget_range
          ? escapeHtml(budgetLabel[customRequest.budget_range] ?? customRequest.budget_range)
          : "—",
      ],
      ["Ghi chú", customRequest.note ? escapeHtml(customRequest.note) : "—"],
      ["Ảnh tham khảo", imageLinks],
      ["Trạng thái", escapeHtml(customRequest.status)],
      ["Thời gian", formatDateTime(customRequest.created_at)],
      ["Mã yêu cầu", customRequest.id],
    ];

    const html = `
      <div style="font-family: sans-serif; max-width: 560px;">
        <h2 style="margin: 0 0 12px;">Yêu cầu đặt riêng mới!</h2>
        <table style="border-collapse: collapse; width: 100%;">
          ${renderRows(rows)}
        </table>
        <p style="color: #6b7280; font-size: 13px; margin-top: 16px;">
          Xem chi tiết trong Supabase Dashboard → Table Editor → custom_requests.
        </p>
      </div>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "YenniCrochet Store <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject: `Yêu cầu đặt riêng mới — ${customRequest.customer_name}`,
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
  } catch (err) {
    console.error("notify-custom-request error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

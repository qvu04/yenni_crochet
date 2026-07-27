// Edge Function: verify accessToken của Zalo, sau đó tự ký 1 JWT khớp định dạng
// Supabase để FE dùng làm auth token.
//
// CHƯA CẦN DÙNG cho MVP hiện tại — chỉ cần khi làm tính năng "đơn hàng của tôi".
//
// TODO trước khi deploy:
// 1. `supabase secrets set ZALO_APP_SECRET=xxx SUPABASE_JWT_SECRET=xxx`
//    (SUPABASE_JWT_SECRET lấy ở Project Settings > API > JWT Secret trên dashboard)
// 2. Tìm đúng cách verify accessToken hiện tại của Zalo (chưa có endpoint cụ thể ở
//    đây — cần tra docs Zalo Mini App mới nhất trước khi viết phần fetch bên dưới,
//    đừng đoán endpoint).
// 3. `supabase functions deploy zalo-auth`
// 4. Xem comment ở src/hooks/useZaloAuth.ts — phía FE vẫn CHƯA CHỐT cách wiring JWT
//    này vào client Supabase, cần giải quyết trước khi RLS dựa vào auth.uid() được.

import jwt from "npm:jsonwebtoken@9.0.2";

const SUPABASE_JWT_SECRET = Deno.env.get("SUPABASE_JWT_SECRET") ?? "";

Deno.serve(async (req) => {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Thiếu accessToken" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TODO: gọi API Zalo để verify accessToken + lấy zalo_user_id thật (xem TODO#2
    // ở trên).
    const zaloUserId: string | null = null;

    if (!zaloUserId) {
      return new Response(JSON.stringify({ error: "accessToken không hợp lệ" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const supabaseAccessToken = jwt.sign(
      {
        sub: zaloUserId,
        role: "authenticated",
        aud: "authenticated",
        iat: now,
        exp: now + 60 * 60, // 1 giờ — chỉnh theo nhu cầu
      },
      SUPABASE_JWT_SECRET,
    );

    return new Response(JSON.stringify({ supabaseAccessToken }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

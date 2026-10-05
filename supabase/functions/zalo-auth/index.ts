// Exchange a Zalo Mini App access token for a short-lived Supabase-compatible
// JWT. Zalo user verification is forwarded through the Vietnam VPS because
// Zalo restricts this API by source IP. The browser must never be trusted to
// provide its own user id.

import jwt from "npm:jsonwebtoken@9.0.2";

// Supabase reserves the SUPABASE_* namespace for built-in variables, so the
// legacy project JWT secret is stored under an application-owned name.
const SUPABASE_JWT_SECRET = Deno.env.get("YENNI_SUPABASE_JWT_SECRET") ?? "";
const SUPABASE_JWT_KEY_ID = Deno.env.get("YENNI_SUPABASE_JWT_KEY_ID") ?? "";
const AUTH_DEBUG = Deno.env.get("YENNI_AUTH_DEBUG") === "true";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ZALO_APP_ID = Deno.env.get("ZALO_APP_ID") ?? "";
// Keep the auth-specific name, but accept the existing forwarder secret name
// during the migration so a refactor does not silently break authentication.
const ZALO_AUTH_FORWARDER_URL =
  Deno.env.get("ZALO_AUTH_FORWARDER_URL") ?? Deno.env.get("ZALO_FORWARDER_URL") ?? "";
const FORWARD_SECRET = Deno.env.get("FORWARD_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const verifyZaloAccessToken = async (accessToken: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  let response: Response;
  try {
    response = await fetch(ZALO_AUTH_FORWARDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-secret": FORWARD_SECRET,
      },
      body: JSON.stringify({ accessToken, appId: ZALO_APP_ID }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  const zaloErrorCode = payload?.zaloError ?? payload?.code;
  const zaloUserId = payload?.id ?? payload?.user_id_by_app ?? payload?.user_id;

  if (!response.ok || !payload || (zaloErrorCode != null && Number(zaloErrorCode) < 0) || !zaloUserId) {
    const error = new Error("Zalo user verification failed");
    Object.assign(error, {
      code: zaloErrorCode ?? response.status,
      detail: typeof payload?.detail === "string"
        ? payload.detail
        : typeof payload?.message === "string" ? payload.message : "No user id returned",
    });
    throw error;
  }

  return {
    id: String(zaloUserId),
    name: typeof payload.name === "string" ? payload.name : undefined,
    avatar: payload.picture?.data?.url,
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  if (!SUPABASE_JWT_SECRET || !SUPABASE_JWT_KEY_ID || !ZALO_APP_ID || !ZALO_AUTH_FORWARDER_URL || !FORWARD_SECRET) {
    return jsonResponse({
      error: "Auth function chưa được cấu hình đầy đủ",
      missing: [
        ...(!SUPABASE_JWT_SECRET ? ["YENNI_SUPABASE_JWT_SECRET"] : []),
        ...(!SUPABASE_JWT_KEY_ID ? ["YENNI_SUPABASE_JWT_KEY_ID"] : []),
        ...(!ZALO_APP_ID ? ["ZALO_APP_ID"] : []),
        ...(!ZALO_AUTH_FORWARDER_URL ? ["ZALO_AUTH_FORWARDER_URL"] : []),
        ...(!FORWARD_SECRET ? ["FORWARD_SECRET"] : []),
      ],
    }, 500);
  }

  try {
    const body = await req.json();
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim() : "";

    if (!accessToken) return jsonResponse({ error: "Thiếu accessToken" }, 400);

    const zaloUser = await verifyZaloAccessToken(accessToken);
    const now = Math.floor(Date.now() / 1000);
    const supabaseAccessToken = jwt.sign(
      {
        ...(SUPABASE_URL ? { iss: `${SUPABASE_URL}/auth/v1` } : {}),
        sub: zaloUser.id,
        role: "authenticated",
        aud: "authenticated",
        zalo_user_id: zaloUser.id,
        display_name: zaloUser.name,
        avatar_url: zaloUser.avatar,
        iat: now,
        exp: now + 60 * 60,
      },
      SUPABASE_JWT_SECRET,
      {
        algorithm: "HS256",
        ...(SUPABASE_JWT_KEY_ID ? { header: { kid: SUPABASE_JWT_KEY_ID } } : {}),
      },
    );

    const response: Record<string, unknown> = { supabaseAccessToken };

    if (AUTH_DEBUG) {
      const decoded = jwt.decode(supabaseAccessToken, { complete: true }) as {
        header?: { alg?: string; kid?: string; typ?: string };
        payload?: { iss?: string; role?: string; aud?: string; exp?: number };
      } | null;

      response.debug = {
        header: {
          alg: decoded?.header?.alg,
          kid: decoded?.header?.kid,
          typ: decoded?.header?.typ,
        },
        payload: {
          iss: decoded?.payload?.iss,
          role: decoded?.payload?.role,
          aud: decoded?.payload?.aud,
          exp: decoded?.payload?.exp,
        },
      };
    }

    return jsonResponse(response);
  } catch (error) {
    const authError = error as Error & { code?: string | number; detail?: string };
    const isTimeout = authError.name === "AbortError";
    console.error("zalo-auth error:", {
      message: authError.message,
      code: authError.code,
      detail: authError.detail,
    });
    return jsonResponse({
      error: "Không xác thực được tài khoản Zalo",
      code: authError.code ?? (isTimeout ? "ZALO_AUTH_FORWARDER_TIMEOUT" : "ZALO_AUTH_FAILED"),
      detail: authError.detail ?? (isTimeout ? "VPS xác thực Zalo phản hồi quá thời gian" : authError.message),
    }, 401);
  }
});

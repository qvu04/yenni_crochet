const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET") ?? "";
const ZALO_FORWARDER_URL = Deno.env.get("ZALO_FORWARDER_URL") ?? "";
const FORWARD_SECRET = Deno.env.get("FORWARD_SECRET") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ZaloPhoneApiResponse {
  data?: {
    number?: string;
  };
  error?: number;
  message?: string;
}

const normalizeVietnamPhone = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("84")) {
    return `0${digits.slice(2)}`;
  }

  return digits;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessToken, phoneToken } = await req.json();

    if (!ZALO_APP_SECRET) {
      return new Response(JSON.stringify({ error: "Thiếu ZALO_APP_SECRET" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!accessToken || !phoneToken) {
      return new Response(JSON.stringify({ error: "Thiếu accessToken hoặc phoneToken" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const zaloRes = await fetch(ZALO_FORWARDER_URL, {
      method: "POST",
      headers: {
        "x-forward-secret": FORWARD_SECRET,
        "x-target-url": "https://graph.zalo.me/v2.0/me/info",
        "x-target-method": "GET",
        access_token: accessToken,
        code: phoneToken,
        secret_key: ZALO_APP_SECRET,
      },
    });

    const zaloData = (await zaloRes.json()) as ZaloPhoneApiResponse;
    const phoneNumber = zaloData.data?.number;

    if (!zaloRes.ok || !phoneNumber) {
      return new Response(JSON.stringify({
        error: "Không lấy được số điện thoại từ Zalo",
        detail: zaloData.message,
        zaloError: zaloData.error,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ phoneNumber: normalizeVietnamPhone(phoneNumber) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

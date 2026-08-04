const ZALO_APP_SECRET = Deno.env.get("ZALO_APP_SECRET") ?? "";
const ZALO_FORWARDER_URL = Deno.env.get("ZALO_FORWARDER_URL") ?? "";
const FORWARD_SECRET = Deno.env.get("FORWARD_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ZaloLocationApiResponse {
  data?: {
    latitude?: string | number;
    longitude?: string | number;
    lat?: string | number;
    lng?: string | number;
    accuracy?: string | number;
  };
  error?: number;
  message?: string;
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toNumber = (value: unknown) => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { accessToken, locationToken } = await req.json();

    if (!ZALO_APP_SECRET) {
      return jsonResponse({ error: "Thiếu ZALO_APP_SECRET" }, 500);
    }

    if (!ZALO_FORWARDER_URL) {
      return jsonResponse({ error: "Thiếu ZALO_FORWARDER_URL" }, 500);
    }

    if (!accessToken || !locationToken) {
      return jsonResponse({ error: "Thiếu accessToken hoặc locationToken" }, 400);
    }

    const zaloRes = await fetch(ZALO_FORWARDER_URL, {
      method: "POST",
      headers: {
        "x-forward-secret": FORWARD_SECRET,
        "x-target-url": "https://graph.zalo.me/v2.0/me/info",
        "x-target-method": "GET",
        access_token: accessToken,
        code: locationToken,
        secret_key: ZALO_APP_SECRET,
      },
    });

    const zaloData = (await zaloRes.json()) as ZaloLocationApiResponse;
    const latitude = toNumber(zaloData.data?.latitude ?? zaloData.data?.lat);
    const longitude = toNumber(zaloData.data?.longitude ?? zaloData.data?.lng);
    const accuracy = toNumber(zaloData.data?.accuracy);

    if (!zaloRes.ok || latitude == null || longitude == null) {
      return jsonResponse({
        error: "Không lấy được tọa độ từ Zalo",
        detail: zaloData.message,
        zaloError: zaloData.error,
      }, 502);
    }

    return jsonResponse({
      latitude,
      longitude,
      accuracy,
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

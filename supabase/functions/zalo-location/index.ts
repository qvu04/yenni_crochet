const ZALO_AUTH_FORWARDER_URL = Deno.env.get("ZALO_AUTH_FORWARDER_URL") ?? "";
const ZALO_LOCATION_FORWARDER_URL = Deno.env.get("ZALO_LOCATION_FORWARDER_URL") ?? "";
const FORWARD_SECRET = Deno.env.get("FORWARD_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ZaloLocationApiResponse {
  latitude?: string | number;
  longitude?: string | number;
  accuracy?: string | number | null;
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

const getLocationGatewayUrl = () => {
  if (ZALO_LOCATION_FORWARDER_URL) return ZALO_LOCATION_FORWARDER_URL;
  if (!ZALO_AUTH_FORWARDER_URL) return "";

  try {
    const url = new URL(ZALO_AUTH_FORWARDER_URL);
    url.pathname = url.pathname.replace(/\/zalo\/auth\/?$/, "/zalo/location");
    return url.toString();
  } catch {
    return "";
  }
};

const parseGatewayResponse = async (response: Response): Promise<ZaloLocationApiResponse & { error?: string; detail?: string }> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as ZaloLocationApiResponse & { error?: string; detail?: string };
  } catch {
    return { error: text || `Gateway trả về HTTP ${response.status}` };
  }
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

    const gatewayUrl = getLocationGatewayUrl();
    if (!gatewayUrl) {
      return jsonResponse({ error: "Thiếu ZALO_LOCATION_FORWARDER_URL hoặc ZALO_AUTH_FORWARDER_URL" }, 500);
    }

    if (!accessToken || !locationToken) {
      return jsonResponse({ error: "Thiếu accessToken hoặc locationToken" }, 400);
    }

    const zaloRes = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-secret": FORWARD_SECRET,
      },
      body: JSON.stringify({ accessToken, locationToken }),
    });

    const zaloData = await parseGatewayResponse(zaloRes);
    // The VPS gateway returns location fields at the top level. Keep the
    // nested shape as a fallback for older forwarders.
    const latitude = toNumber(zaloData.latitude ?? zaloData.data?.latitude ?? zaloData.data?.lat);
    const longitude = toNumber(zaloData.longitude ?? zaloData.data?.longitude ?? zaloData.data?.lng);
    const accuracy = toNumber(zaloData.accuracy ?? zaloData.data?.accuracy);

    if (!zaloRes.ok || latitude == null || longitude == null) {
      return jsonResponse({
        error: "Không lấy được tọa độ từ Zalo",
        detail: zaloData.detail ?? zaloData.message,
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

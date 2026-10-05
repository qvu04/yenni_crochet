const ZALO_AUTH_FORWARDER_URL = Deno.env.get("ZALO_AUTH_FORWARDER_URL") ?? "";
const ZALO_PHONE_FORWARDER_URL = Deno.env.get("ZALO_PHONE_FORWARDER_URL") ?? "";
const FORWARD_SECRET = Deno.env.get("FORWARD_SECRET") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ZaloPhoneApiResponse {
  phoneNumber?: string;
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

const getPhoneGatewayUrl = () => {
  if (ZALO_PHONE_FORWARDER_URL) return ZALO_PHONE_FORWARDER_URL;
  if (!ZALO_AUTH_FORWARDER_URL) return "";

  try {
    const url = new URL(ZALO_AUTH_FORWARDER_URL);
    url.pathname = url.pathname.replace(/\/zalo\/auth\/?$/, "/zalo/phone");
    return url.toString();
  } catch {
    return "";
  }
};

const parseGatewayResponse = async (response: Response): Promise<ZaloPhoneApiResponse & { error?: string; detail?: string; zaloError?: number | string }> => {
  const text = await response.text();
  try {
    return JSON.parse(text) as ZaloPhoneApiResponse & { error?: string; detail?: string; zaloError?: number | string };
  } catch {
    return { error: text || `Gateway trả về HTTP ${response.status}` };
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { accessToken, phoneToken } = await req.json();

    const gatewayUrl = getPhoneGatewayUrl();
    if (!gatewayUrl) {
      return new Response(JSON.stringify({ error: "Thiếu ZALO_PHONE_FORWARDER_URL hoặc ZALO_AUTH_FORWARDER_URL" }), {
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

    const zaloRes = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-secret": FORWARD_SECRET,
      },
      body: JSON.stringify({ accessToken, phoneToken }),
    });

    const zaloData = await parseGatewayResponse(zaloRes);
    // The VPS gateway returns phoneNumber at the top level. Keep the nested
    // shape as a fallback for older forwarders.
    const phoneNumber = zaloData.phoneNumber ?? zaloData.data?.number;

    if (!zaloRes.ok || !phoneNumber) {
      return new Response(JSON.stringify({
        error: "Không lấy được số điện thoại từ Zalo",
        detail: zaloData.detail ?? zaloData.message ?? zaloData.error ?? `Gateway trả về HTTP ${zaloRes.status}`,
        zaloError: zaloData.zaloError ?? zaloData.error,
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

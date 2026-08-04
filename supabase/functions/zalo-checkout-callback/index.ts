const CHECKOUT_PRIVATE_KEY = Deno.env.get("CHECKOUT_PRIVATE_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CALLBACK_EVENTS_TABLE = Deno.env.get("ZALO_CHECKOUT_CALLBACK_EVENTS_TABLE") ?? "zalo_checkout_callbacks";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type CheckoutCallbackData = Record<string, unknown> & {
  appId?: string | number;
  orderId?: string;
  transId?: string;
  amount?: string | number;
  description?: string;
  resultCode?: string | number;
  message?: string;
  method?: string;
};

interface CheckoutCallbackPayload {
  data?: CheckoutCallbackData;
  mac?: string;
  overallMac?: string;
}

const textEncoder = new TextEncoder();

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hmacSha256 = async (input: string) => {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(CHECKOUT_PRIVATE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(input));

  return toHex(signature);
};

const normalizeValue = (value: unknown) => String(value ?? "");

const buildMainCallbackMacData = (data: CheckoutCallbackData) =>
  [
    ["appId", data.appId],
    ["amount", data.amount],
    ["description", data.description],
    ["orderId", data.orderId],
    ["message", data.message],
    ["resultCode", data.resultCode],
    ["transId", data.transId],
  ]
    .map(([key, value]) => `${key}=${normalizeValue(value)}`)
    .join("&");

const buildNotifyMacData = (data: CheckoutCallbackData) =>
  [
    ["appId", data.appId],
    ["orderId", data.orderId],
    ["method", data.method],
  ]
    .map(([key, value]) => `${key}=${normalizeValue(value)}`)
    .join("&");

const buildOverallMacData = (data: CheckoutCallbackData) =>
  Object.keys(data)
    .sort()
    .map((key) => `${key}=${normalizeValue(data[key])}`)
    .join("&");

const constantTimeEqual = (a: string, b: string) => {
  const aBytes = textEncoder.encode(a.toLowerCase());
  const bBytes = textEncoder.encode(b.toLowerCase());

  if (aBytes.length !== bBytes.length) return false;

  let diff = 0;
  for (let index = 0; index < aBytes.length; index += 1) {
    diff |= aBytes[index] ^ bBytes[index];
  }

  return diff === 0;
};

const verifyCallback = async ({ data, mac, overallMac }: CheckoutCallbackPayload) => {
  if (!data) return false;

  if (overallMac) {
    const expectedOverallMac = await hmacSha256(buildOverallMacData(data));
    if (constantTimeEqual(expectedOverallMac, overallMac)) return true;
  }

  if (!mac) return false;

  const expectedMainMac = await hmacSha256(buildMainCallbackMacData(data));
  if (constantTimeEqual(expectedMainMac, mac)) return true;

  const expectedNotifyMac = await hmacSha256(buildNotifyMacData(data));
  return constantTimeEqual(expectedNotifyMac, mac);
};

const getPaymentStatus = (resultCode: unknown) => {
  const numericCode = Number(resultCode);

  if (numericCode === 1) return "paid";
  if (numericCode === 0) return "refunded";

  return "failed";
};

const serviceRoleHeaders = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

const persistCallback = async (payload: CheckoutCallbackPayload, isVerified: boolean) => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;

  const data = payload.data ?? {};

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${CALLBACK_EVENTS_TABLE}`, {
    method: "POST",
    headers: {
      ...serviceRoleHeaders,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      checkout_order_id: data.orderId ?? null,
      checkout_transaction_id: data.transId ?? null,
      method: data.method ?? data.paymentChannel ?? null,
      result_code: data.resultCode != null ? Number(data.resultCode) : null,
      amount: data.amount != null ? Number(data.amount) : null,
      message: data.message ?? null,
      is_verified: isVerified,
      payload,
      received_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error("zalo-checkout-callback persist failed:", await res.text());
  }
};

const updateOrderPayment = async (data: CheckoutCallbackData) => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !data.orderId) {
    return { updated: false };
  }

  const paymentStatus = getPaymentStatus(data.resultCode);
  const updatePayload = {
    payment_status: paymentStatus,
    checkout_transaction_id: data.transId ?? null,
    paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
  };

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?checkout_order_id=eq.${encodeURIComponent(data.orderId)}&select=id`,
    {
      method: "PATCH",
      headers: {
        ...serviceRoleHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatePayload),
    },
  );

  if (!res.ok) {
    console.error("zalo-checkout-callback order update failed:", await res.text());
    return { updated: false };
  }

  const updatedOrders = await res.json();

  return { updated: Array.isArray(updatedOrders) && updatedOrders.length > 0 };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return jsonResponse({
      ok: true,
      service: "zalo-checkout-callback",
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ returnCode: -1, returnMessage: "Method not allowed" }, 405);
  }

  if (!CHECKOUT_PRIVATE_KEY) {
    return jsonResponse({ returnCode: -1, returnMessage: "Missing CHECKOUT_PRIVATE_KEY" }, 500);
  }

  try {
    const payload = (await req.json()) as CheckoutCallbackPayload;

    if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
      return jsonResponse({ returnCode: -1, returnMessage: "Invalid callback payload" }, 400);
    }

    const isVerified = await verifyCallback(payload);
    await persistCallback(payload, isVerified);

    if (!isVerified) {
      return jsonResponse({ returnCode: -1, returnMessage: "Invalid callback mac" }, 400);
    }

    const updateResult = await updateOrderPayment(payload.data);

    return jsonResponse({
      returnCode: 1,
      returnMessage: updateResult.updated
        ? "Callback processed"
        : "Callback accepted, order not found yet",
    });
  } catch (err) {
    console.error("zalo-checkout-callback error:", err);
    return jsonResponse({ returnCode: -1, returnMessage: "Callback processing failed" }, 500);
  }
});

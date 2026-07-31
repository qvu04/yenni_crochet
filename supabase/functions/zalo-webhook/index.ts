// Webhook endpoint for Zalo Mini App Open APIs.
//
// Use this URL in Zalo Developer Console:
// https://<project-ref>.supabase.co/functions/v1/zalo-webhook?secret=<ZALO_WEBHOOK_SECRET>
//
// Deploy:
// supabase secrets set ZALO_WEBHOOK_SECRET=<random-secret>
// npx supabase functions deploy zalo-webhook --no-verify-jwt

const WEBHOOK_SECRET = Deno.env.get("ZALO_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const EVENTS_TABLE = Deno.env.get("ZALO_WEBHOOK_EVENTS_TABLE") ?? "zalo_webhook_events";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-zalo-webhook-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ZaloWebhookPayload {
  event_name?: string;
  event?: string;
  app_id?: string | number;
  timestamp?: number;
  [key: string]: unknown;
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isAuthorized = (req: Request) => {
  if (!WEBHOOK_SECRET) return true;

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = req.headers.get("x-zalo-webhook-secret");

  return querySecret === WEBHOOK_SECRET || headerSecret === WEBHOOK_SECRET;
};

const persistEvent = async (payload: ZaloWebhookPayload, req: Request) => {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return;

  const eventName = payload.event_name ?? payload.event ?? "unknown";

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${EVENTS_TABLE}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      event_name: eventName,
      payload,
      headers: {
        user_agent: req.headers.get("user-agent"),
        x_forwarded_for: req.headers.get("x-forwarded-for"),
      },
      received_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error("zalo-webhook persist failed:", await res.text());
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!isAuthorized(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  if (req.method === "GET") {
    return jsonResponse({
      ok: true,
      service: "zalo-webhook",
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as ZaloWebhookPayload;
    const eventName = payload.event_name ?? payload.event ?? "unknown";

    console.info("zalo-webhook received:", {
      eventName,
      appId: payload.app_id,
      timestamp: payload.timestamp,
    });

    await persistEvent(payload, req);

    return jsonResponse({
      ok: true,
      received: true,
      event_name: eventName,
    });
  } catch (error) {
    console.error("zalo-webhook error:", error);
    return jsonResponse({ error: "Invalid webhook payload" }, 400);
  }
});

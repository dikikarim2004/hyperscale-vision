/**
 * Called by the Telegram bot when a user sends their one-time link code.
 *
 * Contract (additive on the bot side — no existing behaviour changes):
 *   POST /api/public/telegram/link
 *   headers: { "x-link-secret": TELEGRAM_LINK_SECRET }
 *   body:    { code: string, telegramId: string, telegramUsername?: string }
 *
 * The bot is the only caller that knows the shared secret, and it supplies the
 * telegramId from the Telegram update itself — never from the browser. The web
 * session is resolved from the stored code, so no email matching ever happens.
 * Nothing in the bot's own database is touched by this endpoint.
 */
import { createFileRoute } from "@tanstack/react-router";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/telegram/link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["TELEGRAM_LINK_SECRET"];
        const provided = request.headers.get("x-link-secret") ?? "";
        if (!secret || !timingSafeEqual(provided, secret)) {
          return json({ error: "Unauthorized" }, 401);
        }

        let payload: { code?: string; telegramId?: string; telegramUsername?: string };
        try {
          payload = (await request.json()) as typeof payload;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const code = payload.code?.trim().toUpperCase();
        const telegramId = payload.telegramId?.toString().trim();
        if (!code || !telegramId) return json({ error: "code and telegramId are required" }, 400);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: row } = await supabaseAdmin
          .from("telegram_link_codes")
          .select("code, user_id, expires_at, consumed_at")
          .eq("code", code)
          .maybeSingle();

        if (!row) return json({ error: "Unknown code" }, 404);
        if (row.consumed_at) return json({ error: "Code already used" }, 409);
        if (new Date(row.expires_at).getTime() < Date.now()) return json({ error: "Code expired" }, 410);

        const { error: linkError } = await supabaseAdmin.from("telegram_links").insert({
          user_id: row.user_id,
          telegram_id: telegramId,
          telegram_username: payload.telegramUsername ?? null,
        });
        if (linkError) return json({ error: "This Telegram account is already linked." }, 409);

        await supabaseAdmin
          .from("telegram_link_codes")
          .update({ consumed_at: new Date().toISOString() })
          .eq("code", code);

        return json({ ok: true });
      },
    },
  },
});

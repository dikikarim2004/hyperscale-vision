/**
 * Account + Telegram linking server functions.
 *
 * Identity rules:
 * - The session identity is the Google `sub` stored on the profile row.
 * - A Google account is NEVER matched to an existing Telegram user by email.
 *   Linking only happens through a one-time code that the user sends to the
 *   Telegram bot from the very account they want to link.
 * - No trading data is created, changed or deleted by this flow.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AccountInfo {
  googleSub: string | null;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  telegramId: string | null;
  telegramUsername: string | null;
  linkedAt: string | null;
}

export interface LinkCodeInfo {
  code: string;
  expiresAt: string;
}

const CODE_TTL_MINUTES = 10;

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountInfo> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("google_sub, email, email_verified, full_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();

    const { data: link } = await context.supabase
      .from("telegram_links")
      .select("telegram_id, telegram_username, linked_at")
      .eq("user_id", context.userId)
      .maybeSingle();

    const claims = context.claims as Record<string, unknown> | undefined;
    const meta = (claims?.["user_metadata"] ?? {}) as Record<string, unknown>;

    return {
      googleSub: profile?.google_sub ?? (meta["sub"] as string | undefined) ?? null,
      email: profile?.email ?? ((claims?.["email"] as string | undefined) ?? null),
      emailVerified: profile?.email_verified ?? Boolean(meta["email_verified"]),
      fullName: profile?.full_name ?? ((meta["full_name"] as string | undefined) ?? null),
      avatarUrl: profile?.avatar_url ?? ((meta["avatar_url"] as string | undefined) ?? null),
      telegramId: link?.telegram_id ?? null,
      telegramUsername: link?.telegram_username ?? null,
      linkedAt: link?.linked_at ?? null,
    };
  });

export const createLinkCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LinkCodeInfo> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("telegram_links")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) throw new Error("This account is already linked to a Telegram account.");

    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();

    const { error } = await supabaseAdmin
      .from("telegram_link_codes")
      .insert({ code, user_id: context.userId, expires_at: expiresAt });
    if (error) throw new Error(error.message);

    return { code, expiresAt };
  });

export const unlinkTelegram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("telegram_links").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

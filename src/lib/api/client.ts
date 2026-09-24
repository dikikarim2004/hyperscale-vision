/**
 * Typed API contract for the Hyperscale Auto LP bot backend.
 *
 * Every call below is a documented HTTP contract against the bot service
 * (`VITE_HYPERSCALE_API_URL`). While that variable is unset the client answers
 * from `sample.ts` so the whole UI is reviewable before the backend exists.
 *
 * Contract rules (enforced server-side, mirrored here):
 * - Requests carry the httpOnly session cookie (`credentials: "include"`).
 * - The server resolves `telegramId` from the session's linked Telegram
 *   account. The client NEVER sends telegramId / userId / walletId ownership
 *   claims that the server does not re-verify.
 * - Secrets are returned masked; private keys only from POST /wallets/:id/export
 *   after a fresh re-authentication token.
 */
import type {
  ActionResult,
  AgentStatus,
  AppNotification,
  Briefing,
  ChatMessage,
  ConfigSection,
  DecisionLog,
  DeployRequest,
  ImportWalletRequest,
  Lesson,
  PerformanceRecord,
  PnlSummary,
  PoolCandidate,
  Position,
  PositionEvent,
  StudyReport,
  WalletExportResult,
  WalletSummary,
} from "./types";
import {
  sampleAgentStatus,
  sampleBriefing,
  sampleCandidates,
  sampleChat,
  sampleConfig,
  sampleDecisions,
  sampleLessons,
  sampleNotifications,
  samplePerformance,
  samplePnl,
  samplePositionEvents,
  samplePositions,
  sampleStudy,
  sampleWallets,
} from "./sample";

const BASE_URL = (import.meta.env["VITE_HYPERSCALE_API_URL"] as string | undefined) ?? "";

export const isLiveBackend = BASE_URL.length > 0;

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* keep default */
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms));

/** In-memory dev state so actions visibly change the UI without a backend. */
const devState = {
  status: { ...sampleAgentStatus },
  wallets: sampleWallets.map((w) => ({ ...w })),
  positions: samplePositions.map((p) => ({ ...p })),
  notifications: sampleNotifications.map((n) => ({ ...n })),
  config: sampleConfig.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f })) })),
  chat: sampleChat.map((m) => ({ ...m })),
};

function pushNotification(n: Omit<AppNotification, "id" | "createdAt" | "read">) {
  devState.notifications.unshift({
    ...n,
    id: `ntf_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false,
  });
}

export const api = {
  /* ── Status / agent controls ─────────────────────────── */

  /** GET /api/status */
  async getStatus(): Promise<AgentStatus> {
    if (isLiveBackend) return http<AgentStatus>("/api/status");
    await delay(180);
    return { ...devState.status };
  },

  /** POST /api/agent/pause */
  async pauseAgent(): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/agent/pause", { method: "POST" });
    await delay();
    devState.status.agentEnabled = false;
    pushNotification({ kind: "agent_paused", title: "Agent paused", body: "No new cycles will run until you resume.", severity: "warning" });
    return { ok: true, message: "Agent paused" };
  },

  /** POST /api/agent/resume */
  async resumeAgent(): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/agent/resume", { method: "POST" });
    await delay();
    devState.status.agentEnabled = true;
    pushNotification({ kind: "agent_resumed", title: "Agent resumed", body: "Scheduler re-armed, next cycle in 15 minutes.", severity: "success" });
    return { ok: true, message: "Agent resumed" };
  },

  /** POST /api/agent/dry-run  { enabled } */
  async setDryRun(enabled: boolean): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/agent/dry-run", { method: "POST", body: JSON.stringify({ enabled }) });
    await delay();
    devState.status.dryRun = enabled;
    return { ok: true, message: enabled ? "Dry-run enabled" : "Dry-run disabled — live trading" };
  },

  /* ── Wallets ─────────────────────────────────────────── */

  /** GET /api/wallets */
  async listWallets(): Promise<WalletSummary[]> {
    if (isLiveBackend) return http<WalletSummary[]>("/api/wallets");
    await delay(200);
    return devState.wallets.map((w) => ({ ...w }));
  },

  /** POST /api/wallets  { privateKey, makeActive } — HTTPS only, never logged. */
  async importWallet(req: ImportWalletRequest): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/wallets", { method: "POST", body: JSON.stringify(req) });
    await delay(700);
    if (req.privateKey.trim().length < 32) throw new ApiError("That does not look like a valid base58 secret key.", 400);
    const pk = `New${Math.random().toString(36).slice(2, 10)}…${Math.random().toString(36).slice(2, 6)}`;
    if (req.makeActive) devState.wallets.forEach((w) => (w.isActive = false));
    devState.wallets.push({
      id: `wal_${devState.wallets.length + 1}`,
      publicKey: pk,
      isActive: req.makeActive,
      createdAt: new Date().toISOString(),
      lastExportedAt: null,
      exportCount: 0,
      solBalance: 0,
      usdValue: 0,
    });
    return { ok: true, message: "Wallet imported and encrypted at rest" };
  },

  /** POST /api/wallets/:id/activate */
  async setActiveWallet(walletId: string): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>(`/api/wallets/${walletId}/activate`, { method: "POST" });
    await delay();
    devState.wallets.forEach((w) => (w.isActive = w.id === walletId));
    const active = devState.wallets.find((w) => w.isActive);
    devState.status.activeWalletPublicKey = active?.publicKey ?? null;
    devState.status.solBalance = active?.solBalance ?? 0;
    return { ok: true, message: "Active wallet updated" };
  },

  /**
   * POST /api/wallets/:id/export  { reauthToken, confirmPhrase }
   * Requires a fresh re-authentication and the literal phrase "CONFIRM EXPORT".
   */
  async exportWallet(walletId: string, confirmPhrase: string): Promise<WalletExportResult> {
    if (isLiveBackend)
      return http<WalletExportResult>(`/api/wallets/${walletId}/export`, {
        method: "POST",
        body: JSON.stringify({ confirmPhrase }),
      });
    await delay(900);
    if (confirmPhrase !== "CONFIRM EXPORT") throw new ApiError("Confirmation phrase does not match.", 400);
    const wallet = devState.wallets.find((w) => w.id === walletId);
    if (!wallet) throw new ApiError("Wallet not found.", 404);
    wallet.exportCount += 1;
    wallet.lastExportedAt = new Date().toISOString();
    return {
      publicKey: wallet.publicKey,
      privateKey: "SAMPLE-KEY-ONLY-no-real-secret-is-stored-in-this-preview",
      exportedAt: new Date().toISOString(),
    };
  },

  /* ── Positions ───────────────────────────────────────── */

  /** GET /api/positions?closed=false */
  async listPositions(): Promise<Position[]> {
    if (isLiveBackend) return http<Position[]>("/api/positions");
    await delay(220);
    return devState.positions.filter((p) => !p.closed).map((p) => ({ ...p }));
  },

  /** POST /api/positions/deploy */
  async deployPosition(req: DeployRequest): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/positions/deploy", { method: "POST", body: JSON.stringify(req) });
    await delay(1100);
    if (req.amountSol <= 0) throw new ApiError("Amount must be greater than zero.", 400);
    if (req.amountSol > devState.status.solBalance) throw new ApiError("Insufficient SOL for this deploy.", 400);
    pushNotification({
      kind: "deploy_success",
      title: "Deploy queued",
      body: `${req.amountSol} SOL into ${req.pool.slice(0, 6)}… with ${req.strategy}.`,
      severity: "success",
    });
    return { ok: true, message: "Deploy job queued" };
  },

  /** POST /api/positions/:id/close */
  async closePosition(positionId: string): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>(`/api/positions/${positionId}/close`, { method: "POST" });
    await delay(950);
    const pos = devState.positions.find((p) => p.id === positionId);
    if (!pos) throw new ApiError("Position not found.", 404);
    pos.closed = true;
    pos.closedAt = new Date().toISOString();
    devState.status.openPositions = devState.positions.filter((p) => !p.closed).length;
    pushNotification({
      kind: "close_success",
      title: `Position closed — ${pos.poolName ?? "pool"}`,
      body: `Realised ${pos.pnlUsd && pos.pnlUsd >= 0 ? "+" : ""}$${(pos.pnlUsd ?? 0).toFixed(2)}.`,
      severity: pos.pnlUsd && pos.pnlUsd < 0 ? "warning" : "success",
    });
    return { ok: true, message: "Close job queued" };
  },

  /** GET /api/positions/events */
  async listEvents(): Promise<PositionEvent[]> {
    if (isLiveBackend) return http<PositionEvent[]>("/api/positions/events");
    await delay(160);
    return samplePositionEvents;
  },

  /* ── PnL / performance / lessons ─────────────────────── */

  /** GET /api/pnl */
  async getPnl(): Promise<PnlSummary> {
    if (isLiveBackend) return http<PnlSummary>("/api/pnl");
    await delay(240);
    return samplePnl;
  },

  /** GET /api/performance */
  async listPerformance(): Promise<PerformanceRecord[]> {
    if (isLiveBackend) return http<PerformanceRecord[]>("/api/performance");
    await delay(200);
    return samplePerformance;
  },

  /** GET /api/lessons */
  async listLessons(): Promise<Lesson[]> {
    if (isLiveBackend) return http<Lesson[]>("/api/lessons");
    await delay(200);
    return sampleLessons;
  },

  /** GET /api/decisions */
  async listDecisions(): Promise<DecisionLog[]> {
    if (isLiveBackend) return http<DecisionLog[]>("/api/decisions");
    await delay(200);
    return sampleDecisions;
  },

  /* ── Screening / briefing / study ────────────────────── */

  /** GET /api/screen */
  async listCandidates(): Promise<PoolCandidate[]> {
    if (isLiveBackend) return http<PoolCandidate[]>("/api/screen");
    await delay(260);
    return sampleCandidates;
  },

  /** POST /api/screen/run */
  async runScreen(): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/screen/run", { method: "POST" });
    await delay(1200);
    return { ok: true, message: "Screening cycle queued" };
  },

  /** GET /api/briefing */
  async getBriefing(): Promise<Briefing> {
    if (isLiveBackend) return http<Briefing>("/api/briefing");
    await delay(220);
    return sampleBriefing;
  },

  /** POST /api/briefing/run */
  async runBriefing(): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/briefing/run", { method: "POST" });
    await delay(1200);
    return { ok: true, message: "Briefing regenerated" };
  },

  /** POST /api/study  { pool } */
  async studyPool(pool: string): Promise<StudyReport> {
    if (isLiveBackend) return http<StudyReport>("/api/study", { method: "POST", body: JSON.stringify({ pool }) });
    await delay(1400);
    if (pool.trim().length < 8) throw new ApiError("Enter a valid pool or token address.", 400);
    return { ...sampleStudy, pool, createdAt: new Date().toISOString() };
  },

  /* ── Configuration ───────────────────────────────────── */

  /** GET /api/config — secrets masked. */
  async getConfig(): Promise<ConfigSection[]> {
    if (isLiveBackend) return http<ConfigSection[]>("/api/config");
    await delay(220);
    return devState.config.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f })) }));
  },

  /** PATCH /api/config  { changes: { [flatKey]: value } } — refreshes the scheduler. */
  async updateConfig(changes: Record<string, string | number | boolean>): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/config", { method: "PATCH", body: JSON.stringify({ changes }) });
    await delay(650);
    for (const section of devState.config) {
      for (const field of section.fields) {
        if (field.key in changes) {
          if (field.type === "secret") field.masked = "••••…saved";
          else field.value = changes[field.key] ?? field.value;
        }
      }
    }
    pushNotification({
      kind: "config_updated",
      title: "Configuration updated",
      body: `${Object.keys(changes).length} field(s) saved. Scheduler refreshed.`,
      severity: "info",
    });
    return { ok: true, message: "Configuration saved" };
  },

  /* ── Notifications ───────────────────────────────────── */

  /** GET /api/notifications (SSE stream at /api/notifications/stream when live) */
  async listNotifications(): Promise<AppNotification[]> {
    if (isLiveBackend) return http<AppNotification[]>("/api/notifications");
    await delay(160);
    return devState.notifications.map((n) => ({ ...n }));
  },

  /** POST /api/notifications/read  { ids } */
  async markNotificationsRead(ids: string[]): Promise<ActionResult> {
    if (isLiveBackend) return http<ActionResult>("/api/notifications/read", { method: "POST", body: JSON.stringify({ ids }) });
    await delay(120);
    devState.notifications.forEach((n) => {
      if (ids.includes(n.id)) n.read = true;
    });
    return { ok: true, message: "Marked as read" };
  },

  /* ── Chat ────────────────────────────────────────────── */

  /** GET /api/chat/messages */
  async listMessages(): Promise<ChatMessage[]> {
    if (isLiveBackend) return http<ChatMessage[]>("/api/chat/messages");
    await delay(180);
    return devState.chat.map((m) => ({ ...m }));
  },

  /**
   * POST /api/chat/messages  { content }
   * Live backend streams the reply with text/event-stream; the dev adapter
   * emits the same progressive chunks so the UI path is identical.
   */
  async sendMessage(content: string, onChunk: (text: string) => void): Promise<ChatMessage> {
    if (isLiveBackend) {
      const res = await fetch(`${BASE_URL}/api/chat/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok || !res.body) throw new ApiError(`Chat failed (${res.status})`, res.status);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        onChunk(full);
      }
      return {
        id: `msg_${Date.now()}`,
        role: "agent",
        content: full,
        createdAt: new Date().toISOString(),
        status: "sent",
      };
    }

    await delay(500);
    if (/\bfail\b/i.test(content)) throw new ApiError("The agent could not be reached. Try again.", 503);
    const reply = buildDevReply(content);
    let shown = "";
    for (const word of reply.content.split(" ")) {
      shown = shown ? `${shown} ${word}` : word;
      onChunk(shown);
      await delay(28);
    }
    devState.chat.push(reply);
    return reply;
  },
};

function buildDevReply(input: string): ChatMessage {
  const q = input.toLowerCase();
  const base = { id: `msg_${Date.now()}`, role: "agent" as const, createdAt: new Date().toISOString(), status: "sent" as const };

  if (q.includes("pnl") || q.includes("profit")) {
    return {
      ...base,
      content: `Realised PnL is $${samplePnl.realizedUsd.toFixed(2)} across ${samplePnl.totalTrades} trades with a ${samplePnl.winRate}% win rate. Unrealised is $${samplePnl.unrealizedUsd.toFixed(2)} on ${devState.positions.filter((p) => !p.closed).length} open positions, and fees collected total $${samplePnl.feesUsd.toFixed(2)}.`,
      actions: [{ id: "pnl", label: "Open PnL dashboard", to: "/pnl", tone: "primary" }],
    };
  }
  if (q.includes("wallet") || q.includes("balance")) {
    return {
      ...base,
      content: `The active wallet is ${devState.status.activeWalletPublicKey?.slice(0, 6)}…${devState.status.activeWalletPublicKey?.slice(-4)} holding ${devState.status.solBalance.toFixed(3)} SOL (about $${(devState.status.solBalance * devState.status.solPriceUsd).toFixed(0)}). You have ${devState.wallets.length} wallets stored, all encrypted at rest.`,
      actions: [{ id: "w", label: "Manage wallets", to: "/wallets" }],
    };
  }
  if (q.includes("position") || q.includes("open")) {
    const open = devState.positions.filter((p) => !p.closed);
    return {
      ...base,
      content: `You have ${open.length} open positions: ${open.map((p) => `${p.poolName} (${p.pnlPct && p.pnlPct >= 0 ? "+" : ""}${p.pnlPct}%)`).join(", ")}. ${open.some((p) => !p.inRange) ? "One is currently out of range." : "All are in range."}`,
      actions: [{ id: "p", label: "View positions", to: "/positions", tone: "primary" }],
    };
  }
  if (q.includes("screen") || q.includes("candidate") || q.includes("opportunit")) {
    return {
      ...base,
      content: `Top candidate right now is ${sampleCandidates[0]?.poolName ?? "n/a"} with a score of ${sampleCandidates[0]?.score ?? 0} and fee/TVL of ${((sampleCandidates[0]?.feeTvl24h ?? 0) * 100).toFixed(1)}%. Two more pools are on the watchlist and one was rejected for an active dev wallet.`,
      actions: [{ id: "s", label: "Open screener", to: "/screen", tone: "primary" }],
    };
  }
  if (q.includes("pause") || q.includes("stop")) {
    return {
      ...base,
      content: "I can pause the agent — open positions stay open and keep being monitored, but no new deploys will happen until you resume.",
      actions: [{ id: "ag", label: "Agent controls", to: "/dashboard", tone: "danger" }],
    };
  }
  return {
    ...base,
    content: `Agent is ${devState.status.agentEnabled ? "running" : "paused"}${devState.status.dryRun ? " in dry-run" : ""}, ${devState.positions.filter((p) => !p.closed).length} positions open and ${devState.status.solBalance.toFixed(2)} SOL idle. Ask me about PnL, positions, wallets, screening or configuration — or use the menu for the full controls.`,
    actions: [
      { id: "d", label: "Dashboard", to: "/dashboard", tone: "primary" },
      { id: "h", label: "Help centre", to: "/help" },
    ],
  };
}

export { ApiError };

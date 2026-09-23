/**
 * Domain types for the Hyperscale Auto LP web app.
 *
 * These mirror the Prisma models of the live trading bot
 * (users, wallets, user_configs, user_secrets, positions, position_events,
 * decision_logs, lessons, performance_records) as read-only shapes for the UI.
 *
 * SECURITY CONTRACT
 * - `encryptedPrivateKey`, `*_Enc` secret columns and any master key material
 *   are NEVER part of these types. Secrets only ever travel as masked previews.
 * - The private key appears exactly once, in `WalletExportResult`, as the
 *   response of a re-authenticated, explicitly confirmed export call. It is
 *   never cached, persisted or logged by the client.
 */

export type ISODate = string;

/* ── Identity ─────────────────────────────────────────────── */

export interface SessionUser {
  /** Google `sub` — the primary identity of the web session. */
  googleSub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatarUrl: string | null;
  /** Present only after an explicit, code-verified Telegram account link. */
  telegramId: string | null;
  telegramUsername: string | null;
  linkedAt: ISODate | null;
}

export interface LinkChallenge {
  /** Short-lived code the user sends to the Telegram bot to prove ownership. */
  code: string;
  expiresAt: ISODate;
}

/* ── Agent / status ───────────────────────────────────────── */

export interface AgentStatus {
  agentEnabled: boolean;
  dryRun: boolean;
  isBlocked: boolean;
  onboardedAt: ISODate | null;
  /** Scheduler heartbeat coming from the BullMQ cycle queue. */
  lastCycleAt: ISODate | null;
  nextCycleAt: ISODate | null;
  queueHealthy: boolean;
  rpcHealthy: boolean;
  openPositions: number;
  solBalance: number;
  solPriceUsd: number;
  activeWalletPublicKey: string | null;
}

/* ── Wallets ──────────────────────────────────────────────── */

export interface WalletSummary {
  id: string;
  publicKey: string;
  isActive: boolean;
  createdAt: ISODate;
  lastExportedAt: ISODate | null;
  exportCount: number;
  solBalance: number;
  usdValue: number;
}

export interface WalletExportResult {
  publicKey: string;
  /** base58 secret key — display once, never store. */
  privateKey: string;
  exportedAt: ISODate;
}

/* ── Positions ────────────────────────────────────────────── */

export interface Position {
  id: string;
  positionAddress: string;
  pool: string;
  poolName: string | null;
  strategy: string | null;
  binRange: [number, number] | null;
  binStep: number | null;
  amountSol: number | null;
  initialValueUsd: number | null;
  currentValueUsd: number | null;
  pnlUsd: number | null;
  pnlPct: number | null;
  totalFeesClaimedUsd: number;
  peakPnlPct: number;
  trailingActive: boolean;
  inRange: boolean;
  outOfRangeSince: ISODate | null;
  rebalanceCount: number;
  deployedAt: ISODate;
  closed: boolean;
  closedAt: ISODate | null;
  notes: string[];
}

export interface PositionEvent {
  id: string;
  ts: ISODate;
  action: string;
  position: string | null;
  poolName: string | null;
  reason: string | null;
}

/* ── PnL ──────────────────────────────────────────────────── */

export interface PnlDay {
  /** YYYY-MM-DD */
  date: string;
  pnlUsd: number;
  feesUsd: number;
  trades: number;
}

export interface PnlSummary {
  realizedUsd: number;
  unrealizedUsd: number;
  feesUsd: number;
  netUsd: number;
  winRate: number;
  totalTrades: number;
  bestDay: PnlDay | null;
  worstDay: PnlDay | null;
  days: PnlDay[];
}

export interface PerformanceRecord {
  id: string;
  position: string;
  poolName: string | null;
  strategy: string | null;
  amountSol: number | null;
  feesEarnedUsd: number | null;
  pnlUsd: number | null;
  pnlPct: number | null;
  minutesHeld: number | null;
  minutesInRange: number | null;
  rangeEfficiency: number | null;
  closeReason: string | null;
  closedAt: ISODate;
}

/* ── Lessons, decisions, screening, study ─────────────────── */

export interface Lesson {
  id: string;
  rule: string;
  tags: string[];
  role: string | null;
  outcome: string | null;
  source: "local" | "manual" | "performance" | "config_change" | "hivemind";
  score: number | null;
  pinned: boolean;
  createdAt: ISODate;
}

export interface DecisionLog {
  id: string;
  ts: ISODate;
  type: string;
  actor: string;
  poolName: string | null;
  summary: string | null;
  reason: string | null;
  risks: string[];
  rejected: string[];
}

export interface PoolCandidate {
  pool: string;
  poolName: string;
  baseMint: string;
  binStep: number;
  tvlUsd: number;
  volume24hUsd: number;
  feeTvl24h: number;
  volatility: number;
  organicScore: number;
  mcapUsd: number;
  holders: number;
  score: number;
  verdict: "deploy" | "watch" | "reject";
  risks: string[];
}

export interface Briefing {
  id: string;
  createdAt: ISODate;
  headline: string;
  marketRegime: string;
  body: string;
  highlights: string[];
}

export interface StudyReport {
  pool: string;
  poolName: string;
  createdAt: ISODate;
  summary: string;
  indicators: { label: string; value: string; tone: "good" | "bad" | "neutral" }[];
  recommendation: string;
}

/* ── Configuration ────────────────────────────────────────── */

export type ConfigFieldType = "number" | "string" | "boolean" | "select" | "secret";

export interface ConfigField {
  /** Flat key exactly as the bot's CONFIG_MAP exposes it, e.g. `risk.maxPositions`. */
  key: string;
  label: string;
  type: ConfigFieldType;
  value: string | number | boolean | null;
  defaultValue: string | number | boolean | null;
  description?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
  /** For secrets: masked preview only, e.g. `sk-…9f2a`. Never plaintext. */
  masked?: string | null;
}

export interface ConfigSection {
  key: string;
  label: string;
  description: string;
  fields: ConfigField[];
}

/* ── Chat ─────────────────────────────────────────────────── */

export type ChatRole = "user" | "agent";

export interface ChatAction {
  id: string;
  label: string;
  /** Route the button navigates to, when the action maps to a page. */
  to?: string;
  tone?: "default" | "primary" | "danger";
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: ISODate;
  status: "sending" | "streaming" | "sent" | "error";
  actions?: ChatAction[];
}

/* ── Notifications ────────────────────────────────────────── */

export type NotificationKind =
  | "position_opened"
  | "position_closed"
  | "pnl_result"
  | "deploy_success"
  | "deploy_failure"
  | "close_success"
  | "close_failure"
  | "agent_paused"
  | "agent_resumed"
  | "screening_opportunity"
  | "risk_alert"
  | "insufficient_sol"
  | "api_failure"
  | "worker_failure"
  | "config_updated"
  | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: ISODate;
  read: boolean;
  severity: "info" | "success" | "warning" | "danger";
}

/* ── Action results ───────────────────────────────────────── */

export interface ActionResult {
  ok: true;
  message: string;
}

export interface DeployRequest {
  pool: string;
  amountSol: number;
  strategy: string;
  binRangeWidth: number;
  note?: string;
}

export interface ImportWalletRequest {
  /** base58 secret key; posted over HTTPS to a protected endpoint only. */
  privateKey: string;
  makeActive: boolean;
}

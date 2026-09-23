/**
 * Development sample data.
 *
 * Used ONLY while `VITE_HYPERSCALE_API_URL` is unset (local/dev preview).
 * As soon as the real bot API URL is configured, `client.ts` talks to the
 * production service and none of this data is ever read.
 */
import type {
  AgentStatus,
  AppNotification,
  Briefing,
  ChatMessage,
  ConfigSection,
  DecisionLog,
  Lesson,
  PerformanceRecord,
  PnlDay,
  PnlSummary,
  PoolCandidate,
  Position,
  PositionEvent,
  StudyReport,
  WalletSummary,
} from "./types";

const now = Date.now();
const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

export const sampleAgentStatus: AgentStatus = {
  agentEnabled: true,
  dryRun: false,
  isBlocked: false,
  onboardedAt: iso(60 * 24 * 32),
  lastCycleAt: iso(4),
  nextCycleAt: new Date(now + 11 * 60_000).toISOString(),
  queueHealthy: true,
  rpcHealthy: true,
  openPositions: 3,
  solBalance: 42.187,
  solPriceUsd: 187.42,
  activeWalletPublicKey: "ECYks1hYG3xVRyYpwq8Rn7Qm4T9vLd2sXbHJ3kPzQ1aF",
};

export const sampleWallets: WalletSummary[] = [
  {
    id: "wal_1",
    publicKey: "ECYks1hYG3xVRyYpwq8Rn7Qm4T9vLd2sXbHJ3kPzQ1aF",
    isActive: true,
    createdAt: iso(60 * 24 * 32),
    lastExportedAt: iso(60 * 24 * 9),
    exportCount: 1,
    solBalance: 42.187,
    usdValue: 42.187 * 187.42,
  },
  {
    id: "wal_2",
    publicKey: "7Lp4JBapgNhXoxpJtR2tYcVv1uMq8ZaWk3EdN5sTbGqH",
    isActive: false,
    createdAt: iso(60 * 24 * 12),
    lastExportedAt: null,
    exportCount: 0,
    solBalance: 3.402,
    usdValue: 3.402 * 187.42,
  },
];

export const samplePositions: Position[] = [
  {
    id: "pos_1",
    positionAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    pool: "9Qk1mZeF7ubQ6bN2XwJ1dTr8YqA5hLxPvC3sWg4KjRtU",
    poolName: "BONK-SOL",
    strategy: "spot-balanced",
    binRange: [-34, 34],
    binStep: 20,
    amountSol: 12.5,
    initialValueUsd: 2342.75,
    currentValueUsd: 2488.19,
    pnlUsd: 145.44,
    pnlPct: 6.21,
    totalFeesClaimedUsd: 88.4,
    peakPnlPct: 8.9,
    trailingActive: true,
    inRange: true,
    outOfRangeSince: null,
    rebalanceCount: 2,
    deployedAt: iso(60 * 29),
    closed: false,
    closedAt: null,
    notes: ["Trailing armed at +8.9%", "Rebalanced after bin drift"],
  },
  {
    id: "pos_2",
    positionAddress: "5Fq8LmT2xVb9PdR4nYzK7wJc1sHa3EuGt6QoZi0MvNrX",
    pool: "3Hw7LsA9cVn4TmY2pQxK8dJz1RfB6EgUo5NiZt0XqMrC",
    poolName: "JUP-SOL",
    strategy: "curve-tight",
    binRange: [-18, 18],
    binStep: 10,
    amountSol: 8,
    initialValueUsd: 1499.36,
    currentValueUsd: 1442.08,
    pnlUsd: -57.28,
    pnlPct: -3.82,
    totalFeesClaimedUsd: 21.9,
    peakPnlPct: 2.1,
    trailingActive: false,
    inRange: false,
    outOfRangeSince: iso(52),
    rebalanceCount: 0,
    deployedAt: iso(60 * 7),
    closed: false,
    closedAt: null,
    notes: ["Out of range 52m — watching for re-entry"],
  },
  {
    id: "pos_3",
    positionAddress: "2Ejnns2Fd5gsZdFJbnkZ9wQpT7mLx4CvRa1YbUo6HgSt",
    pool: "8Km3RtQ5nZa7XwJ9pLd2VcB4sYe1HgFo0TiUq6MxNrWz",
    poolName: "WIF-SOL",
    strategy: "spot-wide",
    binRange: [-60, 60],
    binStep: 25,
    amountSol: 6.25,
    initialValueUsd: 1171.38,
    currentValueUsd: 1203.02,
    pnlUsd: 31.64,
    pnlPct: 2.7,
    totalFeesClaimedUsd: 12.05,
    peakPnlPct: 4.4,
    trailingActive: false,
    inRange: true,
    outOfRangeSince: null,
    rebalanceCount: 1,
    deployedAt: iso(60 * 3),
    closed: false,
    closedAt: null,
    notes: [],
  },
];

export const samplePositionEvents: PositionEvent[] = [
  { id: "ev_1", ts: iso(4), action: "cycle_complete", position: null, poolName: null, reason: "3 positions checked" },
  { id: "ev_2", ts: iso(52), action: "out_of_range", position: "5Fq8Lm…MvNrX", poolName: "JUP-SOL", reason: "price left bin range" },
  { id: "ev_3", ts: iso(96), action: "fees_claimed", position: "DezXAZ…pPB263", poolName: "BONK-SOL", reason: "$18.40 claimed" },
  { id: "ev_4", ts: iso(180), action: "rebalance", position: "DezXAZ…pPB263", poolName: "BONK-SOL", reason: "bin drift > 40%" },
  { id: "ev_5", ts: iso(420), action: "deploy", position: "2Ejnns…o6HgSt", poolName: "WIF-SOL", reason: "score 0.81, fee/TVL 1.9%" },
];

function buildDays(): PnlDay[] {
  const days: PnlDay[] = [];
  for (let i = 44; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000);
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const frac = seed - Math.floor(seed);
    const trades = i % 7 === 0 ? 0 : Math.round(frac * 4);
    const pnlUsd = trades === 0 ? 0 : Number(((frac - 0.38) * 420).toFixed(2));
    days.push({
      date: d.toISOString().slice(0, 10),
      pnlUsd,
      feesUsd: trades === 0 ? 0 : Number((frac * 62).toFixed(2)),
      trades,
    });
  }
  return days;
}

const days = buildDays();
const realized = days.reduce((s, d) => s + d.pnlUsd, 0);
const fees = days.reduce((s, d) => s + d.feesUsd, 0);
const trades = days.reduce((s, d) => s + d.trades, 0);
const wins = days.filter((d) => d.pnlUsd > 0).length;

export const samplePnl: PnlSummary = {
  realizedUsd: Number(realized.toFixed(2)),
  unrealizedUsd: Number(samplePositions.reduce((s, p) => s + (p.pnlUsd ?? 0), 0).toFixed(2)),
  feesUsd: Number(fees.toFixed(2)),
  netUsd: Number((realized + samplePositions.reduce((s, p) => s + (p.pnlUsd ?? 0), 0)).toFixed(2)),
  winRate: Number(((wins / days.filter((d) => d.trades > 0).length) * 100).toFixed(1)),
  totalTrades: trades,
  bestDay: days.reduce((a, b) => (b.pnlUsd > a.pnlUsd ? b : a), days[0]),
  worstDay: days.reduce((a, b) => (b.pnlUsd < a.pnlUsd ? b : a), days[0]),
  days,
};

export const samplePerformance: PerformanceRecord[] = [
  {
    id: "perf_1",
    position: "9Xr2Tq…Lm4Pz",
    poolName: "POPCAT-SOL",
    strategy: "curve-tight",
    amountSol: 10,
    feesEarnedUsd: 142.8,
    pnlUsd: 214.5,
    pnlPct: 11.4,
    minutesHeld: 612,
    minutesInRange: 548,
    rangeEfficiency: 0.895,
    closeReason: "take_profit",
    closedAt: iso(60 * 20),
  },
  {
    id: "perf_2",
    position: "4Bn8Kd…Ty7Qs",
    poolName: "MEW-SOL",
    strategy: "spot-balanced",
    amountSol: 7.5,
    feesEarnedUsd: 31.2,
    pnlUsd: -96.4,
    pnlPct: -6.9,
    minutesHeld: 188,
    minutesInRange: 91,
    rangeEfficiency: 0.484,
    closeReason: "stop_loss",
    closedAt: iso(60 * 44),
  },
  {
    id: "perf_3",
    position: "1Zc5Vb…Nk9Rd",
    poolName: "JTO-SOL",
    strategy: "spot-wide",
    amountSol: 15,
    feesEarnedUsd: 208.9,
    pnlUsd: 318.75,
    pnlPct: 9.1,
    minutesHeld: 1440,
    minutesInRange: 1302,
    rangeEfficiency: 0.904,
    closeReason: "trailing_stop",
    closedAt: iso(60 * 72),
  },
];

export const sampleLessons: Lesson[] = [
  {
    id: "les_1",
    rule: "Skip pools where the dev wallet still holds more than 5% of supply — 4 of the last 5 such deploys ended in a stop-loss.",
    tags: ["risk", "dev-wallet"],
    role: "screener",
    outcome: "negative",
    source: "performance",
    score: 0.82,
    pinned: true,
    createdAt: iso(60 * 26),
  },
  {
    id: "les_2",
    rule: "Tight curve ranges outperform on pools with fee/TVL above 1.5% and volatility under 0.4.",
    tags: ["strategy", "range"],
    role: "manager",
    outcome: "positive",
    source: "local",
    score: 0.74,
    pinned: false,
    createdAt: iso(60 * 90),
  },
  {
    id: "les_3",
    rule: "Arm the trailing stop once unrealised PnL passes +8%; giving back peaks was the biggest drag last month.",
    tags: ["exit", "trailing"],
    role: "manager",
    outcome: "positive",
    source: "manual",
    score: null,
    pinned: true,
    createdAt: iso(60 * 200),
  },
];

export const sampleDecisions: DecisionLog[] = [
  {
    id: "dec_1",
    ts: iso(12),
    type: "screen",
    actor: "screener",
    poolName: "BONK-SOL",
    summary: "Ranked #1 of 42 candidates",
    reason: "fee/TVL 2.1%, organic score 0.78, holders growing",
    risks: ["top-10 holders 28%"],
    rejected: ["PEPE-SOL: tvl too low", "MOTHER-SOL: dev wallet active"],
  },
  {
    id: "dec_2",
    ts: iso(58),
    type: "manage",
    actor: "manager",
    poolName: "JUP-SOL",
    summary: "Hold while out of range",
    reason: "drift 12m only, spread still profitable after fees",
    risks: ["impermanent loss rising"],
    rejected: [],
  },
];

export const sampleCandidates: PoolCandidate[] = [
  {
    pool: "9Qk1mZeF7ubQ6bN2XwJ1dTr8YqA5hLxPvC3sWg4KjRtU",
    poolName: "BONK-SOL",
    baseMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    binStep: 20,
    tvlUsd: 67_800_000,
    volume24hUsd: 180_400_000,
    feeTvl24h: 0.021,
    volatility: 0.33,
    organicScore: 0.78,
    mcapUsd: 1_400_000_000,
    holders: 415_000,
    score: 0.86,
    verdict: "deploy",
    risks: ["top holders 28%"],
  },
  {
    pool: "3Hw7LsA9cVn4TmY2pQxK8dJz1RfB6EgUo5NiZt0XqMrC",
    poolName: "JUP-SOL",
    baseMint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    binStep: 10,
    tvlUsd: 22_100_000,
    volume24hUsd: 41_900_000,
    feeTvl24h: 0.014,
    volatility: 0.27,
    organicScore: 0.71,
    mcapUsd: 890_000_000,
    holders: 232_000,
    score: 0.69,
    verdict: "watch",
    risks: ["volume trending down"],
  },
  {
    pool: "6Tn2QwE8rYu1IoP3aSd5FgH7jKl9ZxC4vB0nM2qW3eR5",
    poolName: "MOTHER-SOL",
    baseMint: "3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN",
    binStep: 25,
    tvlUsd: 3_200_000,
    volume24hUsd: 8_100_000,
    feeTvl24h: 0.009,
    volatility: 0.61,
    organicScore: 0.41,
    mcapUsd: 74_000_000,
    holders: 61_000,
    score: 0.31,
    verdict: "reject",
    risks: ["dev wallet active", "liquidity thin", "volatility high"],
  },
];

export const sampleBriefing: Briefing = {
  id: "brf_1",
  createdAt: iso(120),
  headline: "Risk-on drifting sideways — fee capture over directional bets",
  marketRegime: "Neutral / chop",
  body:
    "SOL held the 182–191 band overnight with declining realised volatility. DEX volume is concentrated in two memecoin pairs, " +
    "so fee capture remains attractive on tight ranges while directional exposure is not being rewarded. " +
    "Two of three open positions sit comfortably in range; JUP-SOL drifted out 52 minutes ago and is the only one worth watching.",
  highlights: [
    "Prefer tight curve ranges while volatility stays under 0.35",
    "BONK-SOL remains the best fee/TVL pool on the screener",
    "Keep dry powder: 42 SOL idle, no need to size up into chop",
  ],
};

export const sampleStudy: StudyReport = {
  pool: "9Qk1mZeF7ubQ6bN2XwJ1dTr8YqA5hLxPvC3sWg4KjRtU",
  poolName: "BONK-SOL",
  createdAt: iso(30),
  summary:
    "BONK-SOL shows strong short-term traction: $1.4B market cap, 7-day liquidity trend +8.2%, and $180M of 24h volume against " +
    "a $67.8M pool. Slippage stays under 0.5% for our typical size. Centralisation is the main risk — the top holders control " +
    "roughly 5.8B tokens and the dev wallet is still funded.",
  indicators: [
    { label: "RSI (1h)", value: "58.4", tone: "neutral" },
    { label: "MACD", value: "Bullish cross", tone: "good" },
    { label: "ATR (24h)", value: "3.1%", tone: "neutral" },
    { label: "Fee / TVL 24h", value: "2.1%", tone: "good" },
    { label: "Holder growth 24h", value: "+2.4%", tone: "good" },
    { label: "Top-10 holders", value: "28%", tone: "bad" },
  ],
  recommendation: "Deploy a tight curve range with a 6% stop and trailing armed at +8%.",
};

export const sampleNotifications: AppNotification[] = [
  {
    id: "ntf_1",
    kind: "position_opened",
    title: "Position opened — WIF-SOL",
    body: "6.25 SOL deployed, spot-wide range ±60 bins.",
    createdAt: iso(180),
    read: false,
    severity: "success",
  },
  {
    id: "ntf_2",
    kind: "risk_alert",
    title: "JUP-SOL out of range",
    body: "Price left the bin range 52 minutes ago. Fees paused.",
    createdAt: iso(52),
    read: false,
    severity: "warning",
  },
  {
    id: "ntf_3",
    kind: "pnl_result",
    title: "Position closed +$214.50",
    body: "POPCAT-SOL closed on take-profit after 10h 12m in range.",
    createdAt: iso(60 * 20),
    read: true,
    severity: "success",
  },
  {
    id: "ntf_4",
    kind: "config_updated",
    title: "Configuration updated",
    body: "risk.maxPositions changed 3 → 4. Scheduler refreshed.",
    createdAt: iso(60 * 30),
    read: true,
    severity: "info",
  },
  {
    id: "ntf_5",
    kind: "api_failure",
    title: "RPC timeout recovered",
    body: "Primary RPC failed twice, circuit breaker reset after 40s.",
    createdAt: iso(60 * 38),
    read: true,
    severity: "danger",
  },
];

export const sampleChat: ChatMessage[] = [
  {
    id: "msg_1",
    role: "agent",
    content:
      "Agent is live and not in dry-run. 3 positions open, 42.19 SOL idle on ECYks1…Q1aF. Unrealised PnL is +$119.80 today.",
    createdAt: iso(46),
    status: "sent",
    actions: [
      { id: "a1", label: "Open positions", to: "/positions" },
      { id: "a2", label: "PnL", to: "/pnl" },
    ],
  },
  {
    id: "msg_2",
    role: "user",
    content: "Why is JUP-SOL out of range?",
    createdAt: iso(44),
    status: "sent",
  },
  {
    id: "msg_3",
    role: "agent",
    content:
      "Price moved below the lower bin 52 minutes ago after a 2.4% drop in JUP. The position stopped earning fees but impermanent " +
      "loss is still small (−3.8%). I am holding: re-entry cost exceeds the expected loss if price mean-reverts within the hour.",
    createdAt: iso(43),
    status: "sent",
    actions: [
      { id: "a3", label: "Close position", to: "/positions", tone: "danger" },
      { id: "a4", label: "Study pool", to: "/study" },
    ],
  },
];

export const sampleConfig: ConfigSection[] = [
  {
    key: "risk",
    label: "Risk",
    description: "Position sizing and hard limits enforced before every deploy.",
    fields: [
      { key: "risk.maxPositions", label: "Max open positions", type: "number", value: 4, defaultValue: 3, min: 1, max: 10 },
      { key: "risk.positionSizeSol", label: "Position size", type: "number", value: 12.5, defaultValue: 5, unit: "SOL", min: 0.1 },
      { key: "risk.minSolBuffer", label: "Minimum SOL buffer", type: "number", value: 1.5, defaultValue: 1, unit: "SOL", min: 0 },
      { key: "risk.stopLossPct", label: "Stop loss", type: "number", value: 6, defaultValue: 8, unit: "%", min: 1, max: 50 },
      { key: "risk.takeProfitPct", label: "Take profit", type: "number", value: 14, defaultValue: 12, unit: "%", min: 1 },
      { key: "risk.trailingArmPct", label: "Arm trailing stop at", type: "number", value: 8, defaultValue: 10, unit: "%", min: 1 },
    ],
  },
  {
    key: "screening",
    label: "Screening",
    description: "Filters applied to every candidate pool before it can be deployed into.",
    fields: [
      { key: "screening.minTvlUsd", label: "Minimum TVL", type: "number", value: 5_000_000, defaultValue: 2_000_000, unit: "USD" },
      { key: "screening.minVolume24hUsd", label: "Minimum 24h volume", type: "number", value: 10_000_000, defaultValue: 5_000_000, unit: "USD" },
      { key: "screening.minFeeTvl24h", label: "Minimum fee / TVL", type: "number", value: 1.2, defaultValue: 1, unit: "%" },
      { key: "screening.maxVolatility", label: "Maximum volatility", type: "number", value: 0.45, defaultValue: 0.6 },
      { key: "screening.minOrganicScore", label: "Minimum organic score", type: "number", value: 0.6, defaultValue: 0.5, min: 0, max: 1 },
      { key: "screening.blockDevActive", label: "Reject active dev wallets", type: "boolean", value: true, defaultValue: true },
    ],
  },
  {
    key: "management",
    label: "Management",
    description: "How open positions are monitored, rebalanced and exited.",
    fields: [
      { key: "management.rebalanceOnDriftPct", label: "Rebalance on bin drift", type: "number", value: 40, defaultValue: 50, unit: "%" },
      { key: "management.outOfRangeGraceMin", label: "Out-of-range grace", type: "number", value: 90, defaultValue: 60, unit: "min" },
      { key: "management.claimFeesEveryMin", label: "Claim fees every", type: "number", value: 120, defaultValue: 180, unit: "min" },
      { key: "management.autoClose", label: "Auto close on exit signal", type: "boolean", value: true, defaultValue: true },
    ],
  },
  {
    key: "strategy",
    label: "Strategy",
    description: "Default range shape used when the manager deploys liquidity.",
    fields: [
      {
        key: "strategy.defaultShape",
        label: "Default shape",
        type: "select",
        value: "spot-balanced",
        defaultValue: "spot-balanced",
        options: ["spot-balanced", "spot-wide", "curve-tight", "bid-ask"],
      },
      { key: "strategy.binRangeWidth", label: "Default range width", type: "number", value: 34, defaultValue: 40, unit: "bins" },
      { key: "strategy.allowAutoStrategy", label: "Let the agent pick the shape", type: "boolean", value: true, defaultValue: true },
    ],
  },
  {
    key: "schedule",
    label: "Schedule",
    description: "Cycle cadence driven by the scheduler. Saving refreshes the queue.",
    fields: [
      { key: "schedule.cycleMinutes", label: "Trading cycle", type: "number", value: 15, defaultValue: 15, unit: "min", min: 1 },
      { key: "schedule.screenMinutes", label: "Screening cycle", type: "number", value: 30, defaultValue: 30, unit: "min", min: 5 },
      { key: "schedule.briefingHourUtc", label: "Daily briefing hour", type: "number", value: 7, defaultValue: 6, unit: "UTC", min: 0, max: 23 },
    ],
  },
  {
    key: "llm",
    label: "Model",
    description: "Reasoning model used by the screener, manager and study tools.",
    fields: [
      { key: "llm.model", label: "Model", type: "string", value: "gpt-4.1-mini", defaultValue: "gpt-4.1-mini" },
      { key: "llm.temperature", label: "Temperature", type: "number", value: 0.2, defaultValue: 0.3, min: 0, max: 2 },
      { key: "llm.maxTokens", label: "Max tokens", type: "number", value: 4096, defaultValue: 4096 },
    ],
  },
  {
    key: "api",
    label: "API keys & endpoints",
    description: "Stored encrypted on the server. Values are never returned in plaintext.",
    fields: [
      { key: "api.rpcUrl", label: "Primary RPC URL", type: "secret", value: null, defaultValue: null, masked: "https://mainnet…/9f2a" },
      { key: "api.pnlRpcUrl", label: "PnL RPC URL", type: "secret", value: null, defaultValue: null, masked: "https://rpc…/4c71" },
      { key: "api.heliusApiKey", label: "Helius API key", type: "secret", value: null, defaultValue: null, masked: "hel_…8d13" },
      { key: "api.openrouterApiKey", label: "OpenRouter API key", type: "secret", value: null, defaultValue: null, masked: "sk-or…a94f" },
      { key: "api.gmgnApiKey", label: "GMGN API key", type: "secret", value: null, defaultValue: null, masked: null },
      { key: "api.hiveMindApiKey", label: "HiveMind API key", type: "secret", value: null, defaultValue: null, masked: null },
    ],
  },
];

export function usd(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function signedUsd(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${usd(value)}`;
}

export function pct(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function sol(value: number | null | undefined, digits = 3): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(digits)} SOL`;
}

export function shortAddress(address: string | null | undefined, lead = 4, tail = 4): string {
  if (!address) return "—";
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const dayCount = Math.round(hours / 24);
  if (dayCount < 30) return `${dayCount}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function toneClass(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "text-muted-foreground";
  return value > 0 ? "text-success" : "text-destructive";
}

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const BASE = process.env["SMOKE_BASE_URL"] ?? "http://localhost:8080";

// Every path linked from the app shell (sidebar, bottom nav, header).
const shellSource = readFileSync("src/components/app-shell.tsx", "utf8");
const linked = Array.from(
  new Set([...shellSource.matchAll(/to(?:=|: )"(\/[a-z-]*)"/g)].map((m) => m[1]!)),
);

describe("app shell routes", () => {
  it("finds linked routes", () => {
    expect(linked.length).toBeGreaterThan(10);
    expect(linked).toContain("/insights");
  });

  for (const path of linked) {
    it(`renders ${path}`, async () => {
      const res = await fetch(BASE + path);
      expect(res.status).toBe(200);
      const html = await res.text();
      expect(html).not.toContain("Page not found");
      expect(html).toContain("<title>");
    });
  }

  it("returns 404 page for unknown route", async () => {
    const res = await fetch(BASE + "/definitely-missing-route");
    const html = await res.text();
    expect(html).toContain("Page not found");
  });
});

describe("protected behaviour", () => {
  it("rejects unauthenticated telegram link calls", async () => {
    const res = await fetch(BASE + "/api/public/telegram/link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: "000000", telegramId: "1" }),
    });
    expect([400, 401, 403]).toContain(res.status);
  });

  it("AI insights server function requires a session", async () => {
    const src = readFileSync("src/lib/insights.functions.ts", "utf8");
    expect(src).toContain(".middleware([requireSupabaseAuth])");
  });
});

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader, SectionCard, ErrorBlock } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { explainPerformance } from "@/lib/insights.functions";
import type { PnlSummary } from "@/lib/api/types";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI insights · Hyperscale Auto LP" },
      { name: "description", content: "Ask AI to explain your LP trading results and suggest next steps." },
      { property: "og:title", content: "AI insights · Hyperscale Auto LP" },
      { property: "og:description", content: "Ask AI to explain your LP trading results and suggest next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InsightsPage,
});

function summarize(p: PnlSummary): string {
  return [
    `Net PnL: $${p.netUsd}`,
    `Realized: $${p.realizedUsd}, Unrealized: $${p.unrealizedUsd}, Fees: $${p.feesUsd}`,
    `Win rate: ${p.winRate}% over ${p.totalTrades} trades`,
    p.bestDay ? `Best day: ${p.bestDay.date} ($${p.bestDay.pnlUsd})` : "",
    p.worstDay ? `Worst day: ${p.worstDay.date} ($${p.worstDay.pnlUsd})` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SUGGESTIONS = [
  "Why was my worst day so bad?",
  "How can I improve my win rate?",
  "Should I change my risk settings?",
];

function InsightsPage() {
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const pnl = useQuery({ queryKey: ["pnl"], queryFn: () => api.getPnl() });
  const explain = useServerFn(explainPerformance);
  const mutation = useMutation({
    mutationFn: (q: string) =>
      explain({ data: { question: q, summary: summary ?? (pnl.data ? summarize(pnl.data) : "") } }),
  });

  const currentSummary = summary ?? (pnl.data ? summarize(pnl.data) : "");
  const errMsg = mutation.error instanceof Error ? mutation.error.message : "";
  const unauthorized = /unauthori[sz]ed|401/i.test(errMsg);

  function ask(q: string) {
    const trimmed = q.trim();
    if (trimmed.length < 3 || mutation.isPending) return;
    setQuestion(trimmed);
    mutation.mutate(trimmed);
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader title="AI insights" subtitle="Ask about your results and get clear, actionable next steps." />

        <SectionCard title="Performance summary" description="Sent with your question. You can edit it.">
          <textarea
            aria-label="Performance summary"
            className="min-h-32 w-full rounded-xl border border-input bg-background p-3 text-sm"
            value={currentSummary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </SectionCard>

        <SectionCard title="Your question">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <textarea
              aria-label="Question"
              className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm"
              placeholder="e.g. Why did my PnL drop this week and what should I change?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface"
                >
                  {s}
                </button>
              ))}
            </div>
            <Button type="submit" className="rounded-full" disabled={mutation.isPending || question.trim().length < 3}>
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {mutation.isPending ? "Thinking…" : "Explain my results"}
            </Button>
          </form>
        </SectionCard>

        {mutation.isError ? (
          unauthorized ? (
            <div className="rounded-2xl border border-border p-4 text-sm">
              Please sign in to use AI insights.{" "}
              <Link to="/" className="font-semibold text-primary">Sign in</Link>
            </div>
          ) : (
            <ErrorBlock message={errMsg} onRetry={() => ask(question)} />
          )
        ) : null}

        {mutation.data ? (
          <SectionCard title="AI answer">
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{mutation.data.text}</div>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}

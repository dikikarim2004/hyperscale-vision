import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance · Hyperscale Auto LP" },
      { name: "description", content: "Performance for your Hyperscale Auto LP trading agent." },
      { property: "og:title", content: "Performance · Hyperscale Auto LP" },
      { property: "og:description", content: "Performance for your Hyperscale Auto LP trading agent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-foreground">Performance</h1>
      <p className="mt-2 text-sm text-muted-foreground">This section is being built.</p>
    </AppShell>
  );
}

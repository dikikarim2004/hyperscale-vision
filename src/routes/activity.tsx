import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity · Hyperscale Auto LP" },
      { name: "description", content: "Activity for your Hyperscale Auto LP trading agent." },
      { property: "og:title", content: "Activity · Hyperscale Auto LP" },
      { property: "og:description", content: "Activity for your Hyperscale Auto LP trading agent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-foreground">Activity</h1>
      <p className="mt-2 text-sm text-muted-foreground">This section is being built.</p>
    </AppShell>
  );
}

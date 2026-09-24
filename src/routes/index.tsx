import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hyperscale Auto LP" },
      { name: "description", content: "Control panel for your Hyperscale Auto LP trading agent." },
      { property: "og:title", content: "Hyperscale Auto LP" },
      { property: "og:description", content: "Control panel for your Hyperscale Auto LP trading agent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

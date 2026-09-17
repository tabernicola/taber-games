import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/tabers-taberdoku/components/LandingPage";

export const Route = createFileRoute("/$lang/tabers-taberdoku/")({
  head: () => ({
    meta: pageMeta({
      title: "Taberdoku — The Taber Games",
      ogTitle: "Taberdoku",
      description:
        "One character per row, column, and room. No two characters can touch — not even diagonally. Choose your board size and play.",
    }),
  }),
  component: LandingPage,
});
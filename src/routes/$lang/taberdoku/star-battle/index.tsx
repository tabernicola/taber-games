import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/star-battle/components/LandingPage";

export const Route = createFileRoute("/$lang/taberdoku/star-battle/")({
  head: () => ({
    meta: pageMeta({
      title: "Star Battle — The Taber Games",
      ogTitle: "Star Battle",
      description:
        "One character per row, column, and room. No two characters can touch — not even diagonally.",
    }),
  }),
  component: LandingPage,
});

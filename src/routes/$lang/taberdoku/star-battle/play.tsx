import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/star-battle/components/PlayPage";

export const Route = createFileRoute("/$lang/taberdoku/star-battle/play")({
  head: () => ({
    meta: pageMeta({
      title: "Play Star Battle — The Taber Games",
      ogTitle: "Play Star Battle",
      description:
        "Place one character per row, column, and room. No two characters can touch — not even diagonally.",
    }),
  }),
  component: PlayPage,
});

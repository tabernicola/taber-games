import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/tabers-taberdoku/components/PlayPage";

export type TaberdokuPlaySearch = {
  size?: number | undefined;
  puzzle?: string | undefined;
};

export const Route = createFileRoute("/$lang/tabers-taberdoku/play")({
  validateSearch: (search: Record<string, unknown>): TaberdokuPlaySearch => ({
    size: search["size"] === undefined ? undefined : Number(search["size"]),
    puzzle: search["puzzle"] as string | undefined,
  }),
  head: () => ({
    meta: pageMeta({
      title: "Play Taberdoku — The Taber Games",
      ogTitle: "Play Taberdoku",
      description:
        "Place one character per row, column, and room. No two characters can touch — not even diagonally.",
    }),
  }),
  component: PlayPage,
});
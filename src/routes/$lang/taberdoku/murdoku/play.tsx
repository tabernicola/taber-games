import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/taberdoku/murdoku/components/PlayPage";

export type MurdokuPlaySearch = {
  caseId?: string | undefined;
};

export const Route = createFileRoute("/$lang/taberdoku/murdoku/play")({
  validateSearch: (search: Record<string, unknown>): MurdokuPlaySearch => ({
    caseId: search["caseId"] as string | undefined,
  }),
  head: () => ({
    meta: pageMeta({
      title: "Play Murdoku — The Taber Games",
      ogTitle: "Play Murdoku",
      description:
        "Place characters on a Sudoku-style grid and deduce the killer and victim from the clues.",
    }),
  }),
  component: PlayPage,
});

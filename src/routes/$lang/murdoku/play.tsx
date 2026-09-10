import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/murdoku/components/PlayPage";

export const Route = createFileRoute("/$lang/murdoku/play")({
  validateSearch: (search: Record<string, unknown>) => ({
    caseId: search["caseId"] as string | undefined,
  }),
  head: () => ({
    meta: pageMeta({
      title: "Play Murdoku — The Taber Games",
      ogTitle: "Play Murdoku",
      description: "Place characters on a Sudoku-style grid and deduce the killer and victim from the clues.",
    }),
  }),
  component: PlayPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/tabers-sudoku/components/PlayPage";

export const Route = createFileRoute("/$lang/tabers-sudoku/play")({
  head: () => ({
    meta: pageMeta({
      title: "Play The Taber's Sudoku — The Taber Games",
      ogTitle: "Play The Taber's Sudoku",
      description:
        "Classic 9x9 sudoku using the nine characters instead of numbers. Choose your difficulty and race against the clock.",
    }),
  }),
  component: PlayPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/tabers-sudoku/components/LandingPage";

export const Route = createFileRoute("/$lang/tabers-sudoku/")({
  head: () => ({
    meta: pageMeta({
      title: "The Taber's Sudoku — rules and ranking | The Taber Games",
      ogTitle: "The Taber's Sudoku — rules and ranking",
      description:
        "Learn how to play  The Taber's Sudoku, check the top 5 fastest solves and start a new 9x9 sudoku.",
    }),
  }),
  component: LandingPage,
});

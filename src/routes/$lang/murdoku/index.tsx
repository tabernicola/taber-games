import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/murdoku/components/LandingPage";

export const Route = createFileRoute("/$lang/murdoku/")({
  head: () => ({
    meta: pageMeta({
      title: "Murdoku — deduction puzzle | The Taber Games",
      ogTitle: "Murdoku — deduction puzzle",
      description:
        "Solve murder mystery cases on a Sudoku-style grid. Place characters, apply constraints, and deduce the killer and victim from the clues. Create and share your own cases.",
    }),
  }),
  component: LandingPage,
});

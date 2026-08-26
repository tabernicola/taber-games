import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/eternity-ii/pages/LandingPage";

export const Route = createFileRoute("/$lang/eternity-ii/")({
  head: () => ({
    meta: pageMeta({
      title: "Taber's Eternity — rules, levels and ranking | The Taber Games",
      ogTitle: "Taber's Eternity — rules, levels and ranking",
      description:
        "How to play Taber's Eternity, pick a board from 4x4 to the original 256-piece puzzle, check the fastest times and resume a saved game.",
    }),
  }),
  component: LandingPage,
});

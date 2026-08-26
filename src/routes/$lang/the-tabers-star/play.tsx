import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/tabers-star/pages/PlayPage";

export const Route = createFileRoute("/$lang/the-tabers-star/play")({
  head: () => ({
    meta: pageMeta({
      title: "Play The Taber's Star — The Taber Games",
      ogTitle: "Play The Taber's Star",
      description:
        "Solo puzzle inspired by The Genius Star. Place the blockers and fit all seven triangular pieces onto the neon star against the clock.",
    }),
  }),
  component: PlayPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/taber-square/pages/PlayPage";

export const Route = createFileRoute("/$lang/the-taber-square/play")({
  head: () => ({
    meta: pageMeta({
      title: "Play The Taber Square — The Taber Games",
      ogTitle: "Play The Taber Square",
      description:
        "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6x6 grid against the clock.",
    }),
  }),
  component: PlayPage,
});

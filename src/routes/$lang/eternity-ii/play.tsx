import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import type { LevelSize } from "@/games/eternity-ii/logic/game";
import { PlayPage } from "@/games/eternity-ii/pages/PlayPage";

export const Route = createFileRoute("/$lang/eternity-ii/play")({
  validateSearch: (search: Record<string, unknown>) => ({
    level: (Number(search["level"]) || 4) as LevelSize,
    resume: search["resume"] === true || search["resume"] === "true",
  }),
  head: () => ({
    meta: pageMeta({
      title: "Play Taber's Eternity — The Taber Games",
      ogTitle: "Play Taber's Eternity",
      description:
        "Play Taber's Eternity: edge-matching boards from 4x4 up to the original 256-piece puzzle, against the clock.",
    }),
  }),
  component: PlayPage,
});

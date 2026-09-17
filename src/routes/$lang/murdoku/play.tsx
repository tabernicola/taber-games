import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { PlayPage } from "@/games/murdoku/components/PlayPage";

export type MurdokuPlaySearch = {
  caseId?: string | undefined;
  mode?: "case" | undefined;
  level?: string | undefined;
  size?: number | undefined;
  puzzle?: string | undefined;
};

export const Route = createFileRoute("/$lang/murdoku/play")({
  validateSearch: (search: Record<string, unknown>): MurdokuPlaySearch => ({
    caseId: search["caseId"] as string | undefined,
    mode: search["mode"] as "case" | undefined,
    level: search["level"] as string | undefined,
    size: search["size"] === undefined ? undefined : Number(search["size"]),
    puzzle: search["puzzle"] as string | undefined,
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

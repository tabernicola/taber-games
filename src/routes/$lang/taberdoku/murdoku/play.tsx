import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/taberdoku/murdoku/components/PlayPage";

export type MurdokuPlaySearch = {
  caseId?: string | undefined;
};

export const Route = createFileRoute("/$lang/taberdoku/murdoku/play")({
  validateSearch: (search: Record<string, unknown>): MurdokuPlaySearch => ({
    caseId: search["caseId"] as string | undefined,
  }),
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play Murdoku — The Taber Games",
      ogTitle: "Play Murdoku",
      description:
        "Place characters on a Sudoku-style grid and deduce the killer and victim from the clues.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/murdoku/play" }),
  }),
  component: PlayPage,
});

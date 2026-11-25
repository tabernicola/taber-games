import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/tabers-sudoku/components/PlayPage";

export const Route = createFileRoute("/$lang/taberdoku/tabers-sudoku/play")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play The Taber's Sudoku — The Taber Games",
      ogTitle: "Play The Taber's Sudoku",
      description:
        "Classic 9x9 sudoku using the nine characters instead of numbers. Choose your difficulty and race against the clock.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/tabers-sudoku/play" }),
  }),
  component: PlayPage,
});

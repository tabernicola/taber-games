import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/star-battle/components/PlayPage";

export const Route = createFileRoute("/$lang/taberdoku/star-battle/play")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play Star Battle — The Taber Games",
      ogTitle: "Play Star Battle",
      description:
        "Place one character per row, column, and room. No two characters can touch — not even diagonally.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/star-battle/play" }),
  }),
  component: PlayPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/tabers-star/pages/PlayPage";

export const Route = createFileRoute("/$lang/the-tabers-star/play")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play The Taber's Star — The Taber Games",
      ogTitle: "Play The Taber's Star",
      description:
        "Solo puzzle inspired by The Genius Star. Place the blockers and fit all seven triangular pieces onto the neon star against the clock.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/the-tabers-star/play" }),
  }),
  component: PlayPage,
});

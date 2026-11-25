import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/taber-square/pages/PlayPage";

export const Route = createFileRoute("/$lang/the-taber-square/play")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play The Taber Square — The Taber Games",
      ogTitle: "Play The Taber Square",
      description:
        "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6x6 grid against the clock.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/the-taber-square/play" }),
  }),
  component: PlayPage,
});

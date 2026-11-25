import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/eternity-ii/pages/LandingPage";

export const Route = createFileRoute("/$lang/eternity-ii/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Taber's Eternity — rules, levels and ranking | The Taber Games",
      ogTitle: "Taber's Eternity — rules, levels and ranking",
      description:
        "How to play Taber's Eternity, pick a board from 4x4 to the original 256-piece puzzle, check the fastest times and resume a saved game.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/eternity-ii/" }),
  }),
  component: LandingPage,
});

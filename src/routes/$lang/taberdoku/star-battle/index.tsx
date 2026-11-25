import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/star-battle/components/LandingPage";

export const Route = createFileRoute("/$lang/taberdoku/star-battle/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Star Battle — The Taber Games",
      ogTitle: "Star Battle",
      description:
        "One character per row, column, and room. No two characters can touch — not even diagonally.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/star-battle/" }),
  }),
  component: LandingPage,
});

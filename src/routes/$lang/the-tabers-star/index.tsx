import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/tabers-star/pages/LandingPage";

export const Route = createFileRoute("/$lang/the-tabers-star/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "The Taber's Star — rules and ranking | The Taber Games",
      ogTitle: "The Taber's Star — rules and ranking",
      description:
        "Learn how to play The Taber's Star, check the top 5 fastest solves and start a new star-shaped puzzle.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/the-tabers-star/" }),
  }),
  component: LandingPage,
});

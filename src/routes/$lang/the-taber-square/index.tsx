import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/taber-square/pages/LandingPage";

export const Route = createFileRoute("/$lang/the-taber-square/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "The Taber Square — rules and ranking | The Taber Games",
      ogTitle: "The Taber Square — rules and ranking",
      description:
        "Learn how to play The Taber Square, check the top 5 fastest solves and start a new 6x6 puzzle.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/the-taber-square/" }),
  }),
  component: LandingPage,
});

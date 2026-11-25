import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/taberdoku/murdoku/components/LandingPage";

export const Route = createFileRoute("/$lang/taberdoku/murdoku/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Murdoku — deduction puzzle | The Taber Games",
      ogTitle: "Murdoku — deduction puzzle",
      description:
        "Solve murder mystery cases on a Sudoku-style grid. Place characters, apply constraints, and deduce the killer and victim from the clues. Create and share your own cases.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/murdoku/" }),
  }),
  component: LandingPage,
});

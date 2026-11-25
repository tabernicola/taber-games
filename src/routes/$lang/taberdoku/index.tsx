import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { Home } from "@/games/taberdoku/components/Home";

export const Route = createFileRoute("/$lang/taberdoku/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Taberdoku — The Taber Games",
      ogTitle: "Taberdoku",
      description:
        "Three Sudoku-style deduction games in one: Murdoku, Star Battle, and classic Sudoku. Choose your game.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/" }),
  }),
  component: Home,
});

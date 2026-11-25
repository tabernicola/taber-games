import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { BoardCreator } from "@/games/taberdoku/murdoku/components/BoardCreator";

export const Route = createFileRoute("/$lang/taberdoku/murdoku/boards/create")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Create a board — Murdoku | The Taber Games",
      ogTitle: "Create a Murdoku board",
      description: "Create a Murdoku board with custom regions and cell elements.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/murdoku/boards/create" }),
  }),
  component: BoardCreator,
});

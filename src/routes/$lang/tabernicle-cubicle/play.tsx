import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { PlayPage } from "@/games/tabernicle-cubicle/pages/PlayPage";

export const Route = createFileRoute("/$lang/tabernicle-cubicle/play")({
  validateSearch: (search: Record<string, unknown>) => ({
    stage: search["stage"] ? Number(search["stage"]) : undefined,
  }),
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Play Tabernicle Cubicle — The Taber Games",
      ogTitle: "Play Tabernicle Cubicle",
      description:
        "Play Tabernicle Cubicle: retro arcade puzzle inspired by Kickle Cubicle. Calcinate monsters, fill lava and rescue dino eggs.",
      ogImage: "/tabernicle-cubicle/taber-v2.png",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/tabernicle-cubicle/play" }),
  }),
  component: PlayPage,
});

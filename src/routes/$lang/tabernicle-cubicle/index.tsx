import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { LandingPage } from "@/games/tabernicle-cubicle/pages/LandingPage";

export const Route = createFileRoute("/$lang/tabernicle-cubicle/")({
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Tabernicle Cubicle — The Taber Games",
      ogTitle: "Tabernicle Cubicle — Arcade Puzzle",
      description:
        "Retro arcade puzzle inspired by Kickle Cubicle with inverted fire & lava mechanics. Calcinate monsters, fill lava pools and collect dinosaur eggs.",
      ogImage: "/tabernicle-cubicle/taber-v2.png",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/tabernicle-cubicle/" }),
  }),
  component: LandingPage,
});

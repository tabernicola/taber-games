import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/tabernicle-cubicle/pages/LandingPage";

export const Route = createFileRoute("/$lang/tabernicle-cubicle/")({
  head: () => ({
    meta: pageMeta({
      title: "Tabernicle Cubicle — The Taber Games",
      ogTitle: "Tabernicle Cubicle — Arcade Puzzle",
      description:
        "Retro arcade puzzle inspired by Kickle Cubicle with inverted fire & lava mechanics. Calcinate monsters, fill lava pools and collect dinosaur eggs.",
      ogImage: "/tabernicle-cubicle/taber-v2.png",
    }),
  }),
  component: LandingPage,
});

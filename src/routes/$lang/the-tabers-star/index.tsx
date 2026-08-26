import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/tabers-star/pages/LandingPage";

export const Route = createFileRoute("/$lang/the-tabers-star/")({
  head: () => ({
    meta: pageMeta({
      title: "The Taber's Star — rules and ranking | The Taber Games",
      ogTitle: "The Taber's Star — rules and ranking",
      description:
        "Learn how to play The Taber's Star, check the top 5 fastest solves and start a new star-shaped puzzle.",
    }),
  }),
  component: LandingPage,
});

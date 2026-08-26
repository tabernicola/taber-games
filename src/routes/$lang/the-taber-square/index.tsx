import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { LandingPage } from "@/games/taber-square/pages/LandingPage";

export const Route = createFileRoute("/$lang/the-taber-square/")({
  head: () => ({
    meta: pageMeta({
      title: "The Taber Square — rules and ranking | The Taber Games",
      ogTitle: "The Taber Square — rules and ranking",
      description:
        "Learn how to play The Taber Square, check the top 5 fastest solves and start a new 6x6 puzzle.",
    }),
  }),
  component: LandingPage,
});

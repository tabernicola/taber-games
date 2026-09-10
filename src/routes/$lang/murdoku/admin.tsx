import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { AdminPanel } from "@/games/murdoku/components/AdminPanel";

export const Route = createFileRoute("/$lang/murdoku/admin")({
  head: () => ({
    meta: pageMeta({
      title: "Admin — Case moderation | The Taber Games",
      ogTitle: "Murdoku admin panel",
      description: "Moderate pending murdoku cases — approve or reject player-submitted mysteries.",
    }),
  }),
  component: AdminPanel,
});

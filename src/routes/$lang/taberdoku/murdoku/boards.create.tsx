import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { BoardCreator } from "@/games/taberdoku/murdoku/components/BoardCreator";

export const Route = createFileRoute("/$lang/taberdoku/murdoku/boards/create")({
  head: () => ({
    meta: pageMeta({
      title: "Create a board — Murdoku | The Taber Games",
      ogTitle: "Create a Murdoku board",
      description: "Create a Murdoku board with custom regions and cell elements.",
    }),
  }),
  component: BoardCreator,
});

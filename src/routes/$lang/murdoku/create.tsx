import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { CaseEditor } from "@/games/murdoku/components/CaseEditor";

export const Route = createFileRoute("/$lang/murdoku/create")({
  head: () => ({
    meta: pageMeta({
      title: "Create a case — Murdoku | The Taber Games",
      ogTitle: "Create a murdoku case",
      description: "Create your own murder mystery deduction case and submit it for review.",
    }),
  }),
  component: CaseEditor,
});

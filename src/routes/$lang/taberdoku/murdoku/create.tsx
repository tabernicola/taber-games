import { createFileRoute } from "@tanstack/react-router";
import { pageMeta } from "@/platform/seo";
import { CaseEditor } from "@/games/taberdoku/murdoku/components/CaseEditor";

export const Route = createFileRoute("/$lang/taberdoku/murdoku/create")({
  validateSearch: (search: Record<string, unknown>) => ({
    boardId: typeof search["boardId"] === "string" ? search["boardId"] : undefined,
  }),
  head: () => ({
    meta: pageMeta({
      title: "Create a case — Murdoku | The Taber Games",
      ogTitle: "Create a murdoku case",
      description: "Create your own murder mystery deduction case and submit it for review.",
    }),
  }),
  component: CreateCasePage,
});

function CreateCasePage() {
  const { boardId } = Route.useSearch();
  return <CaseEditor initialBoardId={boardId} />;
}

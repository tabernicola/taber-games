import { createFileRoute } from "@tanstack/react-router";
import { pageMeta, seoLinks } from "@/platform/seo";
import type { LangSlug } from "@/platform/i18n/engine";
import { CaseEditor } from "@/games/taberdoku/murdoku/components/CaseEditor";

export const Route = createFileRoute("/$lang/taberdoku/murdoku/create")({
  validateSearch: (search: Record<string, unknown>): { boardId?: string } =>
    typeof search["boardId"] === "string" ? { boardId: search["boardId"] } : {},
  head: ({ params }) => ({
    meta: pageMeta({
      title: "Create a case — Murdoku | The Taber Games",
      ogTitle: "Create a murdoku case",
      description: "Create your own murder mystery deduction case and submit it for review.",
    }),
    links: seoLinks({ lang: params.lang as LangSlug, path: "/taberdoku/murdoku/create" }),
  }),
  component: CreateCasePage,
});

function CreateCasePage() {
  const { boardId } = Route.useSearch();
  return <CaseEditor initialBoardId={boardId} />;
}

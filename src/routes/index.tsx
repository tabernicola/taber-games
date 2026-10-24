import { createFileRoute } from "@tanstack/react-router";
import { redirectToLang } from "@/lib/lang-redirect";
import { pageMeta } from "@/platform/seo";

export const Route = createFileRoute("/")({
  head: () => ({ meta: pageMeta({ title: "The Taber Games — Puzzle arcade", description: "Play The Taber Games: original puzzle challenges, character Sudoku and mysteries in Pasai Antxo." }) }),
  beforeLoad: () => redirectToLang("/$lang"),
});

import { createFileRoute } from "@tanstack/react-router";
import { redirectToLang } from "@/lib/lang-redirect";

export const Route = createFileRoute("/tabernicle-cubicle")({
  beforeLoad: () => redirectToLang("/$lang/tabernicle-cubicle"),
});

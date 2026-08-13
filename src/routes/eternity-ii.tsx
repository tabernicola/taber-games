import { createFileRoute } from "@tanstack/react-router";
import { redirectToLang } from "@/lib/lang-redirect";

export const Route = createFileRoute("/eternity-ii")({
  beforeLoad: () => redirectToLang("/$lang/eternity-ii"),
});

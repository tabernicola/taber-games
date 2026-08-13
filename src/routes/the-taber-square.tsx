import { createFileRoute } from "@tanstack/react-router";
import { redirectToLang } from "@/lib/lang-redirect";

export const Route = createFileRoute("/the-taber-square")({
  beforeLoad: () => redirectToLang("/$lang/the-taber-square"),
});

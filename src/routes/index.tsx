import { createFileRoute } from "@tanstack/react-router";
import { redirectToLang } from "@/lib/lang-redirect";

export const Route = createFileRoute("/")({
  beforeLoad: () => redirectToLang("/$lang"),
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { detectLangSlug } from "@/lib/i18n";

export const Route = createFileRoute("/eternity-ii")({
  beforeLoad: () => {
    const lang = typeof window === "undefined" ? "es" : detectLangSlug();
    throw redirect({ to: "/$lang/eternity-ii", params: { lang } });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { detectLangSlug } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const lang = typeof window === "undefined" ? "es" : detectLangSlug();
    throw redirect({ to: "/$lang", params: { lang } });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import { detectLangSlug } from "@/lib/i18n";

export const Route = createFileRoute("/the-taber-square")({
  beforeLoad: () => {
    const lang = typeof window === "undefined" ? "es" : detectLangSlug();
    throw redirect({ to: "/$lang/the-taber-square", params: { lang } });
  },
});

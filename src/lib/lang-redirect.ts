import { redirect } from "@tanstack/react-router";
import { detectLangSlug } from "@/platform/i18n";

/**
 * Sends a language-less path to its language-prefixed equivalent, picking the
 * visitor's saved or browser language. Meant to be thrown from `beforeLoad`.
 */
export function redirectToLang(
  to: "/$lang" | "/$lang/eternity-ii" | "/$lang/the-taber-square",
): never {
  throw redirect({ to, params: { lang: detectLangSlug() } });
}

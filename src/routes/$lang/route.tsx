import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { I18nProvider, langFromSlug } from "@/platform/i18n";
import { CookieBanner } from "@/platform/layout/CookieBanner";
import { appTranslations } from "@/platform/games/registry";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!langFromSlug(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const resolved = langFromSlug(lang) ?? "es";
  return (
    <I18nProvider translations={appTranslations} lang={resolved}>
      <Outlet />
      <CookieBanner />
    </I18nProvider>
  );
}

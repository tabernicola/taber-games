import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { I18nProvider, langFromSlug } from "@/lib/i18n";
import { CookieBanner } from "@/components/CookieBanner";

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
    <I18nProvider lang={resolved}>
      <Outlet />
      <CookieBanner />
    </I18nProvider>
  );
}

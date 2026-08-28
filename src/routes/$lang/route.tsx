import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { I18nProvider, langFromSlug } from "@/platform/i18n";
import { CookieBanner } from "@/platform/layout/CookieBanner";
import { appTranslations } from "@/platform/games/registry";
import { useEffect } from "react";

function LangNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Language not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The language you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/es"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Spanish
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!langFromSlug(params.lang)) throw notFound();
  },
  component: LangLayout,
  notFoundComponent: LangNotFound,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const resolved = langFromSlug(lang) ?? "es";

  useEffect(() => {
    document.documentElement.lang = resolved;
  }, [resolved]);

  return (
    <I18nProvider translations={appTranslations} lang={resolved}>
      <Outlet />
      <CookieBanner />
    </I18nProvider>
  );
}

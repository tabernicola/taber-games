import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { pageMeta } from "@/platform/seo";
import { useI18n } from "@/platform/i18n";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useIsAdmin } from "@/platform/hooks/useIsAdmin";
import { LevelEditor } from "@/games/tabernicle-cubicle/components/LevelEditor";

export const Route = createFileRoute("/$lang/tabernicle-cubicle/admin")({
  head: () => ({
    meta: pageMeta({
      title: "Editor de niveles — Tabernicle Cubicle | The Taber Games",
      ogTitle: "Editor de niveles — Tabernicle Cubicle",
      description: "Administrador visual de niveles para Tabernicle Cubicle.",
    }),
  }),
  component: TabernicleAdminPage,
});

/**
 * Admin page for editing Tabernicle Cubicle levels, gated by admin role.
 */
function TabernicleAdminPage() {
  const { slug } = useI18n();
  const { user, isAdmin, loading } = useIsAdmin();

  let body;
  if (loading) body = <p className="text-muted-foreground">Cargando…</p>;
  else if (!user)
    body = (
      <p className="text-muted-foreground">
        Necesitas iniciar sesión.{" "}
        <Link to="/$lang/auth" params={{ lang: slug }} className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    );
  else if (!isAdmin) body = <p className="text-muted-foreground">No tienes permisos de administrador.</p>;
  else body = <LevelEditor lang={slug} />;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl text-primary">
            Tabernicle Cubicle — Editor de niveles
          </h1>
          <Link
            to="/$lang/admin"
            params={{ lang: slug }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Administración
          </Link>
        </div>
        {body}
      </main>
    </div>
  );
}
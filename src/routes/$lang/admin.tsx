import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pageMeta } from "@/platform/seo";
import { useI18n } from "@/platform/i18n";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useIsAdmin } from "@/platform/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$lang/admin")({
  head: () => ({
    meta: pageMeta({
      title: "Administración | The Taber Games",
      ogTitle: "The Taber Games — Administración",
      description: "Panel global de administración de The Taber Games: usuarios y permisos.",
    }),
  }),
  component: AdminPage,
});

const ROLES = ["admin", "moderator", "user"] as const;
type Role = (typeof ROLES)[number];

const TX = {
  es: {
    title: "Administración",
    users: "Usuarios",
    sections: "Secciones",
    murdoku: "Casos de Murdoku",
    search: "Buscar por correo…",
    email: "Correo",
    joined: "Alta",
    last: "Último acceso",
    roles: "Roles",
    loading: "Cargando…",
    noAccess: "No tienes permisos de administrador.",
    signIn: "Inicia sesión",
    needsAuth: "Necesitas iniciar sesión.",
    never: "Nunca",
    you: "tú",
    role: { admin: "Admin", moderator: "Moderador", user: "Usuario" },
  },
  eus: {
    title: "Administrazioa",
    users: "Erabiltzaileak",
    sections: "Atalak",
    murdoku: "Murdoku kasuak",
    search: "Bilatu posta bidez…",
    email: "Posta",
    joined: "Alta",
    last: "Azken sarrera",
    roles: "Rolak",
    loading: "Kargatzen…",
    noAccess: "Ez duzu administratzaile baimenik.",
    signIn: "Hasi saioa",
    needsAuth: "Saioa hasi behar duzu.",
    never: "Inoiz ez",
    you: "zu",
    role: { admin: "Admin", moderator: "Moderatzailea", user: "Erabiltzailea" },
  },
  en: {
    title: "Administration",
    users: "Users",
    sections: "Sections",
    murdoku: "Murdoku cases",
    search: "Search by email…",
    email: "Email",
    joined: "Joined",
    last: "Last sign-in",
    roles: "Roles",
    loading: "Loading…",
    noAccess: "You don't have admin permissions.",
    signIn: "Sign in",
    needsAuth: "You need to sign in.",
    never: "Never",
    you: "you",
    role: { admin: "Admin", moderator: "Moderator", user: "User" },
  },
};

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
};

function AdminPage() {
  const { slug } = useI18n();
  const tx = TX[slug as keyof typeof TX] ?? TX.es;
  const { user, isAdmin, loading } = useIsAdmin();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  const setRole = useMutation({
    mutationFn: async (v: { userId: string; role: Role; enabled: boolean }) => {
      const { error } = await supabase.rpc("admin_set_role", {
        _user_id: v.userId,
        _role: v.role,
        _enabled: v.enabled,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : tx.never);
  const list = (users.data ?? []).filter((u) =>
    (u.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  let body;
  if (loading) body = <p className="text-muted-foreground">{tx.loading}</p>;
  else if (!user)
    body = (
      <p className="text-muted-foreground">
        {tx.needsAuth}{" "}
        <Link to="/$lang/auth" params={{ lang: slug }} className="text-primary hover:underline">
          {tx.signIn}
        </Link>
      </p>
    );
  else if (!isAdmin) body = <p className="text-muted-foreground">{tx.noAccess}</p>;
  else
    body = (
      <>
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {tx.sections}
          </h2>
          <Link
            to="/$lang/taberdoku/murdoku/admin"
            params={{ lang: slug }}
            className="inline-block rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary"
          >
            {tx.murdoku} →
          </Link>
        </section>
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {tx.users} {users.data ? `(${users.data.length})` : ""}
            </h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx.search}
              className="w-64 max-w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </div>
          {users.isPending && <p className="text-muted-foreground">{tx.loading}</p>}
          {(users.error || setRole.error) && (
            <p className="mb-3 text-sm text-destructive">
              {String((users.error || setRole.error)?.message)}
            </p>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{tx.email}</th>
                  <th className="px-3 py-2">{tx.joined}</th>
                  <th className="px-3 py-2">{tx.last}</th>
                  <th className="px-3 py-2">{tx.roles}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      {u.email}{" "}
                      {u.id === user.id && (
                        <span className="text-xs text-muted-foreground">({tx.you})</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{fmt(u.created_at)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{fmt(u.last_sign_in_at)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map((r) => {
                          const on = u.roles.includes(r);
                          const locked = r === "admin" && u.id === user.id;
                          return (
                            <button
                              key={r}
                              disabled={locked || setRole.isPending}
                              onClick={() =>
                                setRole.mutate({ userId: u.id, role: r, enabled: !on })
                              }
                              className={`rounded-full border px-3 py-0.5 text-xs transition-colors disabled:opacity-60 ${
                                on
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground hover:border-primary"
                              }`}
                            >
                              {tx.role[r]}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 font-display text-2xl text-primary">{tx.title}</h1>
        {body}
      </main>
    </div>
  );
}

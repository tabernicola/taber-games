import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/$lang/auth")({
  head: () => ({
    meta: pageMeta({
      title: "Sign in — The Taber Games",
      description:
        "Sign in to The Taber Games to save your Taber's Eternity progress and continue later.",
    }),
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, slug } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/$lang/eternity-ii", params: { lang: slug } });
  }, [user, navigate, slug]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setError(error.message);
      else if (!data.session) setMessage(t("auth.checkEmail"));
    }
    setBusy(false);
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setError(String(result.error));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 pb-24 pt-12">
        <h1
          className="text-center text-2xl tracking-widest text-neon-pink text-glow-pink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("auth.title")}
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">{t("auth.desc")}</p>

        <button
          onClick={google}
          className="mt-8 w-full rounded-lg border border-neon-cyan bg-neon-cyan/10 px-4 py-2.5 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
        >
          {t("auth.google")}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t("auth.or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.password")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg border border-neon-pink bg-neon-pink/15 px-4 py-2.5 text-sm font-semibold text-neon-pink transition-colors hover:bg-neon-pink/25 disabled:opacity-50"
          >
            {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-neon-cyan">{message}</p>}

        <button
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
          className="mt-6 w-full text-center text-xs text-muted-foreground hover:text-neon-pink"
        >
          {mode === "in" ? t("auth.toggleSignUp") : t("auth.toggleSignIn")}
        </button>
      </main>
    </div>
  );
}

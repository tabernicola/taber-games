import { Link } from "@tanstack/react-router";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { t, slug } = useI18n();
  const { user } = useAuth();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out failed:", error);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/$lang" params={{ lang: slug }} className="flex items-center gap-2">
          <img src="/logo-large.png" alt="The Taber Games" className="h-36 w-36 object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => void signOut()}
              className="text-xs text-muted-foreground transition-colors hover:text-neon-pink"
            >
              {t("auth.signOut")}
            </button>
          ) : (
            <Link
              to="/$lang/auth"
              params={{ lang: slug }}
              className="text-xs text-muted-foreground transition-colors hover:text-neon-pink"
            >
              {t("auth.signIn")}
            </Link>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

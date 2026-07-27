import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoAsset.url}
            alt="The Taber Games"
            className="h-9 w-9 object-contain"
          />
          <span
            className="hidden text-sm tracking-widest text-neon-pink text-glow-pink sm:inline"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TABER GAMES
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-foreground" }}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/the-taber-square"
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {t("nav.play")}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

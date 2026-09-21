import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { getStorageItem, setStorageItem } from "@/platform/storage";

import "@/games/tabers-taberdoku/light-theme.css";

const LEVEL_STORAGE_KEY = "taberdoku-level";

export function LandingPage() {
  const { t, slug } = useI18n();
  const savedLevel = getStorageItem(LEVEL_STORAGE_KEY);
  const currentLevel = savedLevel ? Number(savedLevel) : 1;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="tabers-taberdoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
          <header className="text-center">
            <img
              src="/taberdoku/logo.png"
              alt="Taberdoku"
              className="mx-auto mb-4 h-28 w-28 object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
            />
            <h1
              className="text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("taberdoku.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              {t("home.card.taberdoku.desc")}
            </p>
          </header>

          <ModeSelect slug={slug} currentLevel={currentLevel} />

          <GameFooter basedOn="Taberdoku — one character per row, column, room, and no touching cells." />
        </main>
      </div>
    </div>
  );
}

function ModeSelect({
  slug,
  currentLevel,
}: {
  slug: "eus" | "es" | "en";
  currentLevel: number;
}) {
  const { t } = useI18n();

  const handleStart = () => {
    setStorageItem(LEVEL_STORAGE_KEY, String(currentLevel));
  };

  return (
    <section className="mt-10 grid gap-4">
      <div className="rounded-xl center border border-border bg-card p-4">
        <h3 className="text-lg font-semibold text-foreground">{t("taberdoku.title")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("taberdoku.levelProgress", { current: currentLevel, total: 16 })}
        </p>
        <div className="mt-3">
          <Link
            to="/$lang/tabers-taberdoku/play"
            params={{ lang: slug }}
            className="rounded-lg border border-primary bg-primary/10 px-6 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
            onClick={handleStart}
          >
            {t("taberdoku.play")}
          </Link>
        </div>
      </div>
    </section>
  );
}
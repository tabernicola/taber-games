import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";

import "@/games/taberdoku/light-theme.css";

export function Home() {
  const { t, slug } = useI18n();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="taberdoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="text-center">
          <img
            src="/taberdoku/logo.png"
            alt={t("taberdoku.title")}
            className="mx-auto object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
          />
          <h1
            className="mt-4 text-3xl font-bold tracking-widest text-primary sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("taberdoku.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            {t("taberdoku.umbrellaDesc")}
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SubGameCard
            title={t("taberdoku.murdoku.title")}
            description={t("taberdoku.murdoku.desc")}
            href="/$lang/taberdoku/murdoku"
            slug={slug}
            emoji="🕵️"
          />
          <SubGameCard
            title={t("taberdoku.starBattle.title")}
            description={t("taberdoku.starBattle.desc")}
            href="/$lang/taberdoku/star-battle"
            slug={slug}
            emoji="⭐"
          />
          <SubGameCard
            title={t("taberdoku.sudoku.title")}
            description={t("taberdoku.sudoku.desc")}
            href="/$lang/taberdoku/tabers-sudoku"
            slug={slug}
            emoji="🔢"
          />
        </section>

        <GameFooter basedOn="Taberdoku — three Sudoku-style deduction games in one." />
      </main>
      </div>
    </div>
  );
}

function SubGameCard({
  title,
  description,
  href,
  slug,
  emoji,
}: {
  title: string;
  description: string;
  href: string;
  slug: string;
  emoji: string;
}) {
  const { t } = useI18n();
  return (
    <Link
      to={href}
      params={{ lang: slug }}
      className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary"
    >
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <span className="mt-3 text-xs font-semibold text-primary">{t("taberdoku.play")}</span>
    </Link>
  );
}

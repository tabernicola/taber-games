import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";

import "@/games/tabers-sudoku/light-theme.css";

export function LandingPage() {
  const { t, slug } = useI18n();
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="tabers-sudoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
          <header className="text-center">
            <h1
              className="text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("sudoku.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              {t("home.card.sudoku.desc")}
            </p>
          </header>

          <ModeSelect slug={slug} />

          <GameFooter basedOn="Classic 9x9 sudoku using the nine characters instead of numbers." />
        </main>
      </div>
    </div>
  );
}

function ModeSelect({ slug }: { slug: "eus" | "es" | "en" }) {
  const { t } = useI18n();
  const levels = ["easy", "medium", "hard", "expert"] as const;

  return (
    <section className="mt-10 grid gap-4">
      <div className="rounded-xl center border border-border bg-card p-4">
        <h3 className="text-lg font-semibold text-foreground">{t("sudoku.title")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("sudoku.desc")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {levels.map((level) => (
            <Link
              key={level}
              to="/$lang/tabers-sudoku/play"
              params={{ lang: slug }}
              className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              {t(`sudoku.level.${level}`)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

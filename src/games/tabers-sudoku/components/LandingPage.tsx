import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { SubGameTabs } from "@/games/taberdoku/components/SubGameTabs";
import { getStorageItem } from "@/platform/storage";
import { Ranking } from "@/platform/scores/Ranking";
import { createScoresService } from "@/platform/scores/createScoresService";
import type { SudokuLevel } from "../logic/sudoku";

import "@/games/tabers-sudoku/light-theme.css";

const scores = createScoresService("scores_tabers_sudoku");
const RANKING_LEVELS: SudokuLevel[] = ["easy", "medium", "hard", "expert"];

type SavedSudokuState = {
  level: SudokuLevel;
  puzzle: (number | null)[];
  solution: number[];
  fixed: number[];
  grid: (number | null)[];
  seconds: number;
  timestamp: number;
  showHints: boolean;
};

function getSaveKey(userId: string | null): string {
  return userId ? `tabers-sudoku-save-${userId}` : "tabers-sudoku-save-anonymous";
}

function loadSudokuState(userId: string | null): SavedSudokuState | null {
  const key = getSaveKey(userId);
  const saved = getStorageItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function LandingPage() {
  const { t, slug } = useI18n();
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const savedGame = loadSudokuState(userId);
  const [activeLevel, setActiveLevel] = useState<SudokuLevel>("easy");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="tabers-sudoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
          <SubGameTabs active="tabers-sudoku" />
          <div className="relative">

          <header className="mt-8 text-center">
            <h1
              className="text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("sudoku.title")}
            </h1>
          </header>

            <div className="relative z-10 bg-background/80">
              <div
              className="pointer-events-none absolute top-0 left-0 right-0 bottom-0 opacity-10"
              style={{
                backgroundImage: "url(/taberdoku/sudoku-numbers.png)",
                backgroundSize: "contain",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "scroll",
              }}
              aria-hidden="true"
            />
              <ModeSelect slug={slug} savedGame={savedGame} userId={userId} />

              <section className="mt-12">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-lg font-semibold text-primary">{t("landing.ranking")}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RANKING_LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setActiveLevel(lvl)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          activeLevel === lvl
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {t(`sudoku.level.${lvl}`)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Ranking
                      service={scores}
                      level={activeLevel}
                      title={`${t("landing.level")} · ${t(`sudoku.level.${activeLevel}`)}`}
                    />
                  </div>
                </div>
              </section>

              <GameFooter basedOn={t('taberdoku.sudoku.desc')} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ModeSelect({
  slug,
  savedGame,
  userId,
}: {
  slug: "eus" | "es" | "en";
  savedGame: SavedSudokuState | null;
  userId: string | null;
}) {
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
              to="/$lang/taberdoku/tabers-sudoku/play"
              params={{ lang: slug }}
              search={{ level, newGame: "1" }}
              className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              {t(`sudoku.level.${level}`)}
            </Link>
          ))}
        </div>
        {savedGame && (
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-foreground">{t("sudoku.continue")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("sudoku.level." + savedGame.level)} · {Math.floor(savedGame.seconds / 60)}:
              {(savedGame.seconds % 60).toString().padStart(2, "0")}
            </p>
            <Link
              to="/$lang/taberdoku/tabers-sudoku/play"
              params={{ lang: slug }}
              search={{ level: savedGame.level }}
              className="mt-3 inline-block rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              {t("sudoku.continue")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

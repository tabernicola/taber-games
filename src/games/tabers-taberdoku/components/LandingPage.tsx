import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { Ranking } from "@/platform/scores/Ranking";
import { createScoresService, type Score } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import type { TranslateFn } from "@/platform/games/types";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { boardToLevel, TABERDOKU_TOTAL_LEVELS } from "../logic/taberdokuPuzzles";
import { LEVEL_STORAGE_KEY, readCompletedBoards, resumeBoard } from "../logic/savedGame";

import "@/games/tabers-taberdoku/light-theme.css";

const SCORE_STORAGE_KEY = "taberdoku-score";
const scores = createScoresService("scores_taberdoku");

export const formatLevelLabel = (level: number, _t: TranslateFn) => `Nivel ${level}`;

export const formatScoreNote = (score: Score, t: TranslateFn) =>
  score.level_progress === null || score.level_progress === undefined
    ? ""
    : t("taberdoku.levelProgressOf", { level: score.level, progress: score.level_progress });

export function LandingPage() {
  const { t, slug } = useI18n();
  const savedLevel = getStorageItem(LEVEL_STORAGE_KEY);
  const hasSavedGame = savedLevel !== null;
  // Resuming enters the highest unlocked level at its first unsolved board.
  const continueBoard = resumeBoard(readCompletedBoards());
  const currentLevel = boardToLevel(continueBoard);
  const totalScore = Number(getStorageItem(SCORE_STORAGE_KEY) || "0");

  const handleContinue = () => {
    setStorageItem(LEVEL_STORAGE_KEY, String(continueBoard));
  };

  const handleRestart = () => {
    setStorageItem(LEVEL_STORAGE_KEY, "1");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="tabers-taberdoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
          <header className="flex flex-col items-center text-center">
            <img
              src="/taberdoku/logo.png"
              alt={t("taberdoku.title")}
              className="object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
            />
            <h1 className="mt-4 text-3xl tracking-widest text-foreground sm:text-4xl">
              {t("taberdoku.title")}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              {t("taberdoku.levelProgress", {
                current: currentLevel,
                total: TABERDOKU_TOTAL_LEVELS,
              })}
            </p>
            {totalScore > 0 && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {t("taberdoku.totalScore")}: {totalScore} ⭐
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              {hasSavedGame ? (
                <>
                  <Link
                    to="/$lang/tabers-taberdoku/play"
                    params={{ lang: slug }}
                    className="rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
                    onClick={handleContinue}
                  >
                    {t("taberdoku.continue")}
                  </Link>
                  <Link
                    to="/$lang/tabers-taberdoku/play"
                    params={{ lang: slug }}
                    className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                    onClick={handleRestart}
                  >
                    {t("taberdoku.startFromBeginning")}
                  </Link>
                </>
              ) : (
                <Link
                  to="/$lang/tabers-taberdoku/play"
                  params={{ lang: slug }}
                  className="rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
                  onClick={handleContinue}
                >
                  {t("taberdoku.play")}
                </Link>
              )}
            </div>
          </header>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm tracking-widest text-foreground">{t("landing.howto")}</h2>
              <ul className="list-none space-y-2 pl-5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary" aria-hidden>
                    •
                  </span>
                  <span>{t("taberdoku.rule1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary" aria-hidden>
                    •
                  </span>
                  <span>{t("taberdoku.rule2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary" aria-hidden>
                    •
                  </span>
                  <span>{t("taberdoku.rule3")}</span>
                </li>
              </ul>
            </section>

            <Ranking
              service={scores}
              title={t("landing.ranking")}
              formatLevelLabel={formatLevelLabel}
              formatScoreNote={formatScoreNote}
            />
          </div>

          <GameFooter basedOn="Taberdoku — one character per row, column, room, and no touching cells." />
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { Ranking } from "@/platform/scores/Ranking";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import type { TranslateFn } from "@/platform/games/types";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { boardToLevel, TABERDOKU_TOTAL_LEVELS } from "../logic/taberdokuPuzzles";

import "@/games/tabers-taberdoku/light-theme.css";

const LEVEL_STORAGE_KEY = "taberdoku-level";
const SCORE_STORAGE_KEY = "taberdoku-score";
const SESSION_ID_KEY = "taberdoku-session-id";
const SESSION_HISTORY_KEY = "taberdoku-session-history";
const scores = createScoresService("scores_taberdoku");

type SessionHistoryEntry = {
  sessionId: string;
  board: number;
  level: number;
  time: string;
  score: number;
  timestamp: number;
};

export const formatLevelLabel = (level: number, _t: TranslateFn) => `Nivel ${level}`;

export function LandingPage() {
  const { t, slug } = useI18n();
  const savedLevel = getStorageItem(LEVEL_STORAGE_KEY);
  const currentLevel = savedLevel ? boardToLevel(Number(savedLevel)) : 1;
  const hasSavedGame = savedLevel !== null;
  const totalScore = Number(getStorageItem(SCORE_STORAGE_KEY) || "0");
  const sessionId = getStorageItem(SESSION_ID_KEY);
  const sessionHistoryRaw = getStorageItem(SESSION_HISTORY_KEY);
  const sessionHistory: SessionHistoryEntry[] = sessionHistoryRaw
    ? JSON.parse(sessionHistoryRaw).filter(
        (entry: SessionHistoryEntry) => entry.sessionId === sessionId,
      )
    : [];
  const [showHistory, setShowHistory] = useState(false);

  const handleNewSession = () => {
    const newSessionId = Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    setStorageItem(SESSION_ID_KEY, newSessionId);
    setStorageItem(SCORE_STORAGE_KEY, "0");
    setStorageItem(SESSION_HISTORY_KEY, "[]");
    window.location.reload();
  };

  const handleContinue = () => {
    setStorageItem(LEVEL_STORAGE_KEY, String(currentLevel));
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
              <>
                <p className="mt-2 text-sm font-semibold text-primary">
                  {t("taberdoku.totalScore")}: {totalScore} ⭐
                </p>
                {sessionHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="mt-2 text-xs text-primary underline hover:text-primary/80"
                  >
                    {t("taberdoku.showHistory")}
                  </button>
                )}
              </>
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
            />
          </div>

          <GameFooter basedOn="Taberdoku — one character per row, column, room, and no touching cells." />
        </main>
      </div>

      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">{t("taberdoku.sessionHistory")}</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("taberdoku.sessionId")}: {sessionId}
            </p>
            {sessionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("taberdoku.noHistory")}</p>
            ) : (
              <div className="space-y-2">
                {sessionHistory.map((entry, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">
                        {t("taberdoku.board")} {entry.board} ({t("taberdoku.level")} {entry.level})
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-muted-foreground">
                        {t("taberdoku.time")}: {entry.time}
                      </span>
                      {entry.score > 0 && (
                        <span className="text-primary font-semibold">+{entry.score} ⭐</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleNewSession}
              className="mt-4 w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-primary"
            >
              {t("taberdoku.startNewSession")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

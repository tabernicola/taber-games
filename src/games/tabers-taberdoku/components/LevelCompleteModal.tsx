import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Lock, Sparkles, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import "@/games/tabers-taberdoku/light-theme.css";

interface LevelCompleteModalProps {
  open: boolean;
  level: number;
  board: number;
  progress: number;
  totalLevels: number;
  boardsPerLevel: number;
  time: string;
  isLastBoardOfLevel: boolean;
  isLastLevel: boolean;
  newlyUnlockedLevel: number | null;
  onAdvance: () => void;
  scoreEarned?: number;
  totalScore?: number;
}

export function LevelCompleteModal({
  open,
  level,
  board,
  progress,
  totalLevels,
  boardsPerLevel,
  time,
  isLastBoardOfLevel,
  isLastLevel,
  newlyUnlockedLevel,
  onAdvance,
  scoreEarned,
  totalScore,
}: LevelCompleteModalProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  // Guards against the close button and the auto-advance timer both firing,
  // which would advance to the next board twice.
  const advancingRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      advancingRef.current = false;
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  const handleAdvance = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setClosing(true);
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      setVisible(false);
      onAdvance();
    }, 200);
  };

  // Auto-advance after 3 seconds
  useEffect(() => {
    if (!open || isLastLevel) return;
    const timer = setTimeout(() => {
      handleAdvance();
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLastLevel]);

  if (!visible) return null;

  const showUnlock = newlyUnlockedLevel !== null;

  const title = isLastLevel
    ? t("taberdoku.allCleared")
    : isLastBoardOfLevel
      ? t("taberdoku.levelCleared", { level })
      : t("taberdoku.boardCleared", { board, boardsPerLevel, level });

  const progressLabel = isLastLevel
    ? t("taberdoku.levelProgressOf", { level, progress })
    : isLastBoardOfLevel
      ? t("taberdoku.levelComplete", { level, nextLevel: level + 1 })
      : t("taberdoku.levelProgressOf", { level, progress });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
    >
      <div
        className={`w-full max-w-sm rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl transition-all duration-200 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
      >
        <button
          type="button"
          onClick={handleAdvance}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("common.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {showUnlock ? (
              <Sparkles className="h-7 w-7 text-yellow-400" />
            ) : (
              <Check className="h-7 w-7" />
            )}
          </div>

          <h2 className="text-lg font-bold" style={{ color: "var(--primary)" }}>
            {title}
          </h2>

          {showUnlock && (
            <div className="mt-3 w-full rounded-lg border border-yellow-400/50 bg-yellow-400/10 px-3 py-2">
              <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-yellow-500">
                <Sparkles className="h-4 w-4" />
                {t("taberdoku.levelUnlocked", { level: newlyUnlockedLevel })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("taberdoku.levelUnlockedDesc", { level: newlyUnlockedLevel })}
              </p>
            </div>
          )}

          <p className="mt-1 text-sm text-muted-foreground">{t("taberdoku.solvedIn", { time })}</p>

          {scoreEarned !== undefined && scoreEarned > 0 && (
            <p className="mt-2 text-sm font-semibold text-primary">
              +{scoreEarned} {t("taberdoku.points")} ⭐
            </p>
          )}

          {totalScore !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("taberdoku.totalScore")}: {totalScore}
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground">{progressLabel}</p>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {isLastLevel ? (
            <button
              type="button"
              onClick={handleAdvance}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {t("taberdoku.back")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAdvance}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {showUnlock ? t("taberdoku.continue") : t("taberdoku.nextLevel")}
              {!showUnlock && <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

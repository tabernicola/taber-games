import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ChevronRight, Lock, Sparkles, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import type { Character } from "@/platform/characters/characters";
import "@/games/star-battle/star-battle-theme.css";

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
  /** Character that represents the level that was just cleared. */
  levelCharacter?: Character;
  /** Player name shown in the congratulation line. */
  playerName?: string | null;
  /** True while the name is still the random one, so the player may replace it. */
  canRename?: boolean;
  onRename?: (name: string) => void | Promise<void>;
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
  levelCharacter,
  playerName,
  canRename,
  onRename,
}: LevelCompleteModalProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  // Guards against the close button and the auto-advance timer both firing,
  // which would advance to the next board twice.
  const advancingRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (open) {
      advancingRef.current = false;
      setVisible(true);
      setClosing(false);
      setDraftName(playerName ?? "");
    }
  }, [open, playerName]);

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

  // The modal waits for the player: only the close and advance buttons dismiss it.
  if (!visible) return null;

  // Renaming is offered once, while the name is still the random one.
  const trimmedName = draftName.trim();
  const canSubmitName = canRename && onRename !== undefined && trimmedName.length > 0;

  const handleRenameSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitName || !onRename) return;
    onRename(trimmedName);
  };

  const showUnlock = newlyUnlockedLevel !== null;

  const title = isLastLevel
    ? t("starBattle.allCleared")
    : isLastBoardOfLevel
      ? t("starBattle.levelCleared", { level })
      : t("starBattle.boardCleared", { board, boardsPerLevel, level });

  const progressLabel = isLastLevel
    ? t("starBattle.levelProgressOf", { level, progress })
    : isLastBoardOfLevel
      ? t("starBattle.levelComplete", { level, nextLevel: level + 1 })
      : t("starBattle.levelProgressOf", { level, progress });

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

          {playerName && (
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--primary)" }}>
              {t("starBattle.wellDone", { name: playerName })}
            </p>
          )}

          {canRename && onRename && (
            <form onSubmit={handleRenameSubmit} className="mt-3 flex w-full items-center gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={24}
                autoComplete="off"
                placeholder={t("starBattle.namePlaceholder")}
                aria-label={t("starBattle.changeName")}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!canSubmitName}
                className="shrink-0 rounded-lg border border-primary/50 px-3 py-2 text-xs font-semibold text-primary transition-opacity disabled:opacity-40"
              >
                {t("starBattle.saveName")}
              </button>
            </form>
          )}

          {levelCharacter?.image && (
            <img
              src={levelCharacter.image}
              alt={levelCharacter.name}
              className="mt-3 max-h-40 w-auto max-w-full object-contain"
            />
          )}

          {showUnlock && (
            <div className="mt-3 w-full rounded-lg border border-yellow-400/50 bg-yellow-400/10 px-3 py-2">
              <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-yellow-500">
                <Sparkles className="h-4 w-4" />
                {t("starBattle.levelUnlocked", { level: newlyUnlockedLevel })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("starBattle.levelUnlockedDesc", { level: newlyUnlockedLevel })}
              </p>
            </div>
          )}

          <p className="mt-1 text-sm text-muted-foreground">{t("starBattle.solvedIn", { time })}</p>

          {scoreEarned !== undefined && scoreEarned > 0 && (
            <p className="mt-2 text-sm font-semibold text-primary">
              +{scoreEarned} {t("starBattle.points")} ⭐
            </p>
          )}

          {totalScore !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("starBattle.totalScore")}: {totalScore}
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
              {t("starBattle.back")}
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
              {showUnlock ? t("starBattle.continue") : t("starBattle.nextLevel")}
              {!showUnlock && <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

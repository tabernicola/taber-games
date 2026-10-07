import { useEffect, useState, type FormEvent } from "react";
import { Check, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import "@/games/tabers-sudoku/light-theme.css";

interface SudokuSolvedModalProps {
  open: boolean;
  time: string;
  /** Player name shown in the congratulation line. */
  playerName?: string | null;
  /** Whether the player improved their time for this level. */
  timeImproved?: boolean;
  onRename?: (name: string) => void | Promise<void>;
  onNewGame: () => void;
}

export function SudokuSolvedModal({
  open,
  time,
  playerName,
  timeImproved = true,
  onRename,
  onNewGame,
}: SudokuSolvedModalProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
      setDraftName(playerName ?? "");
    }
  }, [open, playerName]);
  // The modal waits for the player: only the close and new-game buttons dismiss it.
  if (!visible) return null;

  const trimmedName = draftName.trim();
  const canSubmitName = onRename !== undefined && trimmedName.length > 0;

  const handleRenameSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmitName || !onRename) return;
    onRename(trimmedName);
  };

  const handleNewGame = () => {
    setClosing(true);
    window.setTimeout(() => {
      setVisible(false);
      onNewGame();
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
    >
      <div
        className={`w-full max-w-sm rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl transition-all duration-200 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={handleNewGame}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("game.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-7 w-7" />
          </div>

          <h2 className="text-lg font-bold text-primary">{t("sudoku.solvedTitle")}</h2>

          {playerName && (
            <p className="mt-1 text-sm font-semibold text-primary">
              {t("sudoku.wellDone", { name: playerName })}
            </p>
          )}

          {timeImproved ? (
            <p className="mt-1 text-sm font-semibold text-green-600">{t("sudoku.timeImproved")}</p>
          ) : (
            <p className="mt-1 text-sm font-semibold text-amber-600">
              {t("sudoku.timeNotImproved")}
            </p>
          )}

          {onRename && timeImproved && (
            <form onSubmit={handleRenameSubmit} className="mt-3 flex w-full items-center gap-2">
              <input
                type="text"
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                maxLength={24}
                autoComplete="off"
                placeholder={t("sudoku.namePlaceholder")}
                aria-label={t("sudoku.changeName")}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!canSubmitName}
                className="shrink-0 rounded-lg border border-primary/50 px-3 py-2 text-xs font-semibold text-primary transition-opacity disabled:opacity-40"
              >
                {t("sudoku.saveName")}
              </button>
            </form>
          )}

          <p className="mt-2 text-sm text-muted-foreground">{t("sudoku.solvedIn", { time })}</p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleNewGame}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors"
          >
            {t("game.new")}
          </button>
        </div>
      </div>
    </div>
  );
}

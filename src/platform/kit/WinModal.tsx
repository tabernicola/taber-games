import { ScoreForm } from "@/platform/scores/ScoreForm";
import type { ScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";

/** Victory overlay shared by piece-placement games. */
export function WinModal({
  helped,
  seconds,
  scores,
  level,
  onNextLevel,
  onPlayAgain,
  onClose,
}: {
  helped: boolean;
  seconds: number;
  scores: ScoresService;
  level?: number;
  onNextLevel?: () => void;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-neon-pink bg-card p-8 text-center neon-glow-pink">
        <h2
          className="text-3xl tracking-widest text-neon-pink text-glow-pink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("game.solved")}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{t("game.solvedDesc")}</p>

        {!helped ? (
          <ScoreForm service={scores} level={level} seconds={seconds} />
        ) : (
          <p className="mt-4 text-sm text-neon-yellow">{t("game.solutionShown")}</p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          {onNextLevel && (
            <button
              onClick={onNextLevel}
              className="rounded-lg border border-neon-cyan bg-neon-cyan/20 px-4 py-2 text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/30"
            >
              {t("game.nextLevel")}
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className="rounded-lg border border-neon-pink bg-neon-pink/20 px-4 py-2 text-sm font-semibold text-neon-pink transition-all hover:bg-neon-pink/30"
          >
            {t("game.playAgain")}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-neon-pink"
          >
            {t("game.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

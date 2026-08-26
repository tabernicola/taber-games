import { useI18n } from "@/platform/i18n";
import { SQUARE_LEVELS, levelIndex, type SquareLevelId } from "../logic/levels";
import { isLevelUnlocked } from "../logic/progress";

export function LevelSelector({
  activeLevelId,
  onSelect,
  onShowTutorial,
}: {
  activeLevelId: SquareLevelId;
  onSelect: (levelId: SquareLevelId) => void;
  onShowTutorial: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="my-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t("game.levelChoose")}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("game.level")}:{" "}
          <span className="font-bold text-neon-pink">{levelIndex(activeLevelId) + 1}/5</span>
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SQUARE_LEVELS.map((lvl) => {
          const unlocked = isLevelUnlocked(lvl.id);
          const active = lvl.id === activeLevelId;
          return (
            <button
              key={lvl.id}
              disabled={!unlocked}
              onClick={() => onSelect(lvl.id)}
              className={`relative flex flex-col items-center justify-center rounded-lg border py-2.5 px-1 transition-all ${
                active
                  ? "border-neon-pink bg-neon-pink/15 text-neon-pink neon-glow-pink font-bold"
                  : unlocked
                    ? "border-border bg-background/40 text-foreground hover:border-neon-pink/50 hover:bg-background/60"
                    : "border-border/30 bg-background/10 text-muted-foreground/40 cursor-not-allowed"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t(`game.level.${lvl.id}`)}
              </span>
              <span
                className="mt-1 text-lg font-extrabold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {lvl.tier}
              </span>
              {!unlocked && (
                <span className="absolute -right-1 -top-1 rounded-full bg-destructive/90 p-0.5 text-white">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        data-level-info
        className="mt-4 rounded-lg border border-border/45 bg-background/40 p-3 text-sm text-muted-foreground"
      >
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neon-cyan">
          {t("game.levelInfo")}:
        </span>
        {t(`game.level.desc.${activeLevelId}`)}
      </div>

      <div className="mt-2 text-center">
        <button
          onClick={onShowTutorial}
          className="cursor-pointer text-xs text-muted-foreground transition-colors underline decoration-dotted hover:text-neon-pink"
        >
          {t("tutorial.showAgain")}
        </button>
      </div>
    </div>
  );
}

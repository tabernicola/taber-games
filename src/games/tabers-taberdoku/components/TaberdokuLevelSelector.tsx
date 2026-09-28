import { Check, Lock } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { TABERDOKU_TOTAL_LEVELS } from "../logic/taberdokuPuzzles";

interface TaberdokuLevelSelectorProps {
  open: boolean;
  currentLevel: number;
  maxLevel: number;
  onSelect: (level: number) => void;
  onClose: () => void;
}

export function TaberdokuLevelSelector({
  open,
  currentLevel,
  maxLevel,
  onSelect,
  onClose,
}: TaberdokuLevelSelectorProps) {
  const { t } = useI18n();

  if (!open) return null;

  const levels = Array.from({ length: TABERDOKU_TOTAL_LEVELS }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("taberdoku.close")}
        >
          <Check className="h-5 w-5" />
        </button>

        <h2 className="text-center text-lg font-bold" style={{ color: "var(--primary)" }}>
          {t("taberdoku.levels")}
        </h2>

        <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {[
            { size: "6 × 6", start: 1, end: 25 },
            { size: "7 × 7", start: 26, end: 50 },
            { size: "8 × 8", start: 51, end: 75 },
            { size: "9 × 9", start: 76, end: 100 },
          ].map((group) => (
            <div key={group.size} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="font-mono">{group.size}</span>
                <span className="text-[10px] opacity-75">
                  {group.start} – {group.end}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {levels.slice(group.start - 1, group.end).map((lvl) => {
                  const isCompleted = lvl < maxLevel;
                  const isAvailable = lvl <= maxLevel;
                  return (
                    <button
                      key={lvl}
                      disabled={!isAvailable}
                      onClick={() => onSelect(lvl)}
                      className={`relative flex flex-col items-center justify-center rounded-lg border py-2 px-1 text-xs font-bold transition-all ${
                        lvl === currentLevel
                          ? "border-primary bg-primary/20 text-primary"
                          : isCompleted
                            ? "border-border bg-background/40 text-foreground hover:border-primary/30 hover:bg-background/60"
                            : "border-border/30 bg-background/10 text-muted-foreground/40 cursor-not-allowed"
                      }`}
                    >
                      {lvl}
                      {isCompleted && <Check className="mt-0.5 h-3 w-3" />}
                      {!isAvailable && (
                        <Lock className="absolute -right-1 -top-1 h-3 w-3 text-destructive/60" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("taberdoku.levelsHint")}
        </p>
      </div>
    </div>
  );
}

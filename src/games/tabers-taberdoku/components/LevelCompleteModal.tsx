import { useEffect, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import "@/games/tabers-taberdoku/light-theme.css";

interface LevelCompleteModalProps {
  open: boolean;
  level: number;
  totalLevels: number;
  time: string;
  isLastLevel: boolean;
  onAdvance: () => void;
}

export function LevelCompleteModal({
  open,
  level,
  totalLevels,
  time,
  isLastLevel,
  onAdvance,
}: LevelCompleteModalProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  const handleAdvance = () => {
    setClosing(true);
    setTimeout(() => {
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
  }, [open, isLastLevel]);

  if (!visible) return null;

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
            <Check className="h-7 w-7" />
          </div>

          <h2
            className="text-lg font-bold"
            style={{ color: "var(--primary)" }}
          >
            {isLastLevel ? t("taberdoku.allCleared") : t("taberdoku.levelCleared", { level })}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("taberdoku.solvedIn", { time })}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {t("taberdoku.levelOf", { current: level, total: totalLevels })}
          </p>
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
              {t("taberdoku.nextLevel")}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
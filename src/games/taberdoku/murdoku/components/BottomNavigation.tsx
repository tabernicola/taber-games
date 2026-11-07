import { XCircle, Info } from "lucide-react";
import { useI18n } from "@/platform/i18n";

export type GameMode = "crosses" | null;

export function BottomNavigation({
  mode,
  onChangeMode,
  onInfo,
  lives,
  elapsedSeconds,
}: {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  onInfo: () => void;
  lives: number;
  elapsedSeconds: number;
}) {
  const { t } = useI18n();
  const handleModeClick = (target: "crosses") => {
    if (mode === target) {
      onChangeMode(null);
    } else {
      onChangeMode(target);
    }
  };
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      role="tablist"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 px-2 py-2">
        <div className="flex-1" />
        <ModeButton
          icon={<XCircle className="h-8 w-8" />}
          label={t("murdoku.crosses")}
          active={mode === "crosses"}
          onClick={() => handleModeClick("crosses")}
        />
        <div className="flex-1" />
        <div className="ml-auto flex items-center justify-between gap-2">
          <div className="flex flex-col items-center">
            <div className="flex gap-0.5 text-base">
              {[0, 1, 2].map((i) => (
                <span key={i}>{i < lives ? "❤️" : "💔"}</span>
              ))}
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
              {String(elapsedSeconds % 60).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ModeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
        active
          ? "border border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      } ${label ? "" : "py-2.5"}`}
    >
      {icon}
      {label ? label : null}
    </button>
  );
}

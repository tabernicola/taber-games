import { Edit, XCircle, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/platform/i18n";

export type GameMode = "notes" | "crosses" | null;

export function BottomNavigation({
  mode,
  onChangeMode,
  showElementNames,
  onToggleElementNames,
}: {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  showElementNames: boolean;
  onToggleElementNames: () => void;
}) {
  const { t } = useI18n();
  const handleModeClick = (target: "notes" | "crosses") => {
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
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-2">
        <ModeButton
          icon={<Edit className="h-5 w-5" />}
          label={t("murdoku.notes")}
          active={mode === "notes"}
          onClick={() => handleModeClick("notes")}
        />
        <ModeButton
          icon={<XCircle className="h-5 w-5" />}
          label={t("murdoku.crosses")}
          active={mode === "crosses"}
          onClick={() => handleModeClick("crosses")}
        />
        <button
          type="button"
          onClick={onToggleElementNames}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all ${
            showElementNames
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          aria-label={showElementNames ? "Ocultar nombres" : "Mostrar nombres"}
        >
          {showElementNames ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          {showElementNames ? "Ocultar" : "Nombres"}
        </button>
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
      className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-all ${
        active
          ? "border border-primary bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

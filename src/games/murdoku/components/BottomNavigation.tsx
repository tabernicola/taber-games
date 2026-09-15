import { MapIcon, Edit, XCircle, Eraser, Skull } from "lucide-react";
import { useI18n } from "@/platform/i18n";

export type GameMode = "place" | "notes" | "crosses" | "erase";

export function BottomNavigation({
  mode,
  onChangeMode,
  onAccuse,
  accusationOpen,
}: {
  mode: GameMode;
  onChangeMode: (mode: GameMode) => void;
  onAccuse: () => void;
  accusationOpen: boolean;
}) {
  const { t } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      role="tablist"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-2">
        <ModeButton
          icon={<MapIcon className="h-5 w-5" />}
          label={t("murdoku.place")}
          active={mode === "place"}
          onClick={() => onChangeMode("place")}
        />
        <ModeButton
          icon={<Edit className="h-5 w-5" />}
          label={t("murdoku.notes")}
          active={mode === "notes"}
          onClick={() => onChangeMode("notes")}
        />
        <ModeButton
          icon={<XCircle className="h-5 w-5" />}
          label={t("murdoku.crosses")}
          active={mode === "crosses"}
          onClick={() => onChangeMode("crosses")}
        />
        <ModeButton
          icon={<Eraser className="h-5 w-5" />}
          label={t("murdoku.erase")}
          active={mode === "erase"}
          onClick={() => onChangeMode("erase")}
        />
        <button
          type="button"
          onClick={onAccuse}
          disabled={accusationOpen}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-primary bg-primary/10 px-2 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
          aria-label={t("murdoku.accuse")}
        >
          <Skull className="h-5 w-5" />
          {t("murdoku.accuse")}
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

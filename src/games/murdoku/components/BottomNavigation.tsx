import { useI18n } from "@/platform/i18n";
import { MapIcon, List, Book } from "lucide-react";

export type MurdokuTab = "map" | "clues" | "notes";

export function BottomNavigation({
  activeTab,
  onChange,
}: {
  activeTab: MurdokuTab;
  onChange: (tab: MurdokuTab) => void;
}) {
  const { t } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      role="tablist"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-2">
        <Tab
          icon={<MapIcon className="h-5 w-5" />}
          label={t("murdoku.map")}
          active={activeTab === "map"}
          onClick={() => onChange("map")}
        />
        <Tab
          icon={<List className="h-5 w-5" />}
          label={t("murdoku.clues")}
          active={activeTab === "clues"}
          onClick={() => onChange("clues")}
        />
        <Tab
          icon={<Book className="h-5 w-5" />}
          label={t("murdoku.notes")}
          active={activeTab === "notes"}
          onClick={() => onChange("notes")}
        />
      </div>
    </nav>
  );
}

function Tab({
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
      className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${
        active ? "text-neon-pink neon-glow-pink" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

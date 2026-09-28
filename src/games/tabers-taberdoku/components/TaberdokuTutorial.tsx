import { X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { TaberdokuRules } from "./TaberdokuRules";
import type { MurdokuCharacter } from "../logic/characters";

interface TaberdokuTutorialProps {
  open: boolean;
  characters: MurdokuCharacter[];
  onClose: () => void;
}

export function TaberdokuTutorial({ open, characters, onClose }: TaberdokuTutorialProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border-2 border-primary/50 bg-card p-6 shadow-2xl"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("taberdoku.close")}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-bold" style={{ color: "var(--primary)" }}>
            {t("taberdoku.tutorial.title")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">{t("taberdoku.tutorial.desc")}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <TaberdokuRules characters={characters} />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("taberdoku.doubleClick")}
        </p>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {t("taberdoku.tutorial.gotIt")}
          </button>
        </div>
      </div>
    </div>
  );
}

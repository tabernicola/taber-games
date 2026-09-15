import type { ClueType } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";

export function ClueTypeBadge({ type }: { type: ClueType }) {
  const { t } = useI18n();
  const config: Record<ClueType, { color: string; labelKey: string }> = {
    fact: {
      color: "bg-secondary/15 text-secondary border-secondary/30",
      labelKey: "murdoku.clueType.fact",
    },
    elimination: {
      color: "bg-destructive/15 text-destructive border-destructive/30",
      labelKey: "murdoku.clueType.elimination",
    },
    clue: {
      color: "bg-primary/15 text-primary border-primary/30",
      labelKey: "murdoku.clueType.clue",
    },
  };

  const cfg = config[type];
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}
    >
      {t(cfg.labelKey)}
    </span>
  );
}

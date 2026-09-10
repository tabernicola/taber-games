import type { ClueType } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";

export function ClueTypeBadge({ type }: { type: ClueType }) {
  const { t } = useI18n();
  const config: Record<ClueType, { color: string; labelKey: string }> = {
    fact: {
      color: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
      labelKey: "murdoku.clueType.fact",
    },
    elimination: {
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      labelKey: "murdoku.clueType.elimination",
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

import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/platform/scores/formatTime";
import type { ScoresService } from "@/platform/scores/createScoresService";
import type { TranslateFn } from "@/platform/games/types";
import { useI18n } from "@/platform/i18n";

export function TaberStarRanking({
  service,
  level,
  title,
  formatLevelLabel,
  className = "",
}: {
  service: ScoresService;
  level?: number;
  title?: string;
  formatLevelLabel?: (level: number, t: TranslateFn) => string;
  className?: string;
}) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["scores", service.table, level],
    queryFn: () => service.fetchTop(level),
  });

  return (
    <div className={`ts-card p-4 ${className}`}>
      <h3 className="ts-heading mb-3 text-sm tracking-widest">{title ?? t("rank.title")}</h3>
      {isLoading && <p className="text-xs text-[var(--ts-ink-soft)]">{t("common.loading")}</p>}
      {isError && <p className="text-xs text-[var(--ts-terracotta)]">{t("rank.error")}</p>}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <p className="text-xs text-[var(--ts-ink-soft)]">{t("rank.empty")}</p>
      )}
      {!!data?.length && (
        <ol className="space-y-1.5">
          {data.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-right text-xs text-[var(--ts-terracotta-d)]">{i + 1}.</span>
              <span className="flex-1 truncate text-[var(--ts-ink)]">{s.player_name}</span>
              {formatLevelLabel && (
                <span className="text-xs text-[var(--ts-olive-deep)] font-medium">
                  {formatLevelLabel(s.level, t)}
                </span>
              )}
              <span className="tabular-nums text-[var(--ts-ink-soft)]">
                {formatTime(s.seconds)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

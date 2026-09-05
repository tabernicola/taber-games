import { useQuery } from "@tanstack/react-query";
import { formatTime } from "./formatTime";
import type { ScoresService } from "./createScoresService";
import type { TranslateFn } from "@/platform/games/types";
import { useI18n } from "@/platform/i18n";

export function Ranking({
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
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <h3
        data-rank-title
        className="mb-3 text-sm tracking-widest text-neon-pink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title ?? t("rank.title")}
      </h3>
      {isLoading && <p className="text-xs text-muted-foreground">{t("common.loading")}</p>}
      {isError && <p className="text-xs text-destructive">{t("rank.error")}</p>}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <p className="text-xs text-muted-foreground">{t("rank.empty")}</p>
      )}
      {!!data?.length && (
        <ol className="space-y-1.5">
          {data.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span data-rank-pos className="w-5 text-right text-xs text-neon-yellow">
                {i + 1}.
              </span>
              <span className="flex-1 truncate text-foreground">{s.player_name}</span>
              {formatLevelLabel && (
                <span className="text-xs text-muted-foreground font-medium">
                  {formatLevelLabel(s.level, t)}
                </span>
              )}
              <span className="tabular-nums text-muted-foreground">{formatTime(s.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { formatTime } from "@/platform/scores/formatTime";
import type { Score, ScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";

export function MurdokuRanking({
  service,
  caseId,
  caseTitle,
  title,
  className = "",
}: {
  service: ScoresService;
  caseId: string;
  caseTitle?: string;
  title?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["scores", service.table, caseId],
    queryFn: () => service.fetchTop(caseId),
  });

  const displayTitle =
    title ??
    (caseTitle ? t("murdoku.ranking.caseTitle", { title: caseTitle }) : t("murdoku.ranking.title"));

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <h3
        data-rank-title
        className="mb-3 text-sm tracking-widest text-primary"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {displayTitle}
      </h3>
      {isLoading && <p className="text-xs text-muted-foreground">{t("common.loading")}</p>}
      {isError && <p className="text-xs text-destructive">{t("rank.error")}</p>}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <p className="text-xs text-muted-foreground">{t("murdoku.ranking.noScores")}</p>
      )}
      {!!data?.length && (
        <ol className="space-y-1.5">
          {data.map((s, i) => (
            <li key={s.id} className="flex items-center gap-3 text-sm">
              <span data-rank-pos className="w-5 text-right text-xs text-primary">
                {i + 1}.
              </span>
              <span className="flex-1 truncate text-foreground">{s.player_name}</span>
              <span className="tabular-nums text-muted-foreground">{formatTime(s.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

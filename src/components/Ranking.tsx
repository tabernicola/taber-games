import { useQuery } from "@tanstack/react-query";
import { fetchTopScores, formatTime, type GameId } from "@/lib/scores";
import { useI18n } from "@/lib/i18n";

export function Ranking({
  game,
  level = "",
  title,
  className = "",
}: {
  game: GameId;
  level?: string;
  title?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["scores", game, level],
    queryFn: () => fetchTopScores(game, level),
  });

  return (
    <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>
      <h3
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
              <span className="w-5 text-right text-xs text-neon-yellow">{i + 1}.</span>
              <span className="flex-1 truncate text-foreground">{s.player_name}</span>
              <span className="tabular-nums text-muted-foreground">{formatTime(s.seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

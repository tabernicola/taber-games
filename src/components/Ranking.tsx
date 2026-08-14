import { useQuery } from "@tanstack/react-query";
import { fetchTopScores, formatTime, type GameId } from "@/lib/scores";
import { useI18n } from "@/lib/i18n";

// Map level numbers to level IDs for Taber Square
const taberSquareLevelMap: Record<number, string> = {
  1: "starter",
  2: "junior",
  3: "expert",
  4: "master",
  5: "wizard",
};

function getLevelId(game: GameId, levelNumber: number): string {
  if (game === "taber-square") {
    return taberSquareLevelMap[levelNumber] || `level-${levelNumber}`;
  }
  // For Eternity II, level is the board size (4, 6, 8, 12, 16)
  // Just return the size as-is for display
  return `${levelNumber}×${levelNumber}`;
}

export function Ranking({
  game,
  level,
  title,
  className = "",
}: {
  game: GameId;
  level?: number;
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
          {data.map((s, i) => {
            const levelDisplay =
              game === "taber-square"
                ? t(`game.level.${getLevelId(game, s.level)}`)
                : getLevelId(game, s.level);
            return (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-xs text-neon-yellow">{i + 1}.</span>
                <span className="flex-1 truncate text-foreground">{s.player_name}</span>
                <span className="text-xs text-muted-foreground font-medium">{levelDisplay}</span>
                <span className="tabular-nums text-muted-foreground">{formatTime(s.seconds)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

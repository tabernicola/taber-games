import { Link } from "@tanstack/react-router";
import squareLogo from "@/assets/taber-square-logo-v2.png.asset.json";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { SQUARE_LEVELS } from "./logic/levels";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();

  return (
    <Link
      to="/$lang/the-taber-square"
      params={{ lang }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neon-pink hover:shadow-lg"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "var(--neon-pink)" }}
      />
      <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-background/50 p-2">
        <img
          src={squareLogo.url}
          alt="The Taber Square"
          className="h-full w-full object-contain p-2 drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-pink">
          {t("home.card.tag")}
        </span>
        <h3
          className="mt-0.5 text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The Taber Square
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {t("home.card.desc")}
        </p>
      </div>
    </Link>
  );
}

export const taberSquareGame: GameModule = {
  id: "taber-square",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_taber_square"),
  formatLevelLabel: (level, t) =>
    t(`game.level.${SQUARE_LEVELS[level - 1]?.id ?? `level-${level}`}`),
};

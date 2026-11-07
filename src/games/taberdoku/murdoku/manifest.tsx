import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule, TranslateFn } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();

  return (
    <Link
      to="/$lang/taberdoku/murdoku"
      params={{ lang }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "var(--primary)" }}
      />
      <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-background/50 p-2">
        <MurdokuLogo className="h-full w-full p-2 transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {t("taberdoku.murdoku.title")}
        </span>
        <h3
          className="mt-0.5 text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("murdoku.title")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {t("taberdoku.murdoku.desc")}
        </p>
      </div>
    </Link>
  );
}

function MurdokuLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Murdoku"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="32" cy="32" r="28" fill="currentColor" />
      <path d="M20 44l4-4 4 4 8-8 6 6 10-10 4 4v4H20z" fill="currentColor" />
      <circle cx="32" cy="24" r="6" fill="currentColor" />
      <circle cx="44" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}

export const murdokuGame: GameModule = {
  id: "taberdoku-murdoku",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_murdoku"),
  formatLevelLabel: (): string => "🕵️",
};

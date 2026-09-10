import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule, TranslateFn } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  return (
    <Link
      to="/$lang/murdoku"
      params={{ lang }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-pink"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "var(--neon-pink)" }}
      />
      <div className="mb-3 flex justify-center">
        <MurdokuLogo className="h-24 w-24" />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-neon-pink">
        {t("home.card.murdoku.tag")}
      </span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {t("murdoku.title")}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground flex-1">{t("home.card.murdoku.desc")}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan">
        {t("home.play")} <span aria-hidden>→</span>
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
      aria-hidden
    >
      <circle cx="32" cy="32" r="28" fill="currentColor" />
      <path d="M20 44l4-4 4 4 8-8 6 6 10-10 4 4v4H20z" fill="currentColor" />
      <circle cx="32" cy="24" r="6" fill="currentColor" />
      <circle cx="44" cy="40" r="3" fill="currentColor" />
    </svg>
  );
}

export const murdokuGame: GameModule = {
  id: "murdoku",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_murdoku"),
  formatLevelLabel: (): string => "🕵️",
};

import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { translations as starBattleTranslations } from "../star-battle/i18n";
import { translations as murdokuTranslations } from "./murdoku/i18n";
import { translations as sudokuTranslations } from "../tabers-sudoku/i18n";
import { mergeTranslations } from "@/platform/i18n";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();

  return (
    <Link
      to="/$lang/taberdoku"
      params={{ lang }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "var(--primary)" }}
      />
      <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-background/50 p-2">
        <img
          src="/taberdoku/logo.png"
          alt={t("taberdoku.title")}
          className="h-full w-full object-contain p-2 drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {t("home.card.taberdoku.tag")}
        </span>
        <h3
          className="mt-0.5 text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("taberdoku.title")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {t("home.card.taberdoku.desc")}
        </p>
      </div>
    </Link>
  );
}

const mergedTranslations = mergeTranslations(
  translations,
  starBattleTranslations,
  murdokuTranslations,
  sudokuTranslations,
);

export const taberdokuGame: GameModule = {
  id: "taberdoku",
  Card,
  translations: mergedTranslations,
  createScoresService: () => createScoresService("scores_taberdoku"),
  formatLevelLabel: (): string => "🧩",
};

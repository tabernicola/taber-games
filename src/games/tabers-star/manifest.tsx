import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { TaberStarLogo } from "./ui/TaberStarLogo";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  return (
    <Link
      to="/$lang/the-tabers-star"
      params={{ lang }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[#5C6B3A]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "#5C6B3A" }}
      />
      <div className="mb-3 flex justify-center">
        <TaberStarLogo className="h-24 max-w-64" />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-[#3B4624]">
        {t("home.card.star.tag")}
      </span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        The Taber's Star
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{t("home.card.star.desc")}</p>
      <div className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-[#5C6B3A]">
        {t("home.play")} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

export const tabersStarGame: GameModule = {
  id: "tabers-star",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_tabers_star"),
  formatLevelLabel: () => "★",
};

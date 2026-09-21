import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  return (
    <Link
      to="/$lang/tabers-taberdoku"
      params={{ lang }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ background: "var(--primary)" }}
      />
      <div className="mb-3 flex justify-center">
        <img
          src="/taberdoku/logo.png"
          alt="Taberdoku"
          className="h-24 w-24 object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
        />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-primary">
        {t("home.card.taberdoku.tag")}
      </span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {t("taberdoku.title")}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground flex-1">{t("home.card.taberdoku.desc")}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-secondary">
        {t("home.play")} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

export const tabersTaberdokuGame: GameModule = {
  id: "tabers-taberdoku",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_tabers_taberdoku"),
  formatLevelLabel: (): string => "🧩",
};

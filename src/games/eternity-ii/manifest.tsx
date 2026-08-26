import { Link } from "@tanstack/react-router";
import eternityLogo from "@/assets/tabers-eternity-logo.png.asset.json";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  return (
    <Link
      to="/$lang/eternity-ii"
      params={{ lang }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-pink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "var(--neon-pink)" }}
      />
      <div className="mb-3 flex justify-center">
        <img
          src={eternityLogo.url}
          alt=""
          className="h-24 max-w-64 object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
        />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-neon-pink">
        {t("home.card.e2.tag")}
      </span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        Taber's Eternity
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{t("home.card.e2.desc")}</p>
      <div className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-neon-pink">
        {t("home.play")} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

export const eternityIIGame: GameModule = {
  id: "eternity-ii",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_eternity_ii"),
  formatLevelLabel: (level) => `${level}×${level}`,
};

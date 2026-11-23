import { Link } from "@tanstack/react-router";
import type { GameCardProps, GameModule, TranslateFn } from "@/platform/games/types";
import type { ScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { LEVELS } from "./logic/levels";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();

  return (
    <Link
      to="/$lang/tabernicle-cubicle"
      params={{ lang }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-950/40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "#f59e0b" }}
      />
      <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-background/50 p-2">
        <img
          src="/tabernicle-cubicle/taber-v2.png"
          alt="Tabernicle Cubicle"
          className="h-full w-full object-contain p-1 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
          {t("home.card.tabernicle.tag")}
        </span>
        <h3
          className="mt-0.5 text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tabernicle Cubicle
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {t("home.card.tabernicle.desc")}
        </p>
      </div>
    </Link>
  );
}

function createTabernicleScoresService(): ScoresService {
  return {
    table: "scores_taber_square",
    async fetchTop() {
      try {
        const raw = localStorage.getItem("scores_tabernicle_cubicle");
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    async fetchBySession() {
      return null;
    },
    async submit(level, playerName, seconds) {
      try {
        const raw = localStorage.getItem("scores_tabernicle_cubicle");
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          id: `score-${Date.now()}`,
          player_name: playerName,
          seconds,
          level,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("scores_tabernicle_cubicle", JSON.stringify(list.slice(0, 50)));
      } catch {
        // storage disabled
      }
    },
    async rename() {},
  };
}

export const tabernicleCubicleGame: GameModule = {
  id: "tabernicle-cubicle",
  Card,
  translations,
  createScoresService: createTabernicleScoresService,
  formatLevelLabel: (level: number, t: TranslateFn) =>
    LEVELS[level - 1]?.name.es ?? `Fase ${level}`,
};

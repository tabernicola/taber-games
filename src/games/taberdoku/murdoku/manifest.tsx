import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { GameCardProps, GameModule, TranslateFn } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { GameInfoModal } from "@/components/GameInfoModal";
import { Info } from "lucide-react";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <Link
        to="/$lang/taberdoku/murdoku"
        params={{ lang }}
        className="group relative flex h-[128px] w-[128px] overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
          style={{ background: "var(--primary)" }}
        />
        <MurdokuLogo className="h-full w-full p-3" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setInfoOpen(true);
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:bg-card hover:text-foreground"
          aria-label="Info"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </Link>
      <GameInfoModal
        open={infoOpen}
        onOpenChange={setInfoOpen}
        title={t("murdoku.title")}
        description={t("taberdoku.murdoku.desc")}
        tag={t("taberdoku.murdoku.title")}
        image={<MurdokuLogo className="h-32 w-auto" />}
      />
    </>
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

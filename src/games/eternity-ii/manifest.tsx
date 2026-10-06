import { Link } from "@tanstack/react-router";
import { useState } from "react";
import eternityLogo from "@/assets/tabers-eternity-logo.png.asset.json";
import type { GameCardProps, GameModule } from "@/platform/games/types";
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
        to="/$lang/eternity-ii"
        params={{ lang }}
        className="group relative flex h-[128px] w-[128px] overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-neon-pink"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
          style={{ background: "var(--neon-pink)" }}
        />
        <img
          src={eternityLogo.url}
          alt="Taber's Eternity"
          className="h-full w-full object-contain p-3 drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
        />
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
        title="Taber's Eternity"
        description={t("home.card.e2.desc")}
        tag={t("home.card.e2.tag")}
        image={eternityLogo.url}
      />
    </>
  );
}

export const eternityIIGame: GameModule = {
  id: "eternity-ii",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_eternity_ii"),
  formatLevelLabel: (level) => `${level}×${level}`,
};

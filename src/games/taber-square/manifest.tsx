import { Link } from "@tanstack/react-router";
import { useState } from "react";
import squareLogo from "@/assets/taber-square-logo-v2.png.asset.json";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { SQUARE_LEVELS } from "./logic/levels";
import { GameInfoModal } from "@/components/GameInfoModal";
import { Info } from "lucide-react";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <Link
        to="/$lang/the-taber-square"
        params={{ lang }}
        className="group relative flex h-[128px] w-[128px] overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-neon-pink"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
          style={{ background: "var(--neon-pink)" }}
        />
        <img
          src={squareLogo.url}
          alt="The Taber Square"
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
        title="The Taber Square"
        description={t("home.card.desc")}
        tag={t("home.card.tag")}
        image={squareLogo.url}
      />
    </>
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

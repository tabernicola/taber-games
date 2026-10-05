import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import { translations } from "./i18n";
import { GameInfoModal } from "@/components/GameInfoModal";
import { Info, Play } from "lucide-react";

function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <div className="group relative flex h-[128px] w-[128px] overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-muted-foreground/40">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-30"
          style={{ background: "var(--primary)" }}
        />
        <img
          src="/taberdoku/logo.png"
          alt={t("taberdoku.title")}
          className="h-full w-full object-contain p-3 drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setInfoOpen(true);
          }}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:bg-card hover:text-foreground"
          aria-label="Info"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
        <Link
          to="/$lang/tabers-taberdoku"
          params={{ lang }}
          className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90"
          aria-label="Play"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
        </Link>
      </div>
      <GameInfoModal
        open={infoOpen}
        onOpenChange={setInfoOpen}
        title={t("taberdoku.title")}
        description={t("home.card.taberdoku.desc")}
        tag={t("home.card.taberdoku.tag")}
      />
    </>
  );
}

export const tabersTaberdokuGame: GameModule = {
  id: "tabers-taberdoku",
  Card,
  translations,
  createScoresService: () => createScoresService("scores_taberdoku"),
  formatLevelLabel: (): string => "🧩",
};

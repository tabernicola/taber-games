import { Link } from "@tanstack/react-router";
import { useI18n } from "@/platform/i18n";
import type { GameCardProps, GameModule } from "@/platform/games/types";
import taber from "@/assets/taber-cubicle.png.asset.json";
import { translations } from "./i18n";
function Card({ lang }: GameCardProps) {
  const { t } = useI18n();
  return (
    <Link
      to="/$lang/tabernicle-cubicle"
      params={{ lang }}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-4 transition-transform hover:-translate-y-1"
    >
      <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-md bg-background">
        <img src={taber.url} alt="Taber" className="h-full w-full object-contain" />
      </div>
      <span className="text-xs font-semibold text-neon-cyan">{t("tc.tag")}</span>
      <h3 className="mt-1 font-display text-base">Tabernicle Cubicle</h3>
      <p className="mt-2 text-xs text-muted-foreground">{t("tc.desc")}</p>
    </Link>
  );
}
export const cubicleGame: GameModule = {
  id: "tabernicle-cubicle",
  Card,
  translations,
  formatLevelLabel: () => "1",
};

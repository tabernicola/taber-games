import { Link } from "@tanstack/react-router";
import squareLogo from "@/assets/taber-square-logo-v2.png.asset.json";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { Ranking } from "@/platform/scores/Ranking";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import type { TranslateFn } from "@/platform/games/types";
import { SQUARE_LEVELS } from "../logic/levels";

const scores = createScoresService("scores_taber_square");

export const formatLevelLabel = (level: number, t: TranslateFn) =>
  t(`game.level.${SQUARE_LEVELS[level - 1]?.id ?? `level-${level}`}`);

export function LandingPage() {
  const { t, slug } = useI18n();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="flex flex-col items-center text-center">
          <img
            src={squareLogo.url}
            alt="The Taber Square"
            className="h-40 w-40 object-contain drop-shadow-[0_0_30px_oklch(0.72_0.30_350/0.5)]"
          />
          <h1
            className="mt-4 text-3xl tracking-widest text-neon-pink text-glow-pink sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("game.title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("game.desc")}</p>
          <Link
            to="/$lang/the-taber-square/play"
            params={{ lang: slug }}
            className="mt-6 rounded-lg border border-neon-pink bg-neon-pink/15 px-6 py-3 text-sm font-semibold text-neon-pink transition-all neon-glow-pink hover:bg-neon-pink/25"
          >
            {t("landing.startPlay")}
          </Link>
        </header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2
              className="mb-3 text-sm tracking-widest text-neon-cyan"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("landing.howto")}
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("square.rule1")}</li>
              <li>{t("square.rule2")}</li>
              <li>{t("square.rule3")}</li>
              <li>{t("square.rule4")}</li>
            </ul>
          </section>

          <Ranking
            service={scores}
            title={t("landing.ranking")}
            formatLevelLabel={formatLevelLabel}
          />
        </div>

        <GameFooter basedOn="The Taber Square: basado en The Genius Square de Salim Berghiche" />
      </main>
    </div>
  );
}

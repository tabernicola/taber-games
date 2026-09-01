import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { Ranking } from "@/platform/scores/Ranking";
import { createScoresService } from "@/platform/scores/createScoresService";
import { useI18n } from "@/platform/i18n";
import type { TranslateFn } from "@/platform/games/types";
import { TaberStarLogo } from "../ui/TaberStarLogo";
import { Mascot } from "../ui/Mascot";

const scores = createScoresService("scores_tabers_star");

export const formatLevelLabel = (_level: number, _t: TranslateFn) => "★";

export function LandingPage() {
  const { t, slug } = useI18n();
  return (
    <div className="ts-scope min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="flex flex-col items-center text-center">
          <TaberStarLogo className="h-40 max-w-64" />
          <h1 className="ts-title mt-4 text-3xl tracking-widest sm:text-4xl">{t("star.title")}</h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--ts-ink-soft)]">{t("star.desc")}</p>
          <Link to="/$lang/the-tabers-star/play" params={{ lang: slug }} className="ts-btn mt-6">
            {t("landing.startPlay")}
          </Link>
          <Mascot className="ts-mascot ts-mascot--landing" />
        </header>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <section className="ts-card p-5">
            <h2 className="ts-heading mb-3 text-sm tracking-widest">{t("landing.howto")}</h2>
            <ul className="list-none space-y-2 pl-5 text-sm text-[var(--ts-ink-soft)]">
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: "var(--ts-olive)" }} aria-hidden>
                  •
                </span>
                <span>{t("star.rule1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: "var(--ts-olive)" }} aria-hidden>
                  •
                </span>
                <span>{t("star.rule2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: "var(--ts-olive)" }} aria-hidden>
                  •
                </span>
                <span>{t("star.rule3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: "var(--ts-olive)" }} aria-hidden>
                  •
                </span>
                <span>{t("star.rule4")}</span>
              </li>
            </ul>
          </section>

          <Ranking
            service={scores}
            title={t("landing.ranking")}
            formatLevelLabel={formatLevelLabel}
          />
        </div>

        <GameFooter basedOn="The Taber's Star: basado en The Genius Star de Happy Puzzle Company" />
      </main>
    </div>
  );
}

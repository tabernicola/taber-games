import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { GameFooter } from "@/components/GameFooter";
import { Ranking } from "@/components/Ranking";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { loadSave } from "@/lib/eternity2/saves";
import { LEVELS, type LevelSize } from "@/lib/eternity2/game";
import { formatTime } from "@/lib/scores";

export const Route = createFileRoute("/$lang/eternity-ii/")({
  head: () => ({
    meta: [
      { title: "Eternity II — rules, levels and ranking | The Taber Games" },
      {
        name: "description",
        content:
          "How to play Eternity II, pick a board from 4x4 to the original 256-piece puzzle, check the fastest times and resume a saved game.",
      },
      { property: "og:title", content: "Eternity II — rules, levels and ranking" },
      {
        property: "og:description",
        content:
          "How to play Eternity II, pick a board from 4x4 to the original 256-piece puzzle, check the fastest times and resume a saved game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EternityLanding,
});

function EternityLanding() {
  const { t, slug } = useI18n();
  const { user } = useAuth();
  const [level, setLevel] = useState<LevelSize>(4);

  const { data: save } = useQuery({
    queryKey: ["e2-save", user?.id],
    queryFn: loadSave,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <header className="text-center">
          <h1
            className="text-3xl tracking-widest text-neon-pink text-glow-pink sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ETERNITY II
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{t("e2.desc")}</p>
        </header>

        {/* Level picker */}
        <section className="mt-8 text-center">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            {t("landing.chooseLevel")}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {LEVELS.map((s) => (
              <button
                key={s}
                onClick={() => setLevel(s)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  s === level
                    ? "border-neon-pink bg-neon-pink/15 text-neon-pink neon-glow-pink"
                    : "border-border bg-card text-muted-foreground hover:border-neon-pink/60"
                }`}
              >
                {s}×{s}
                {s === 16 ? " ★" : ""}
              </button>
            ))}
          </div>
          <Link
            to="/$lang/eternity-ii/play"
            params={{ lang: slug }}
            search={{ level, resume: false }}
            className="mt-6 inline-block rounded-lg border border-neon-pink bg-neon-pink/15 px-6 py-3 text-sm font-semibold text-neon-pink transition-all neon-glow-pink hover:bg-neon-pink/25"
          >
            {t("landing.startPlay")} · {level}×{level}
          </Link>

          {/* Saved game */}
          <div className="mt-6 text-sm">
            {!user && (
              <p className="text-muted-foreground">
                {t("e2.saveNeedsAccount")}{" "}
                <Link
                  to="/$lang/auth"
                  params={{ lang: slug }}
                  className="text-neon-cyan hover:underline"
                >
                  {t("auth.signIn")}
                </Link>
              </p>
            )}
            {user && save && (
              <Link
                to="/$lang/eternity-ii/play"
                params={{ lang: slug }}
                search={{ level: save.level as LevelSize, resume: true }}
                className="inline-block rounded-lg border border-neon-cyan bg-neon-cyan/10 px-5 py-2.5 text-sm font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20"
              >
                {t("e2.continue")} —{" "}
                {t("e2.savedInfo", { size: save.level, t: formatTime(save.seconds) })}
              </Link>
            )}
            {user && !save && <p className="text-muted-foreground">{t("e2.noSave")}</p>}
          </div>
        </section>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2
              className="mb-3 text-sm tracking-widest text-neon-cyan"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("landing.howto")}
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("e2.rule1")}</li>
              <li>{t("e2.rule2")}</li>
              <li>{t("e2.rule3")}</li>
              <li>{t("e2.rule4")}</li>
            </ul>
          </section>

          <Ranking
            game="eternity-ii"
            level={String(level)}
            title={`${t("landing.ranking")} · ${level}×${level}`}
          />
        </div>

        <GameFooter basedOn="Eternity II: basado en el puzle original de Christopher Monckton (Tomy)" />
      </main>
    </div>
  );
}

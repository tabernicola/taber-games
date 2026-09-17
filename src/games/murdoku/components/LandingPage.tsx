import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { fetchApprovedCases, type MurdokuCase } from "@/games/murdoku/logic/cases";

import "@/games/murdoku/light-theme.css";

export function LandingPage() {
  const { t, slug } = useI18n();
  const { user } = useAuth();

  const {
    data: cases,
    isError,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["murdoku-cases"],
    queryFn: fetchApprovedCases,
  });

  const [featured] = useState<MurdokuCase | null>(null);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="murdoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
          <header className="text-center">
            <h1
              className="text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("murdoku.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              {t("home.card.murdoku.desc")}
            </p>
          </header>

          <ModeSelect slug={slug} />

          <section className="mt-8 flex justify-center gap-3">
            <Link
              to="/$lang/murdoku/create"
              params={{ lang: slug }}
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
            >
              {t("murdoku.createCase")}
            </Link>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              {t("game.new")}
            </button>
          </section>

          <section className="mt-12">
            <h2
              className="mb-4 text-2xl tracking-widest text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.games")}
            </h2>

            {isPending && (
              <p className="text-center text-sm text-muted-foreground">{t("murdoku.loading")}</p>
            )}

            {isError && <p className="text-center text-sm text-destructive">{t("admin.error")}</p>}

            {cases && cases.length === 0 && !isPending && (
              <div className="text-center">
                <p className="mb-4 text-sm text-muted-foreground">{t("murdoku.noCases")}</p>
                <Link
                  to="/$lang/murdoku/play"
                  params={{ lang: slug }}
                  search={{ caseId: "sample" }}
                  className="inline-block rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  {t("murdoku.solve")} {t("murdoku.noCases")}
                </Link>
              </div>
            )}

            {cases && cases.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {cases.map((c) => (
                  <CaseCard key={c.id} caseData={c} slug={slug} />
                ))}
              </div>
            )}

            {!user && (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {t("murdoku.createDesc")}{" "}
                <Link
                  to="/$lang/auth"
                  params={{ lang: slug }}
                  className="text-secondary hover:underline"
                >
                  {t("creator.signIn")}
                </Link>
              </p>
            )}
          </section>

          <section className="mt-10 flex justify-center">
            <Link
              to="/$lang/murdoku/sospechosos"
              params={{ lang: slug }}
              className="inline-flex items-center justify-center rounded-lg border border-neon-pink bg-neon-pink/10 px-6 py-3 text-sm font-semibold text-neon-pink transition-all hover:bg-neon-pink/20"
            >
              {t("suspects.button")}
            </Link>
          </section>

          <GameFooter basedOn="Murdoku — Sudoku-style deduction puzzle in the style of Clue/Cluedo." />
        </main>
      </div>
    </div>
  );
}

function ModeSelect({ slug }: { slug: "eus" | "es" | "en" }) {
  const { t } = useI18n();

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-lg font-semibold text-foreground">{t("murdoku.mode.case")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("murdoku.mode.caseDesc")}</p>
        <Link
          to="/$lang/murdoku/play"
          params={{ lang: slug }}
          search={{ mode: "case" }}
          className="mt-3 inline-block rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
        >
          {t("murdoku.solve")}
        </Link>
      </div>
    </section>
  );
}

function CaseCard({ caseData, slug }: { caseData: MurdokuCase; slug: string }) {
  const { t } = useI18n();
  const clueCount = caseData.content.clues.length;
  const characterCount = caseData.content.characters.length;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/40">
      <h3 className="text-lg font-semibold text-foreground">{caseData.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("murdoku.clues")}: {clueCount} · {t("murdoku.characters")}: {characterCount}
      </p>
      <Link
        to="/$lang/murdoku/play"
        params={{ lang: slug }}
        search={{ caseId: caseData.id }}
        className="mt-3 inline-block w-full text-center text-sm font-semibold text-secondary hover:underline"
      >
        {t("murdoku.solve")}
      </Link>
    </div>
  );
}

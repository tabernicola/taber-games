import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { SubGameTabs } from "@/games/taberdoku/components/SubGameTabs";
import { fetchApprovedCases, type MurdokuCase } from "@/games/taberdoku/murdoku/logic/cases";
import { localize } from "@/games/taberdoku/murdoku/logic/game";

import "@/games/taberdoku/murdoku/light-theme.css";

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
          <SubGameTabs active="murdoku" />
          <header className="mt-8 text-center">
            <h1
              className="text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("murdoku.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              {t("taberdoku.murdoku.desc")}
            </p>
          </header>

          <section className="mt-8 flex justify-center gap-3">
            <Link
              to="/$lang/taberdoku/murdoku/create"
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
                  to="/$lang/taberdoku/murdoku/play"
                  params={{ lang: slug }}
                  search={{ caseId: "sample" }}
                  className="inline-block rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                >
                  {t("murdoku.solve")} {t("murdoku.noCases")}
                </Link>
              </div>
            )}

            {cases && cases.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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

          <GameFooter basedOn="Murdoku — Sudoku-style deduction puzzle in the style of Clue/Cluedo." />
        </main>
      </div>
    </div>
  );
}

function CaseCard({ caseData, slug }: { caseData: MurdokuCase; slug: string }) {
  const { t, lang } = useI18n();
  const clueCount = Array.isArray(caseData.content?.clues) ? caseData.content.clues.length : 0;
  const characterCount = Array.isArray(caseData.content?.characters) ? caseData.content.characters.length : 0;
  const image = caseData.image || caseData.content?.image;

  return (
    <Link
      to="/$lang/taberdoku/murdoku/play"
      params={{ lang: slug }}
      search={{ caseId: caseData.id }}
      className="group block w-full max-w-[220px] mx-auto"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary hover:shadow-md">
        {image ? (
          <img
            src={image}
            alt={localize(caseData.title, caseData.titleI18n, lang)}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-center text-xs text-muted-foreground px-2">
            {localize(caseData.title, caseData.titleI18n, lang)}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-6">
          <h3 className="text-sm font-semibold text-white line-clamp-2">{localize(caseData.title, caseData.titleI18n, lang)}</h3>
          <p className="mt-0.5 text-[10px] text-white/90">
            {t("murdoku.clues")}: {clueCount} · {t("murdoku.characters")}: {characterCount}
          </p>
        </div>
      </div>
    </Link>
  );
}

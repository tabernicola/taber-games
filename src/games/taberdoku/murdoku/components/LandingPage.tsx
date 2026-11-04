import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
  } = useQuery({
    queryKey: ["murdoku-cases"],
    queryFn: fetchApprovedCases,
  });

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

            {cases && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {cases.map((c) => (
                  <CaseCard key={c.id} caseData={c} slug={slug} />
                ))}
                <CreateCaseCard slug={slug} />
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

function CreateCaseCard({ slug }: { slug: string }) {
  const { t } = useI18n();

  return (
    <Link
      to="/$lang/taberdoku/murdoku/create"
      params={{ lang: slug }}
      className="group mx-auto block aspect-square w-full max-w-[220px]"
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/50 bg-card text-center text-primary transition-all group-hover:border-primary group-hover:bg-primary/5 group-hover:shadow-md">
        <Plus className="h-9 w-9 transition-transform group-hover:scale-110" />
        <span className="px-3 text-sm font-semibold">{t("murdoku.createCase")}</span>
      </div>
    </Link>
  );
}

function CaseCard({ caseData, slug }: { caseData: MurdokuCase; slug: string }) {
  const { t, lang } = useI18n();
  const difficulty = caseData.difficulty ?? 3;
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
          <h3 className="text-sm font-semibold text-white line-clamp-2">
            {localize(caseData.title, caseData.titleI18n, lang)}
          </h3>
          <p className="mt-0.5 text-[10px] text-white/90">{t(`murdoku.difficulty.level${difficulty}`)}</p>
        </div>
      </div>
    </Link>
  );
}

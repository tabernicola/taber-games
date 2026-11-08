import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { SubGameTabs } from "@/games/taberdoku/components/SubGameTabs";
import { fetchApprovedCases, type MurdokuCase } from "@/games/taberdoku/murdoku/logic/cases";
import { localize } from "@/games/taberdoku/murdoku/logic/game";
import { createScoresService } from "@/platform/scores/createScoresService";
import { MurdokuRanking } from "@/games/taberdoku/murdoku/components/MurdokuRanking";
import { CharacterGallery } from "@/platform/characters/CharacterGallery";
import { getStorageItem } from "@/platform/storage";

import "@/games/taberdoku/murdoku/light-theme.css";

const scores = createScoresService("scores_murdoku");
const SOLVED_CASES_KEY = "murdoku-solved-cases";

export function LandingPage() {
  const { t, slug } = useI18n();
  const { user } = useAuth();
  const [solvedCases, setSolvedCases] = useState<Set<string>>(() => new Set());

  const {
    data: cases,
    isError,
    isPending,
  } = useQuery({
    queryKey: ["murdoku-cases"],
    queryFn: fetchApprovedCases,
  });

  const [rankingCaseId, setRankingCaseId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStorageItem(SOLVED_CASES_KEY);
    if (!stored) return;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((caseId) => typeof caseId === "string")) {
        setSolvedCases(new Set(parsed));
      }
    } catch {
      setSolvedCases(new Set());
    }
  }, []);

  const openRanking = (caseId: string) => {
    setRankingCaseId(caseId);
  };

  const closeRanking = () => {
    setRankingCaseId(null);
  };

  const selectedCase = cases?.find((c) => c.id === rankingCaseId);

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
                  <CaseCard
                    key={c.id}
                    caseData={c}
                    slug={slug}
                    solved={solvedCases.has(c.id)}
                    onRankingClick={openRanking}
                  />
                ))}
                <ComingSoonCard />
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

          {rankingCaseId && selectedCase && (
            <RankingModal caseData={selectedCase} slug={slug} onClose={closeRanking} />
          )}

          <CharacterGallery />

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

function ComingSoonCard() {
  const { t } = useI18n();

  return (
    <div className="mx-auto block aspect-square w-full max-w-[220px]">
      <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-card opacity-90">
        <img
          src="/taberdoku/murdoku/cases/graffiti.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover grayscale-[0.15]"
        />
        <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-6">
          <h3 className="text-sm font-semibold text-white line-clamp-2">
            {t("murdoku.comingSoon")}
          </h3>
        </div>
      </div>
    </div>
  );
}

function CaseCard({
  caseData,
  slug,
  solved,
  onRankingClick,
}: {
  caseData: MurdokuCase;
  slug: string;
  solved: boolean;
  onRankingClick: (caseId: string) => void;
}) {
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
        {solved && (
          <img
            src="/taberdoku/murdoku/solved.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[4%] z-[1] h-[76%] w-[92%] -translate-x-1/2 object-contain"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-6">
          <h3 className="text-sm font-semibold text-white line-clamp-2">
            {localize(caseData.title, caseData.titleI18n, lang)}
          </h3>
          <p className="mt-0.5 text-[10px] text-white/90">
            {t(`murdoku.difficulty.level${difficulty}`)}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRankingClick(caseData.id);
          }}
          className="absolute bottom-2 right-2 z-10 rounded-full p-1.5 bg-background/90 text-muted-foreground hover:text-primary hover:bg-background backdrop-blur-sm"
          aria-label={t("murdoku.ranking.title")}
        >
          <Trophy className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}

function RankingModal({
  caseData,
  slug,
  onClose,
}: {
  caseData: MurdokuCase;
  slug: string;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const title = caseData.titleI18n?.[lang] ?? caseData.title;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-border bg-background p-6 shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {t("murdoku.ranking.caseTitle", { title })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("common.close")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <MurdokuRanking service={scores} caseId={caseData.id} caseTitle={title} />
      </div>
    </div>
  );
}

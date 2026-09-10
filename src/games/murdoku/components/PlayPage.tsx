import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useI18n } from "@/platform/i18n";
import { fetchApprovedCases, fetchCase, type MurdokuCase } from "@/games/murdoku/logic/cases";
import { MurdokuGame } from "./MurdokuGame";

type PlaySearch = {
  caseId?: string;
};

export function PlayPage() {
  const { t, slug } = useI18n();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as PlaySearch;
  const caseId = search?.caseId;

  const [selectedCase, setSelectedCase] = useState<MurdokuCase | null>(null);

  const {
    data: approvedCases = [],
    isPending: casesLoading,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ["murdoku-approved"],
    queryFn: fetchApprovedCases,
    enabled: !caseId,
  });

  const {
    data: fetchedCase,
    isPending: caseLoading,
    refetch: refetchCase,
  } = useQuery({
    queryKey: ["murdoku-case", caseId],
    queryFn: () => (caseId ? fetchCase(caseId) : Promise.resolve(null)),
    enabled: !!caseId,
  });

  useEffect(() => {
    if (caseId && fetchedCase && fetchedCase.content) {
      setSelectedCase(fetchedCase);
    }
  }, [caseId, fetchedCase]);

  useEffect(() => {
    if (!caseId && approvedCases.length > 0) {
      setSelectedCase(approvedCases[0]);
    }
  }, [caseId, approvedCases]);

  const isLoading = casesLoading || caseLoading;

  const handlePlayAgain = () => {
    if (!caseId && approvedCases.length > 0) {
      const idx = Math.floor(Math.random() * approvedCases.length);
      setSelectedCase(approvedCases[idx]);
    } else if (fetchedCase) {
      setSelectedCase(fetchedCase);
    } else {
      setSelectedCase(null);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {!selectedCase && (
        <div className="flex min-h-[50vh] items-center justify-center">
          {isLoading ? (
            <p className="text-muted-foreground">{t("murdoku.loading")}</p>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">{t("murdoku.noCases")}</p>
              <button
                type="button"
                onClick={() => void refetchCases()}
                className="rounded-lg border border-neon-pink bg-neon-pink/15 px-4 py-2 text-sm font-semibold text-neon-pink hover:bg-neon-pink/25"
              >
                {t("murdoku.loading")}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedCase && <MurdokuGame case={selectedCase} onPlayAgain={handlePlayAgain} />}

      {!caseId && approvedCases.length > 0 && (
        <button
          type="button"
          onClick={() => navigate({ to: "/$lang/murdoku", params: { lang: slug } })}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur"
        >
          {t("common.back")}
        </button>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import {
  fetchApprovedCases,
  fetchCase,
  type MurdokuCase,
} from "@/games/taberdoku/murdoku/logic/cases";
import { MOTO_ACUATICA_CASE } from "@/games/taberdoku/murdoku/data/gameSchema";
import { MurdokuGame } from "@/games/taberdoku/murdoku/components/MurdokuGame";
import "@/games/taberdoku/murdoku/light-theme.css";

type PlaySearch = {
  caseId?: string;
};

export function PlayPage() {
  const search = useSearch({ strict: false }) as PlaySearch;
  return <CasePlay caseId={search?.caseId} />;
}

function CasePlay({ caseId }: { caseId?: string }) {
  const { t, lang } = useI18n();
  const isDemoCase = caseId === MOTO_ACUATICA_CASE.id;

  const [selectedCase, setSelectedCase] = useState<MurdokuCase | null>(
    isDemoCase ? MOTO_ACUATICA_CASE : null,
  );
  const [showIntro, setShowIntro] = useState(isDemoCase);

  const {
    data: approvedCases = [],
    isPending: casesLoading,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ["murdoku-approved"],
    queryFn: fetchApprovedCases,
    enabled: !caseId || isDemoCase,
  });

  const { data: fetchedCase, isPending: caseLoading } = useQuery({
    queryKey: ["murdoku-case", caseId],
    queryFn: () => (caseId && !isDemoCase ? fetchCase(caseId) : Promise.resolve(null)),
    enabled: !!caseId && !isDemoCase,
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

  useEffect(() => {
    if (!caseId && !casesLoading && approvedCases.length === 0 && !selectedCase) {
      setSelectedCase(MOTO_ACUATICA_CASE);
    }
  }, [caseId, casesLoading, approvedCases, selectedCase]);

  useEffect(() => {
    if (selectedCase) {
      setShowIntro(true);
    }
  }, [selectedCase]);

  const isLoading = casesLoading || caseLoading;

  const handlePlayAgain = () => {
    if (!caseId && approvedCases.length > 0) {
      const idx = Math.floor(Math.random() * approvedCases.length);
      setSelectedCase(approvedCases[idx]);
      setShowIntro(true);
    } else if (fetchedCase) {
      setSelectedCase(fetchedCase);
      setShowIntro(true);
    } else if (!caseId) {
      setSelectedCase(MOTO_ACUATICA_CASE);
      setShowIntro(true);
    } else {
      setSelectedCase(null);
    }
  };

  const closeIntro = () => setShowIntro(false);

  const openIntro = () => setShowIntro(true);

  const factClues = selectedCase?.content.clues.filter((c) => c.type === "fact") ?? [];

  return (
    <div className="murdoku-light min-h-screen">
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
                className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
              >
                {t("murdoku.loading")}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedCase && (
        <>
          <MurdokuGame case={selectedCase} onPlayAgain={handlePlayAgain} onInfo={openIntro} />

          {showIntro && (
            <CaseIntro
              caseData={selectedCase}
              factClues={factClues}
              lang={lang}
              onClose={closeIntro}
            />
          )}
        </>
      )}
    </div>
  );
}

function CaseIntro({
  caseData,
  factClues,
  lang,
  onClose,
}: {
  caseData: MurdokuCase;
  factClues: MurdokuCase["content"]["clues"];
  lang: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const title = caseData.titleI18n?.[lang] ?? caseData.title;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl border border-border bg-background p-6 shadow-2xl max-w-2xl w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>
        {caseData.image && (
          <img
            src={caseData.image}
            alt={title}
            className="mx-auto w-full max-w-xs h-auto rounded-xl border border-border shadow-lg mb-6 object-cover"
            style={{ maxHeight: "35vh", objectFit: "cover" }}
          />
        )}
        <div className="space-y-3 mb-6">
          {factClues.length > 0 ? (
            factClues.map((clue, idx) => (
              <div
                key={clue.id}
                className="p-3 rounded-lg border border-border bg-secondary/5 text-left"
              >
                <p className="text-sm text-foreground">{clue.text[lang] ?? clue.text.es ?? ""}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">{t("murdoku.noFacts")}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-primary bg-primary/15 px-6 py-2 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
        >
          {t("murdoku.startGame")}
        </button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { fetchApprovedCases, fetchCase, type MurdokuCase } from "@/games/murdoku/logic/cases";
import { SAMPLE_CASE } from "@/games/murdoku/data/gameSchema";
import { fetchSuspects } from "@/games/murdoku/logic/characters";
import { MurdokuGame } from "./MurdokuGame";
import { SudokuBoard } from "./SudokuBoard";
import { MeowdokuBoard } from "./MeowdokuBoard";
import { findMeowdokuPuzzle, meowdokuPuzzlesBySize } from "@/games/murdoku/logic/meowdokuPuzzles";
import type { SudokuLevel } from "@/games/murdoku/logic/sudoku";
import "@/games/murdoku/light-theme.css";

type PlaySearch = {
  caseId?: string;
  mode?: string;
  level?: string;
  size?: number;
  puzzle?: string;
};

export function PlayPage() {
  const search = useSearch({ strict: false }) as PlaySearch;
  const mode = search?.mode ?? "case";

  if (mode === "sudoku") {
    return <SudokuPlay level={(search?.level as SudokuLevel) ?? "easy"} />;
  }
  if (mode === "meowdoku") {
    return <MeowdokuPlay size={Number(search?.size) || 6} puzzleId={search?.puzzle} />;
  }
  return <CasePlay caseId={search?.caseId} />;
}

function useCharacters() {
  return useQuery({ queryKey: ["murdoku-suspects"], queryFn: fetchSuspects });
}

function SudokuPlay({ level }: { level: SudokuLevel }) {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();

  if (isPending) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.loading")}</p>
      </div>
    );
  }
  if (characters.length < 9) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.needNineCharacters")}</p>
      </div>
    );
  }
  return <SudokuBoard level={level} characters={characters.slice(0, 9)} />;
}

function MeowdokuPlay({ size, puzzleId }: { size: number; puzzleId?: string }) {
  const { t } = useI18n();
  const { data: characters = [], isPending } = useCharacters();
  const [index, setIndex] = useState(0);

  const list = useMemo(() => meowdokuPuzzlesBySize(size), [size]);
  const puzzle = (puzzleId ? findMeowdokuPuzzle(puzzleId) : undefined) ?? list[index % list.length];

  if (isPending) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.loading")}</p>
      </div>
    );
  }
  if (!puzzle || characters.length < size) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t("murdoku.noCases")}</p>
      </div>
    );
  }

  return (
    <MeowdokuBoard
      key={puzzle.id}
      puzzle={puzzle}
      characters={characters}
      onNewBoard={() => setIndex((i) => i + 1)}
    />
  );
}

function CasePlay({ caseId }: { caseId?: string }) {
  const { t } = useI18n();
  const isDemoCase = caseId === SAMPLE_CASE.id;

  const [selectedCase, setSelectedCase] = useState<MurdokuCase | null>(
    isDemoCase ? SAMPLE_CASE : null,
  );

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
      setSelectedCase(SAMPLE_CASE);
    }
  }, [caseId, casesLoading, approvedCases, selectedCase]);

  const isLoading = casesLoading || caseLoading;

  const handlePlayAgain = () => {
    if (!caseId && approvedCases.length > 0) {
      const idx = Math.floor(Math.random() * approvedCases.length);
      setSelectedCase(approvedCases[idx]);
    } else if (fetchedCase) {
      setSelectedCase(fetchedCase);
    } else if (!caseId) {
      setSelectedCase(SAMPLE_CASE);
    } else {
      setSelectedCase(null);
    }
  };

  return (
    <div className="murdoku-light min-h-screen pt-4">
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

      {selectedCase && <MurdokuGame case={selectedCase} onPlayAgain={handlePlayAgain} />}
    </div>
  );
}

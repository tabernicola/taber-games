import { useEffect, useState, useCallback } from "react";
import { useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import { useAuth } from "@/platform/hooks/useAuth";
import { getStorageItem, setStorageItem } from "@/platform/storage";
import { createScoresService } from "@/platform/scores/createScoresService";
import {
  fetchApprovedCases,
  fetchCase,
  type MurdokuCase,
} from "@/games/taberdoku/murdoku/logic/cases";
import { MurdokuGame } from "@/games/taberdoku/murdoku/components/MurdokuGame";
import "@/games/taberdoku/murdoku/light-theme.css";

const SESSION_ID_KEY = "murdoku-session-id";
const PLAYER_NAME_KEY = "murdoku-player-name";
const PLAYER_NAME_CUSTOM_KEY = "murdoku-player-name-custom";
const SOLVED_CASES_KEY = "murdoku-solved-cases";

const scores = createScoresService("scores_murdoku");

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function generateRandomPlayerName(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getSolvedCases(): Set<string> {
  const stored = getStorageItem(SOLVED_CASES_KEY);
  if (!stored) return new Set();
  try {
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

function saveSolvedCases(cases: Set<string>) {
  setStorageItem(SOLVED_CASES_KEY, JSON.stringify(Array.from(cases)));
}

type PlaySearch = {
  caseId?: string;
};

export function PlayPage() {
  const search = useSearch({ strict: false }) as PlaySearch;
  return <CasePlay caseId={search?.caseId} />;
}

function CasePlay({ caseId }: { caseId?: string }) {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [selectedCase, setSelectedCase] = useState<MurdokuCase | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerNameIsGenerated, setPlayerNameIsGenerated] = useState(false);
  const [solvedCases, setSolvedCases] = useState<Set<string>>(new Set());

  const {
    data: approvedCases = [],
    isPending: casesLoading,
    refetch: refetchCases,
  } = useQuery({
    queryKey: ["murdoku-approved"],
    queryFn: fetchApprovedCases,
  });

  const { data: fetchedCase, isPending: caseLoading } = useQuery({
    queryKey: ["murdoku-case", caseId],
    queryFn: () => (caseId ? fetchCase(caseId) : Promise.resolve(null)),
    enabled: !!caseId,
  });

  // Load selected case
  useEffect(() => {
    if (caseId && fetchedCase && fetchedCase.content) {
      setSelectedCase(fetchedCase);
      setShowIntro(true);
    }
  }, [caseId, fetchedCase]);

  useEffect(() => {
    if (!caseId && approvedCases.length > 0) {
      setSelectedCase(approvedCases[0]);
      setShowIntro(true);
    }
  }, [caseId, approvedCases]);

  // Initialize session, player name, and solved cases on mount
  useEffect(() => {
    // Load solved cases from localStorage
    setSolvedCases(getSolvedCases());
    console.log("[Murdoku] Loaded solved cases:", Array.from(getSolvedCases()));

    // Generate or load session ID
    let currentSessionId = getStorageItem(SESSION_ID_KEY);
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setStorageItem(SESSION_ID_KEY, currentSessionId);
    }
    setSessionId(currentSessionId);

    // Set player name (from auth or generate random)
    if (user?.email) {
      setPlayerName(user.email.split("@")[0]);
      setPlayerNameIsGenerated(false);
    } else {
      let savedPlayerName = getStorageItem(PLAYER_NAME_KEY);
      if (!savedPlayerName) {
        savedPlayerName = generateRandomPlayerName();
        setStorageItem(PLAYER_NAME_KEY, savedPlayerName);
      }
      setPlayerName(savedPlayerName);
      setPlayerNameIsGenerated(!getStorageItem(PLAYER_NAME_CUSTOM_KEY));
    }
  }, [user]);

  const isLoading = casesLoading || caseLoading;

  const handlePlayAgain = () => {
    if (!caseId && approvedCases.length > 0) {
      const unsolvedCases = approvedCases.filter((c) => !solvedCases.has(c.id));
      console.log(
        "[Murdoku] handlePlayAgain - unsolved:",
        unsolvedCases.map((c) => c.id),
      );
      const pool = unsolvedCases.length > 0 ? unsolvedCases : approvedCases;
      const idx = Math.floor(Math.random() * pool.length);
      setSelectedCase(pool[idx]);
      setShowIntro(true);
      return;
    }
    if (fetchedCase) {
      setSelectedCase(fetchedCase);
      setShowIntro(true);
      return;
    }
    setSelectedCase(null);
  };

  const markCaseSolved = useCallback((caseId: string) => {
    console.log("[Murdoku] markCaseSolved:", caseId);
    setSolvedCases((prev) => {
      const next = new Set(prev);
      next.add(caseId);
      saveSolvedCases(next);
      console.log("[Murdoku] Saved solved cases:", Array.from(next));
      return next;
    });
  }, []);

  const closeIntro = () => setShowIntro(false);
  const openIntro = () => setShowIntro(true);

  const handleRename = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStorageItem(PLAYER_NAME_KEY, trimmed);
    setStorageItem(PLAYER_NAME_CUSTOM_KEY, "1");
    setPlayerName(trimmed);
    setPlayerNameIsGenerated(false);

    const currentSessionId = sessionId ?? getStorageItem(SESSION_ID_KEY);
    if (!currentSessionId) return;
    try {
      await scores.rename(currentSessionId, trimmed);
    } catch (error) {
      console.error("Failed to rename the score records:", error);
    }
  };

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
          <MurdokuGame
            key={selectedCase.id}
            case={selectedCase}
            onPlayAgain={handlePlayAgain}
            onInfo={openIntro}
            sessionId={sessionId}
            playerName={playerName}
            playerNameIsGenerated={playerNameIsGenerated}
            onRename={handleRename}
            solvedCases={solvedCases}
            onCaseSolved={markCaseSolved}
            approvedCases={approvedCases}
          />

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

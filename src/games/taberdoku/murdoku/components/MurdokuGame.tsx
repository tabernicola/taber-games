import { useState, useMemo, useEffect, useRef, type FormEvent } from "react";
import { ChevronLeft, HelpCircle, Info, Check, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { CaseContent, MurdokuCase, Position } from "../data/gameSchema";
import type { GuessResult } from "../logic/game";
import { posKey, getRoomForCell, getPlacement } from "../logic/game";
import type { GameMode } from "./BottomNavigation";
import { BottomNavigation } from "./BottomNavigation";
import { MapView } from "./MapView";
import { AccusationModal } from "./AccusationModal";
import { MurdokuTutorial } from "./MurdokuTutorial";
import { useI18n } from "@/platform/i18n";
import { localize } from "../logic/game";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { createScoresService } from "@/platform/scores/createScoresService";
import "@/games/taberdoku/murdoku/light-theme.css";

const scores = createScoresService("scores_murdoku");

export function MurdokuGame({
  case: activeCase,
  onPlayAgain,
  onInfo,
  sessionId,
  playerName,
  playerNameIsGenerated,
  onRename,
  solvedCases,
  onCaseSolved,
  approvedCases,
}: {
  case: MurdokuCase;
  onPlayAgain?: () => void;
  onInfo?: () => void;
  sessionId?: string | null;
  playerName?: string | null;
  playerNameIsGenerated?: boolean;
  onRename?: (name: string) => void | Promise<void>;
  solvedCases?: Set<string>;
  onCaseSolved?: (caseId: string) => void;
  approvedCases?: MurdokuCase[];
}) {
  const { t, slug, lang } = useI18n();
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();
  const { content } = activeCase || {};

  const [mode, setMode] = useState<GameMode>(null);
  const [placements, setPlacements] = useState<Record<string, Position>>({});
  const [tentativeMarks, setTentativeMarks] = useState<Set<string>>(new Set());
  const [manualCrosses, setManualCrosses] = useState<Set<string>>(new Set());
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [lives, setLives] = useState(3);
  const [solutionAnimation, setSolutionAnimation] = useState<
    { type: "correct" | "incorrect"; cellKey: string }[]
  >([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAnimationOnly, setShowAnimationOnly] = useState(false);
  const [incorrectPlacementsToRemove, setIncorrectPlacementsToRemove] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [draftName, setDraftName] = useState(playerName ?? "");
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const placementsRef = useRef(placements);
  const solutionRef = useRef(content?.solution?.placements ?? []);
  const scoreSubmittedRef = useRef(false);

  // Update refs when values change
  useEffect(() => {
    placementsRef.current = placements;
    solutionRef.current = content?.solution?.placements ?? [];
  }, [placements, content?.solution?.placements]);

  // Timer logic - pauses when solution or animation overlay is shown
  useEffect(() => {
    if (timerRunning && !showSolution && !showAnimationOnly) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, showSolution, showAnimationOnly]);

  // Auto-submit score when case is solved
  useEffect(() => {
    if (
      guessResult?.correct &&
      showSolution &&
      sessionId &&
      playerName &&
      !scoreSubmittedRef.current
    ) {
      scoreSubmittedRef.current = true;
      setScoreSubmitted(true);
      setDraftName(playerName);
      scores
        .submit(activeCase.id, playerName, elapsedSeconds, sessionId, elapsedSeconds, 0, 100)
        .catch((error) => {
          console.error("Failed to save score:", error);
          scoreSubmittedRef.current = false;
          setScoreSubmitted(false);
        });
    }
  }, [guessResult, showSolution, sessionId, playerName, elapsedSeconds, activeCase.id]);

  // Trigger solution animation when showSolution becomes true
  useEffect(() => {
    if (showSolution) {
      // Reset animation state
      setSolutionAnimation([]);
      setShowResultModal(false);

      // Calculate correct and incorrect placements
      const animations: { type: "correct" | "incorrect"; cellKey: string }[] = [];

      for (const [charId, placement] of Object.entries(placementsRef.current)) {
        const correctPlacement = solutionRef.current.find((p) => p.characterId === charId);
        const cellKey = posKey(placement.row, placement.col);

        if (
          correctPlacement &&
          correctPlacement.row === placement.row &&
          correctPlacement.col === placement.col
        ) {
          animations.push({ type: "correct", cellKey });
        } else {
          animations.push({ type: "incorrect", cellKey });
        }
      }

      // Sequential animation with sound
      animations.forEach((anim, index) => {
        setTimeout(() => {
          setSolutionAnimation((prev) => [...prev, anim]);
          setTimeout(() => {
            playSound(anim.type === "correct" ? "success" : "error");
          }, 100);
        }, index * 500);
      });

      // Show result modal after animation completes (only for win/lose, not for life loss)
      if (!showAnimationOnly) {
        const totalAnimationTime = animations.length * 500 + 700;
        setTimeout(() => {
          setShowResultModal(true);
        }, totalAnimationTime);
      } else {
        const totalAnimationTime = animations.length * 500 + 700;
        setTimeout(() => {
          setShowResultModal(true);
        }, totalAnimationTime);
      }
    } else {
      // Clear animation when solution is hidden
      setSolutionAnimation([]);
      setShowResultModal(false);
      setShowAnimationOnly(false);
    }
  }, [showSolution, showAnimationOnly, playSound]);

  const autoCrosses = useMemo(() => {
    const crosses = new Set<string>();
    const entries = Object.entries(placements);
    for (const [, pos] of entries) {
      for (let c = 0; c < (content?.gridCols ?? 0); c++) {
        if (c !== pos.col) {
          const key = posKey(pos.row, c);
          const hasChar = entries.some(([, p]) => p.row === pos.row && p.col === c);
          if (!hasChar) crosses.add(key);
        }
      }
      for (let r = 0; r < (content?.gridRows ?? 0); r++) {
        if (r !== pos.row) {
          const key = posKey(r, pos.col);
          const hasChar = entries.some(([, p]) => p.row === r && p.col === pos.col);
          if (!hasChar) crosses.add(key);
        }
      }
    }
    return crosses;
  }, [placements, content?.gridRows, content?.gridCols]);

  // Displayed crosses = auto + manual, minus cells with characters
  const crossedCells = useMemo(() => {
    const combined = new Set([...autoCrosses, ...manualCrosses]);
    for (const [, p] of Object.entries(placements)) {
      combined.delete(posKey(p.row, p.col));
    }
    return combined;
  }, [autoCrosses, manualCrosses, placements]);

  const violationMap = useMemo(() => {
    const violations: Record<string, boolean> = {};
    const entries = Object.entries(placements);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [, posA] = entries[i];
        const [, posB] = entries[j];
        if (posA.row === posB.row && posA.col === posB.col) continue;
        if (posA.row === posB.row || posA.col === posB.col) {
          violations[posKey(posA.row, posA.col)] = true;
          violations[posKey(posB.row, posB.col)] = true;
        }
        const roomA = getRoomForCell(content?.rooms ?? [], posA);
        const roomB = getRoomForCell(content?.rooms ?? [], posB);
        if (roomA && roomB && roomA.id === roomB.id) {
          violations[posKey(posA.row, posA.col)] = true;
          violations[posKey(posB.row, posB.col)] = true;
        }
      }
    }
    return violations;
  }, [placements, content?.rooms]);

  const solutionPlacements: Record<string, Position> | null = useMemo(() => {
    if (!showSolution || !content?.solution?.placements) return null;
    const result: Record<string, Position> = {};
    for (const p of content.solution.placements) {
      result[p.characterId] = { row: p.row, col: p.col };
    }
    return result;
  }, [showSolution, content?.solution?.placements]);

  const killerVictimCell: Position | null = useMemo(() => {
    if (!showSolution || !content?.solution) return null;
    const killerPlacement = getPlacement(content.solution.placements, content.solution.killerId);
    const victimPlacement = content.solution.victimId
      ? getPlacement(content.solution.placements, content.solution.victimId)
      : null;
    if (!killerPlacement || !victimPlacement) return null;
    if (killerPlacement.row !== victimPlacement.row || killerPlacement.col !== victimPlacement.col)
      return null;
    return { row: killerPlacement.row, col: killerPlacement.col };
  }, [showSolution, content?.solution]);

  const handleSelectCharacter = (charId: string) => {
    if (showSolution) return;
    playSound("click");

    if (selectedCharId === charId) {
      // Deselecting character - also deselect clue
      setSelectedCharId(null);
      setSelectedClueId(null);
    } else {
      // Selecting new character - find associated clue
      setSelectedCharId(charId);
      const associatedClue = content.clues.find((c) => c.characterId === charId);
      setSelectedClueId(associatedClue?.id ?? null);
    }

    // If selecting a new character, deselect the mode button if it was active?
    // User says: "cuando se selecciona un personaje que se deseleccione el botón si es que está seleccionado"
    if (selectedCharId !== charId && mode !== null) {
      setMode(null);
    }
  };

  const handleSelectClue = (clueId: string) => {
    if (showSolution) return;
    playSound("click");

    if (selectedClueId === clueId) {
      // Deselecting clue - also deselect character
      setSelectedClueId(null);
      setSelectedCharId(null);
    } else {
      // Selecting new clue - also select associated character if any
      setSelectedClueId(clueId);
      const clue = content.clues.find((c) => c.id === clueId);
      if (clue?.characterId) {
        setSelectedCharId(clue.characterId);
      } else {
        setSelectedCharId(null);
      }
    }
  };

  const handleCellAction = (pos: Position) => {
    if (showSolution) return;
    const pkey = posKey(pos.row, pos.col);
    const hasChar = Object.values(placements).some((p) => p.row === pos.row && p.col === pos.col);

    if (selectedCharId) {
      const existing = placements[selectedCharId];

      // Toggle off: same character at same cell
      if (existing && existing.row === pos.row && existing.col === pos.col) {
        const next = { ...placements };
        delete next[selectedCharId];
        setPlacements(next);
        playSound("click");
        return;
      }

      // Don't place character on a cell marked with X
      if (manualCrosses.has(pkey) || autoCrosses.has(pkey)) {
        playSound("error");
        return;
      }

      // Place character (remove existing character at this cell first)
      const nextPlacements = { ...placements };
      for (const id of Object.keys(nextPlacements)) {
        if (
          id !== selectedCharId &&
          nextPlacements[id].row === pos.row &&
          nextPlacements[id].col === pos.col
        ) {
          delete nextPlacements[id];
        }
      }
      nextPlacements[selectedCharId] = pos;
      setPlacements(nextPlacements);
      playSound("place");

      // Remove manual cross at this cell
      const nextCrosses = new Set(manualCrosses);
      nextCrosses.delete(pkey);
      setManualCrosses(nextCrosses);

      // Check if all characters are placed
      if (
        Array.isArray(content.characters) &&
        Object.keys(nextPlacements).length === content.characters.length
      ) {
        checkSolution(nextPlacements);
      }
    } else if (mode === "crosses") {
      if (hasChar) return;
      const nextCrosses = new Set(manualCrosses);
      if (nextCrosses.has(pkey)) nextCrosses.delete(pkey);
      else nextCrosses.add(pkey);
      setManualCrosses(nextCrosses);
      playSound("click");
    } else if (mode === null) {
      // When no mode selected, don't do anything on cell click
      return;
    }
  };

  const checkSolution = (currentPlacements: Record<string, Position>) => {
    const solution = content.solution.placements;
    let allCorrect = true;
    const incorrectPlacements: string[] = [];

    for (const [charId, pos] of Object.entries(currentPlacements)) {
      const correctPlacement = solution.find((p) => p.characterId === charId);
      if (
        !correctPlacement ||
        correctPlacement.row !== pos.row ||
        correctPlacement.col !== pos.col
      ) {
        allCorrect = false;
        incorrectPlacements.push(charId);
      }
    }

    if (allCorrect) {
      // Win!
      playSound("win");
      setGuessResult({ correct: true, killer: true, victim: true });
      setShowSolution(true);
      onCaseSolved?.(activeCase.id);
    } else {
      // Remove incorrect placements
      if (lives > 1) {
        setLives(lives - 1);
        playSound("error");
        // Store incorrect placements to remove after animation
        setIncorrectPlacementsToRemove(incorrectPlacements);
        // Show animation for incorrect placements BEFORE removing them
        setShowAnimationOnly(true);
        setShowSolution(true);
      } else {
        // Game over
        setLives(0);
        playSound("error");
        setGuessResult({ correct: false, killer: false, victim: false });
        setShowSolution(true);
      }
    }
  };

  const handleAccuse = (result: GuessResult) => {
    playSound(result.correct ? "win" : "error");
    setGuessResult(result);
    setAccusationOpen(false);
    setShowSolution(true);
  };

  const handlePlayAgain = () => {
    playSound("click");
    setMode(null);
    setPlacements({});
    setTentativeMarks(new Set());
    setManualCrosses(new Set());
    setSelectedCharId(null);
    setSelectedClueId(null);
    setGuessResult(null);
    setShowSolution(false);
    setLives(3);
    setSolutionAnimation([]);
    setShowResultModal(false);
    setShowAnimationOnly(false);
    setElapsedSeconds(0);
    setTimerRunning(true);
    setScoreSubmitted(false);
    scoreSubmittedRef.current = false;
    setDraftName(playerName ?? "");
    onPlayAgain?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRenameSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed || !onRename) return;
    await onRename(trimmed);
    setDraftName(trimmed);
  };

  const handleModeChange = (nextMode: GameMode) => {
    if (nextMode !== null && mode !== nextMode) {
      playSound("click");
    } else if (nextMode === null && mode !== null) {
      playSound("click");
    }
    setMode(nextMode);
    if (nextMode !== null && selectedCharId !== null) {
      setSelectedCharId(null);
    }
  };

  const handleOpenAccusation = () => {
    playSound("click");
    setAccusationOpen(true);
  };

  return (
    <div className="murdoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-1 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            void navigate({ to: "/$lang/taberdoku/murdoku", params: { lang: slug } });
          }}
          className="rounded-lg p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-widest text-primary">
            {localize(activeCase.title, activeCase.titleI18n, lang)}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setTutorialOpen(true);
          }}
          className="rounded-lg p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label={t("murdoku.help")}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <main className="pb-24">
        <MapView
          content={content}
          placements={placements}
          tentativeMarks={tentativeMarks}
          crossedCells={crossedCells}
          selectedCharId={selectedCharId}
          onSelectCharacter={handleSelectCharacter}
          onCellAction={handleCellAction}
          onNonWalkableClick={() => playSound("error")}
          mode={mode}
          showSolution={showSolution}
          solutionPositions={solutionPlacements}
          killerVictimCell={killerVictimCell}
          violationMap={violationMap}
          showElementNames={false}
          selectedClueId={selectedClueId}
          onSelectClue={handleSelectClue}
          solutionAnimation={solutionAnimation}
        />
      </main>

      <BottomNavigation
        mode={mode}
        onChangeMode={handleModeChange}
        onInfo={onInfo ?? (() => setTutorialOpen(true))}
        lives={lives}
        elapsedSeconds={elapsedSeconds}
      />

      <AccusationModal
        content={content}
        open={accusationOpen}
        onClose={() => {
          playSound("click");
          setAccusationOpen(false);
        }}
        onAccuse={handleAccuse}
      />

      <MurdokuTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      {showAnimationOnly && showResultModal && solutionAnimation.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={() => {
            playSound("click");
            // Remove incorrect placements
            const nextPlacements = { ...placements };
            incorrectPlacementsToRemove.forEach((id) => delete nextPlacements[id]);
            setPlacements(nextPlacements);
            setIncorrectPlacementsToRemove([]);
            setShowSolution(false);
            setShowAnimationOnly(false);
            setSolutionAnimation([]);
            setShowResultModal(false);
          }}
        >
          <div
            className="relative mx-4 max-w-sm rounded-xl border border-border bg-card/95 p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold tracking-widest text-secondary">
              {t("murdoku.incorrectPlacements")}
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              {t("murdoku.incorrectPlacementsDesc")}
            </p>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                // Remove incorrect placements
                const nextPlacements = { ...placements };
                incorrectPlacementsToRemove.forEach((id) => delete nextPlacements[id]);
                setPlacements(nextPlacements);
                setIncorrectPlacementsToRemove([]);
                setShowSolution(false);
                setShowAnimationOnly(false);
                setSolutionAnimation([]);
                setShowResultModal(false);
              }}
              className="rounded-lg border border-secondary bg-secondary/10 px-4 py-2 text-xs font-semibold text-secondary hover:bg-secondary/20"
            >
              {t("murdoku.continue")}
            </button>
          </div>
        </div>
      )}

      {guessResult?.correct && showResultModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={() => {
            playSound("click");
            handlePlayAgain();
          }}
        >
          <div
            className="relative mx-4 max-w-sm rounded-xl border border-border bg-card/95 p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold tracking-widest text-primary">
              {t("murdoku.youWin")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("murdoku.youWinDesc")}</p>
            <SolutionRow
              killer={
                Array.isArray(content.characters)
                  ? content.characters.find((c) => c.id === content.solution.killerId)
                  : undefined
              }
              victim={
                Array.isArray(content.characters)
                  ? content.characters.find((c) => c.id === content.solution.victimId)
                  : undefined
              }
              content={content}
              t={t}
            />
            <p className="mt-3 text-sm font-semibold text-primary">
              {t("murdoku.ranking.solvedIn", { time: formatTime(elapsedSeconds) })}
            </p>
            {scoreSubmitted && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {t("murdoku.ranking.scoreSaved")}
              </p>
            )}
            {playerNameIsGenerated && onRename && (
              <form onSubmit={handleRenameSubmit} className="mt-3 flex w-full items-center gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  maxLength={24}
                  autoComplete="off"
                  placeholder={t("murdoku.ranking.namePlaceholder")}
                  aria-label={t("murdoku.ranking.changeName")}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!draftName.trim()}
                  className="shrink-0 rounded-lg border border-primary/50 px-3 py-2 text-xs font-semibold text-primary transition-opacity disabled:opacity-40"
                >
                  {t("murdoku.ranking.saveName")}
                </button>
              </form>
            )}

            {(() => {
              const solved = new Set(solvedCases ?? []);
              solved.add(activeCase.id);
              const nextCase = (approvedCases ?? []).find(
                (c) => c.id !== activeCase.id && !solved.has(c.id),
              );
              if (nextCase) {
                return (
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      void navigate({
                        to: "/$lang/taberdoku/murdoku/play",
                        params: { lang: slug },
                        search: { caseId: nextCase.id },
                      });
                    }}
                    className="mt-4 rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    {t("murdoku.nextCase")}
                  </button>
                );
              }
              return (
                <div className="mt-4 mb-2 space-y-3">
                  <p className="text-sm text-muted-foreground">{t("murdoku.noMoreCases")}</p>
                  <p className="text-xs text-muted-foreground">{t("murdoku.noMoreCasesDesc")}</p>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      void navigate({
                        to: "/$lang/taberdoku/murdoku/create",
                        params: { lang: slug },
                      });
                    }}
                    className="rounded-lg border border-primary bg-primary/10 px-6 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    {t("murdoku.createOwnCase")}
                  </button>
                </div>
              );
            })()}

            <button
              type="button"
              onClick={() => {
                playSound("click");
                handlePlayAgain();
              }}
              className="mt-6 rounded-lg border border-destructive bg-destructive/10 px-6 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              {t("murdoku.playAgain")}
            </button>
          </div>
        </div>
      )}

      {guessResult && !guessResult.correct && showResultModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={() => {
            playSound("click");
            handlePlayAgain();
          }}
        >
          <div
            className="relative mx-4 max-w-sm rounded-xl border border-border bg-card/95 p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold tracking-widest text-destructive">
              {t("murdoku.youLose")}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">{t("murdoku.youLoseDesc")}</p>
            <SolutionRow
              killer={content.characters?.find((c) => c.id === content.solution.killerId)}
              victim={content.characters?.find((c) => c.id === content.solution.victimId)}
              content={content}
              t={t}
            />
            <button
              type="button"
              onClick={() => {
                playSound("click");
                handlePlayAgain();
              }}
              className="rounded-lg border border-destructive bg-destructive/10 px-6 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            >
              {t("murdoku.playAgain")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WinScreen({
  activeCase,
  onPlayAgain,
  content,
  t,
}: {
  activeCase: MurdokuCase;
  onPlayAgain: () => void;
  content: CaseContent;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const killer = Array.isArray(content.characters)
    ? content.characters.find((c) => c.id === content.solution.killerId)
    : undefined;
  const victim = Array.isArray(content.characters)
    ? content.characters.find((c) => c.id === content.solution.victimId)
    : undefined;
  const witness =
    content.solution.witnessId && Array.isArray(content.characters)
      ? content.characters.find((c) => c.id === content.solution.witnessId)
      : undefined;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div
        className="text-4xl font-bold tracking-widest text-primary"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("murdoku.youWin")}
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{t("murdoku.youWinDesc")}</p>
      <SolutionRow killer={killer} victim={victim} content={content} t={t} />
      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        {t("murdoku.playAgain")}
      </button>
    </div>
  );
}

function LoseScreen({
  activeCase,
  result,
  onPlayAgain,
  content,
  t,
}: {
  activeCase: MurdokuCase;
  result: GuessResult;
  onPlayAgain: () => void;
  content: CaseContent;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const killer = Array.isArray(content.characters)
    ? content.characters.find((c) => c.id === content.solution.killerId)
    : undefined;
  const victim = Array.isArray(content.characters)
    ? content.characters.find((c) => c.id === content.solution.victimId)
    : undefined;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div
        className="text-4xl font-bold tracking-widest text-destructive"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("murdoku.gameOver")}
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{t("murdoku.incorrect")}</p>
      <SolutionRow killer={killer} victim={victim} content={content} t={t} />
      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded-lg border border-neon-pink bg-neon-pink/15 px-6 py-3 text-sm font-semibold text-neon-pink transition-colors hover:bg-neon-pink/25"
      >
        {t("murdoku.playAgain")}
      </button>
    </div>
  );
}

function SolutionRow({
  killer,
  victim,
  content,
  t,
}: {
  killer: { id: string; name: string; emoji?: string } | undefined;
  victim: { id: string; name: string; emoji?: string } | undefined;
  content: CaseContent;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const { lang } = useI18n();
  const killerPos = getPlacement(content.solution.placements, content.solution.killerId);
  const witness =
    content.solution.witnessId && Array.isArray(content.characters)
      ? content.characters.find((c) => c.id === content.solution.witnessId)
      : undefined;
  const room = killerPos
    ? getRoomForCell(content.rooms, { row: killerPos.row, col: killerPos.col })
    : null;
  const showWitness = !!content.solution.witnessId && !content.solution.victimId;
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="flex items-center justify-center gap-6">
        <SolutionItem label={t("murdoku.killer")} char={killer} />
        {showWitness ? (
          <SolutionItem label={t("murdoku.witness") || "Testigo"} char={witness} />
        ) : (
          <SolutionItem label={t("murdoku.victim")} char={victim} />
        )}
      </div>
      {room && (
        <p className="text-xs text-muted-foreground">
          {t("murdoku.murder")}: {localize(room.name, room.nameI18n, lang)}
        </p>
      )}
    </div>
  );
}

function SolutionItem({
  label,
  char,
}: {
  label: string;
  char: { id: string; name: string; emoji?: string; image?: string } | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">
        {char?.image ? (
          <img
            src={char.image}
            alt={char.name}
            className="h-8 w-8 rounded-full object-top object-cover"
          />
        ) : (
          <>{char?.name ?? "\u2014"}</>
        )}
      </p>
    </div>
  );
}

import { useState, useMemo } from "react";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { CaseContent, MurdokuCase, Position } from "../data/gameSchema";
import type { GuessResult } from "../logic/game";
import { posKey, getRoomForCell, getPlacement } from "../logic/game";
import type { GameMode } from "./BottomNavigation";
import { BottomNavigation } from "./BottomNavigation";
import { MapView } from "./MapView";
import { AccusationModal } from "./AccusationModal";
import { useI18n } from "@/platform/i18n";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import "@/games/murdoku/light-theme.css";

export function MurdokuGame({
  case: activeCase,
  onPlayAgain,
}: {
  case: MurdokuCase;
  onPlayAgain?: () => void;
}) {
  const { t, slug } = useI18n();
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();
  const { content } = activeCase;

  const [mode, setMode] = useState<GameMode>("place");
  const [placements, setPlacements] = useState<Record<string, Position>>({});
  const [tentativeMarks, setTentativeMarks] = useState<Set<string>>(new Set());
  const [manualCrosses, setManualCrosses] = useState<Set<string>>(new Set());
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleSelectCharacter = (charId: string) => {
    if (showSolution) return;
    playSound("click");
    setSelectedCharId(selectedCharId === charId ? null : charId);
  };

  const handleCellAction = (pos: Position) => {
    if (showSolution) return;
    const pkey = posKey(pos.row, pos.col);
    const hasChar = Object.values(placements).some((p) => p.row === pos.row && p.col === pos.col);

    if (mode === "place" && selectedCharId) {
      const existing = placements[selectedCharId];

      // Toggle off: same character at same cell
      if (existing && existing.row === pos.row && existing.col === pos.col) {
        const next = { ...placements };
        delete next[selectedCharId];
        setPlacements(next);
        playSound("click");
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
    } else if (mode === "notes") {
      const nextMarks = new Set(tentativeMarks);
      if (nextMarks.has(pkey)) nextMarks.delete(pkey);
      else if (!hasChar) nextMarks.add(pkey);
      setTentativeMarks(nextMarks);
      playSound("click");
    } else if (mode === "crosses") {
      if (hasChar) return;
      const nextCrosses = new Set(manualCrosses);
      if (nextCrosses.has(pkey)) nextCrosses.delete(pkey);
      else nextCrosses.add(pkey);
      setManualCrosses(nextCrosses);
      playSound("click");
    } else if (mode === "erase") {
      const nextCrosses = new Set(manualCrosses);
      nextCrosses.delete(pkey);
      setManualCrosses(nextCrosses);

      const nextMarks = new Set(tentativeMarks);
      nextMarks.delete(pkey);
      setTentativeMarks(nextMarks);
      playSound("click");
    }
  };

  const autoCrosses = useMemo(() => {
    const crosses = new Set<string>();
    const entries = Object.entries(placements);
    for (const [, pos] of entries) {
      for (let c = 0; c < content.gridCols; c++) {
        if (c !== pos.col) {
          const key = posKey(pos.row, c);
          const hasChar = entries.some(([, p]) => p.row === pos.row && p.col === c);
          if (!hasChar) crosses.add(key);
        }
      }
      for (let r = 0; r < content.gridRows; r++) {
        if (r !== pos.row) {
          const key = posKey(r, pos.col);
          const hasChar = entries.some(([, p]) => p.row === r && p.col === pos.col);
          if (!hasChar) crosses.add(key);
        }
      }
    }
    return crosses;
  }, [placements, content.gridRows, content.gridCols]);

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
        const roomA = getRoomForCell(content.rooms, posA);
        const roomB = getRoomForCell(content.rooms, posB);
        if (roomA && roomB && roomA.id === roomB.id) {
          violations[posKey(posA.row, posA.col)] = true;
          violations[posKey(posB.row, posB.col)] = true;
        }
      }
    }
    return violations;
  }, [placements, content.rooms]);

  const solutionPlacements: Record<string, Position> | null = useMemo(() => {
    if (!showSolution) return null;
    const result: Record<string, Position> = {};
    for (const p of content.solution.placements) {
      result[p.characterId] = { row: p.row, col: p.col };
    }
    return result;
  }, [showSolution, content.solution.placements]);

  const killerVictimCell: Position | null = useMemo(() => {
    if (!showSolution) return null;
    const killerPlacement = getPlacement(content.solution.placements, content.solution.killerId);
    const victimPlacement = getPlacement(content.solution.placements, content.solution.victimId);
    if (!killerPlacement || !victimPlacement) return null;
    if (killerPlacement.row !== victimPlacement.row || killerPlacement.col !== victimPlacement.col)
      return null;
    return { row: killerPlacement.row, col: killerPlacement.col };
  }, [showSolution, content.solution]);

  const handleAccuse = (result: GuessResult) => {
    playSound(result.correct ? "win" : "error");
    setGuessResult(result);
    setAccusationOpen(false);
    setShowSolution(true);
  };

  const handlePlayAgain = () => {
    playSound("click");
    setMode("place");
    setPlacements({});
    setTentativeMarks(new Set());
    setManualCrosses(new Set());
    setSelectedCharId(null);
    setGuessResult(null);
    setShowSolution(false);
    onPlayAgain?.();
  };

  const handleModeChange = (nextMode: GameMode) => {
    if (nextMode !== mode) {
      playSound("click");
    }
    setMode(nextMode);
  };

  const handleOpenAccusation = () => {
    playSound("click");
    setAccusationOpen(true);
  };

  if (guessResult?.correct) {
    return (
      <div className="murdoku-light min-h-screen">
        <WinScreen activeCase={activeCase} onPlayAgain={handlePlayAgain} content={content} t={t} />
      </div>
    );
  }

  if (guessResult && !guessResult.correct) {
    return (
      <div className="murdoku-light min-h-screen">
        <LoseScreen
          activeCase={activeCase}
          result={guessResult}
          onPlayAgain={handlePlayAgain}
          content={content}
          t={t}
        />
      </div>
    );
  }

  return (
    <div className="murdoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            void navigate({ to: "/$lang/murdoku", params: { lang: slug } });
          }}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold tracking-widest text-primary">
          {activeCase.title || t("murdoku.title")}
        </h1>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setTutorialOpen(true);
          }}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
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
          mode={mode}
          showSolution={showSolution}
          solutionPositions={solutionPlacements}
          killerVictimCell={killerVictimCell}
          violationMap={violationMap}
        />
      </main>

      <BottomNavigation
        mode={mode}
        onChangeMode={handleModeChange}
        onAccuse={handleOpenAccusation}
        accusationOpen={accusationOpen}
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

      {tutorialOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={() => setTutorialOpen(false)}
        >
          <div
            className="relative mx-4 max-w-sm rounded-xl border border-border bg-card/95 p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-lg font-bold tracking-widest text-secondary">
              {t("murdoku.tutorial.title")}
            </h3>
            <p className="mb-4 whitespace-pre-line text-xs text-muted-foreground">
              {t("murdoku.tutorial.rules")}
            </p>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setTutorialOpen(false);
              }}
              className="rounded-lg border border-secondary bg-secondary/10 px-4 py-2 text-xs font-semibold text-secondary hover:bg-secondary/20"
            >
              {t("murdoku.tutorial.close")}
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
  const killer = content.characters.find((c) => c.id === content.solution.killerId);
  const victim = content.characters.find((c) => c.id === content.solution.victimId);
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
  const killer = content.characters.find((c) => c.id === content.solution.killerId);
  const victim = content.characters.find((c) => c.id === content.solution.victimId);
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
  const killerPos = getPlacement(content.solution.placements, content.solution.killerId);
  const room = killerPos
    ? getRoomForCell(content.rooms, { row: killerPos.row, col: killerPos.col })
    : null;
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
      <div className="flex items-center justify-center gap-6">
        <SolutionItem label={t("murdoku.killer")} char={killer} />
        <SolutionItem label={t("murdoku.victim")} char={victim} />
      </div>
      {room && (
        <p className="text-xs text-muted-foreground">
          {t("murdoku.murder")}: {room.name}
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

import { useState, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import type { CaseContent, MurdokuCase, Position } from "../data/gameSchema";
import type { GuessResult } from "../logic/game";
import { posKey, getRoomForCell, getPlacement } from "../logic/game";
import type { Mark } from "./deductionState";
import { BottomNavigation, type MurdokuTab } from "./BottomNavigation";
import { MapView } from "./MapView";
import { CluesView } from "./CluesView";
import { DeductionGrid } from "./DeductionGrid";
import { AccusationModal } from "./AccusationModal";
import { useI18n } from "@/platform/i18n";

export function MurdokuGame({
  case: activeCase,
  onPlayAgain,
}: {
  case: MurdokuCase;
  onPlayAgain?: () => void;
}) {
  const { t } = useI18n();
  const { content } = activeCase;

  const [activeTab, setActiveTab] = useState<MurdokuTab>("map");
  const [readClues, setReadClues] = useState<Set<string>>(new Set());
  const [placements, setPlacements] = useState<Record<string, Position>>({});
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [cellMarks, setCellMarks] = useState<Record<string, Mark>>({});
  const [accusationOpen, setAccusationOpen] = useState(false);
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);

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

  const violationMap = useMemo(() => {
    const violations: Record<string, boolean> = {};
    const entries = Object.entries(placements);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [idA, posA] = entries[i];
        const [idB, posB] = entries[j];
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

  const toggleRead = (clueId: string) => {
    const next = new Set(readClues);
    if (next.has(clueId)) next.delete(clueId);
    else next.add(clueId);
    setReadClues(next);
  };

  const handleTogglePlacement = (pos: Position) => {
    if (showSolution || !selectedCharId) return;
    setPlacements((prev) => {
      const next = { ...prev };
      const existing = next[selectedCharId];
      if (existing && existing.row === pos.row && existing.col === pos.col) {
        delete next[selectedCharId];
      } else {
        next[selectedCharId] = pos;
      }
      return next;
    });
  };

  const handleSelectCharacter = (charId: string) => {
    if (showSolution) return;
    setSelectedCharId(selectedCharId === charId ? null : charId);
  };

  const handleMarkChange = (key: string, mark: Mark) => {
    setCellMarks((prev) => ({ ...prev, [key]: mark }));
  };

  const handleAccuse = (result: GuessResult) => {
    setGuessResult(result);
    setAccusationOpen(false);
    setShowSolution(true);
  };

  const handlePlayAgain = () => {
    setReadClues(new Set());
    setPlacements({});
    setSelectedCharId(null);
    setCellMarks({});
    setGuessResult(null);
    setShowSolution(false);
    setActiveTab("map");
    onPlayAgain?.();
  };

  if (guessResult?.correct) {
    return (
      <WinScreen activeCase={activeCase} onPlayAgain={handlePlayAgain} content={content} t={t} />
    );
  }

  if (guessResult && !guessResult.correct) {
    return (
      <LoseScreen
        activeCase={activeCase}
        result={guessResult}
        onPlayAgain={handlePlayAgain}
        content={content}
        t={t}
      />
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold tracking-widest text-neon-pink">
          {activeCase.title || t("murdoku.title")}
        </h1>
        <button
          type="button"
          onClick={() => setAccusationOpen(true)}
          className="flex items-center gap-1 rounded-lg border border-neon-pink bg-neon-pink/15 px-3 py-1.5 text-xs font-semibold text-neon-pink transition-colors hover:bg-neon-pink/25"
        >
          <HelpCircle className="h-4 w-4" />
          {t("murdoku.accuse")}
        </button>
      </header>

      <main className="pb-14">
        {activeTab === "map" && (
          <MapView
            content={content}
            placements={placements}
            selectedCharId={selectedCharId}
            onCellToggle={handleTogglePlacement}
            onSelectCharacter={handleSelectCharacter}
            showSolution={showSolution}
            solutionPositions={solutionPlacements}
            killerVictimCell={killerVictimCell}
            violationMap={violationMap}
          />
        )}
        {activeTab === "clues" && (
          <CluesView clues={content.clues} readClues={readClues} onToggleRead={toggleRead} />
        )}
        {activeTab === "notes" && (
          <DeductionGrid
            content={content}
            marks={cellMarks}
            onMarkChange={handleMarkChange}
            disabled={showSolution}
          />
        )}
      </main>

      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />

      <AccusationModal
        content={content}
        open={accusationOpen}
        onClose={() => setAccusationOpen(false)}
        onAccuse={handleAccuse}
      />
    </>
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
        className="text-4xl font-bold tracking-widest text-neon-pink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t("murdoku.youWin")}
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">{t("murdoku.youWinDesc")}</p>
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
  const victimPos = getPlacement(content.solution.placements, content.solution.victimId);
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
          {t("murdoku.murder")}: {room.emoji} {room.name}
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
  char: { id: string; name: string; emoji?: string } | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">
        {char?.emoji ?? ""} {char?.name ?? "\u2014"}
      </p>
    </div>
  );
}

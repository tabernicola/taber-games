import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { GameNav, GameNavBackLink, GameNavButton, GameNavTimer } from "@/components/GameNav";
import { PieceShape } from "@/components/tabersquare/PieceShape";
import { DiceRollAnimation } from "@/components/tabersquare/DiceRollAnimation";
import { ScoreForm } from "@/components/ScoreForm";
import { Tutorial } from "@/components/tabersquare/Tutorial";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { FlipHorizontal2, Lightbulb, RefreshCw, RotateCw, Eye, EyeOff } from "lucide-react";
import taberSquareHeaderAsset from "@/assets/taber-square-header.png.asset.json";
import {
  BLOCKER,
  BOARD_SIZE,
  applyBlockers,
  canPlaceAt,
  generatePuzzle,
  isSolved,
  placeCells,
  removePiece,
  solveBlockers,
  pieceNumber,
  type BoardCell,
  type Placement,
} from "@/lib/tabersquare/game";
import {
  PIECES,
  allOrientations,
  flip,
  normalize,
  rotate,
  type Cell,
} from "@/lib/tabersquare/pieces";
import {
  SQUARE_LEVELS,
  getLevel,
  levelIndex,
  nextLevelId,
  type SquareLevelId,
} from "@/lib/tabersquare/levels";
import {
  getActiveLevel,
  setActiveLevel,
  isLevelUnlocked,
  unlockNextLevel,
  getUnlockedLevel,
  isTutorialCompleted,
  markTutorialCompleted,
} from "@/lib/tabersquare/progress";

export const Route = createFileRoute("/$lang/the-taber-square/play")({
  head: () => ({
    meta: pageMeta({
      title: "Play The Taber Square — The Taber Games",
      ogTitle: "Play The Taber Square",
      description:
        "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6x6 grid against the clock.",
    }),
  }),
  component: TaberSquarePage,
});

export type PieceState = {
  id: string;
  name: string;
  color: string;
  cells: Cell[];
};

function TaberSquarePage() {
  const { t } = useI18n();
  const { playSound } = useSoundEffects();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [activeLevelId, setActiveLevelId] = useState<SquareLevelId>(getActiveLevel);
  const currentLevelDef = useMemo(() => getLevel(activeLevelId), [activeLevelId]);

  const [blockers, setBlockers] = useState<Cell[]>([]);
  const [board, setBoard] = useState<BoardCell[][]>([]);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [won, setWon] = useState(false);
  const [solution, setSolution] = useState<Placement[] | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [helped, setHelped] = useState(false);
  const [showDiceAnimation, setShowDiceAnimation] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    moved: boolean;
    fromBoard: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [highlightedElement, setHighlightedElement] = useState<'piece' | 'rotate' | 'flip' | 'board' | 'placed-piece' | null>(null);
  const [highlightedPieceId, setHighlightedPieceId] = useState<string | undefined>(undefined);
  const { seconds, setSeconds } = useTimer(!won && board.length > 0 && !showDiceAnimation);

  // Latest state for pointer-event handlers attached to window.
  const stateRef = useRef({ board, pieces, currentLevelDef });
  stateRef.current = { board, pieces, currentLevelDef };

  const newGame = useCallback(() => {
    const puzzle = generatePuzzle(activeLevelId);
    setBlockers(puzzle.blockers);
    setBoard(applyBlockers(puzzle.blockers));
    setPieces(
      PIECES.map((p) => ({ id: p.id, name: p.name, color: p.color, cells: normalize(p.cells) })),
    );
    setSelectedId(null);
    setHover(null);
    setWon(false);
    setSolution(solveBlockers(puzzle.blockers, activeLevelId));
    setShowSolution(false);
    setHintUsed(false);
    setHelped(false);
    setHasRotated(false);
    setHasFlipped(false);
    setSeconds(0);
    setShowDiceAnimation(true);
  }, [activeLevelId, setSeconds]);

  useEffect(() => {
    newGame();
  }, [newGame]);
  
  // Auto-scroll to level info/rules when page loads
  useEffect(() => {
    // Wait for DOM to be fully rendered
    setTimeout(() => {
      const levelInfoElement = document.querySelector('[data-level-info]');
      if (levelInfoElement) {
        levelInfoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Additional small scroll up to leave some space at top
        window.scrollBy({ top: 300, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (board.length && isSolved(board, currentLevelDef)) {
      playSound("win");
      setWon(true);
      unlockNextLevel(activeLevelId);
    }
  }, [board, currentLevelDef, activeLevelId, playSound]);
  
  // Show tutorial on first play (before animation)
  useEffect(() => {
    if (!isTutorialCompleted()) {
      setHasRotated(false);
      setHasFlipped(false);
      setShowTutorial(true);
    }
  }, []);

  const handleSelectLevel = useCallback((levelId: SquareLevelId) => {
    if (isLevelUnlocked(levelId)) {
      setActiveLevelId(levelId);
      setActiveLevel(levelId);
    }
  }, []);

  const giveHint = useCallback(() => {
    if (hintUsed || !solution) return;
    const target = solution.find(
      (pl) => !pl.cells.every(([dx, dy]) => board[pl.oy + dy]?.[pl.ox + dx] === pl.id),
    );
    if (!target) return;
    let next = removePiece(board, target.id);
    for (const [dx, dy] of target.cells) {
      const occupant = next[target.oy + dy]?.[target.ox + dx];
      if (occupant && occupant !== BLOCKER) next = removePiece(next, occupant);
    }
    next = placeCells(next, target.cells, target.ox, target.oy, target.id);
    setPieces((prev) =>
      prev.map((p) => (p.id === target.id ? { ...p, cells: normalize(target.cells) } : p)),
    );
    setBoard(next);
    setSelectedId(null);
    setHintUsed(true);
    setHelped(true);
  }, [board, hintUsed, solution]);
  
  const handleTutorialComplete = useCallback(() => {
    markTutorialCompleted();
    setShowTutorial(false);
  }, []);
  
  const handleTutorialSkip = useCallback(() => {
    markTutorialCompleted();
    setShowTutorial(false);
  }, []);
  
  const handleShowTutorial = useCallback(() => {
    setHasRotated(false);
    setHasFlipped(false);
    setShowTutorial(true);
  }, []);
  
  const handleHighlightElement = useCallback((element: 'piece' | 'rotate' | 'flip' | 'board' | 'placed-piece' | null, pieceId?: string) => {
    setHighlightedElement(element);
    setHighlightedPieceId(pieceId);
  }, []);

  const solutionBoard = useMemo(() => {
    if (!showSolution || !solution) return null;
    let b = applyBlockers(blockers);
    for (const pl of solution) b = placeCells(b, pl.cells, pl.ox, pl.oy, pl.id);
    return b;
  }, [showSolution, solution, blockers]);

  const selected = useMemo(
    () => pieces.find((p) => p.id === selectedId) ?? null,
    [pieces, selectedId],
  );

  const placedIds = useMemo(() => {
    const set = new Set<string>();
    for (const row of board) for (const c of row) if (c && c !== BLOCKER) set.add(c);
    return set;
  }, [board]);

  const trayPieces = pieces.filter((p) => !placedIds.has(p.id));

  const rotateSelected = useCallback(() => {
    if (!selected) return;
    playSound("rotate");
    setHasRotated(true);
    setPieces((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, cells: rotate(p.cells) } : p)),
    );
  }, [selected, playSound]);

  const flipSelected = useCallback(() => {
    if (!selected) return;
    playSound("rotate");
    setHasFlipped(true);
    setPieces((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, cells: flip(p.cells) } : p)),
    );
  }, [selected, playSound]);

  useKeyboardShortcuts({
    r: rotateSelected,
    f: flipSelected,
    Escape: () => setSelectedId(null),
  });

  /** Board cell under a client point, or null when outside the grid. */
  const cellFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const cellEl = el?.closest?.("[data-cell]") as HTMLElement | null;
    if (!cellEl || !boardContainerRef.current?.contains(cellEl)) return null;
    const [cx, cy] = cellEl.dataset.cell!.split(",").map(Number);
    return { x: cx, y: cy };
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent, pieceId: string, fromBoard: boolean) => {
      if (showSolution || showDiceAnimation || won) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragRef.current = {
        id: pieceId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
        fromBoard,
      };
    },
    [showSolution, showDiceAnimation, won],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      if (!d.moved) {
        const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
        if (dist < 6) return;
        d.moved = true;
        suppressClickRef.current = true;
        setSelectedId(d.id);
        if (d.fromBoard) {
          playSound("click");
          setBoard((prev) => removePiece(prev, d.id));
        }
      }
      setDrag({ id: d.id, x: e.clientX, y: e.clientY });
      const cell = cellFromPoint(e.clientX, e.clientY);
      setHover(cell);
    };

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;
      if (!d.moved) return; // treat as a plain click
      setDrag(null);
      setHover(null);
      const { board: b, pieces: ps, currentLevelDef: lvl } = stateRef.current;
      const piece = ps.find((p) => p.id === d.id);
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (piece && cell && canPlaceAt(b, piece.cells, cell.x, cell.y, lvl, piece.id)) {
        playSound("place");
        setBoard(placeCells(b, piece.cells, cell.x, cell.y, piece.id));
        const placed = new Set<string>();
        for (const row of b) for (const c of row) if (c && c !== BLOCKER) placed.add(c);
        const remaining = ps.filter((p) => p.id !== piece.id && !placed.has(p.id));
        setSelectedId(remaining[0]?.id ?? null);
      } else {
        // Dropped outside or in an invalid spot: the piece returns to the tray.
        playSound("click");
        setSelectedId(piece?.id ?? null);
      }
      // Swallow the click event that follows pointerup so it doesn't re-trigger.
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    };

    const onCancel = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      setHover(null);
      if (d?.moved) {
        setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [cellFromPoint, playSound]);

  const handleCellClick = (x: number, y: number) => {
    if (suppressClickRef.current) return;
    const cell = board[y]?.[x];
    if (cell && cell !== BLOCKER) {
      playSound("click");
      setBoard(removePiece(board, cell));
      setSelectedId(cell);
      return;
    }
    if (!selected) return;
    if (canPlaceAt(board, selected.cells, x, y, currentLevelDef, selected.id)) {
      playSound("place");
      setBoard(placeCells(board, selected.cells, x, y, selected.id));
      const remaining = trayPieces.filter((p) => p.id !== selected.id);
      setSelectedId(remaining[0]?.id ?? null);
    } else {
      playSound("click");
    }
  };

  const previewCells = useMemo(() => {
    if (!selected || !hover) return null;
    const cells = selected.cells;
    const valid = canPlaceAt(board, cells, hover.x, hover.y, currentLevelDef, selected.id);
    const set = new Set<string>();
    for (const [dx, dy] of cells) {
      const x = hover.x + dx;
      const y = hover.y + dy;
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) set.add(`${x},${y}`);
    }
    return { set, valid };
  }, [selected, hover, board, currentLevelDef]);

  const totalOrientations = useMemo(
    () => (selected ? allOrientations(selected.cells).length : 0),
    [selected],
  );

  const dragPiece = useMemo(
    () => (drag ? (pieces.find((p) => p.id === drag.id) ?? null) : null),
    [drag, pieces],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-4">
        <header className="flex flex-col items-center">
          <img
            src={taberSquareHeaderAsset.url}
            alt="The Taber Square"
            className="w-full max-w-md object-contain"
          />
        </header>

        {/* Level Selector */}
        <div className="my-6 rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("game.levelChoose")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("game.level")}:{" "}
              <span className="font-bold text-neon-pink">{levelIndex(activeLevelId) + 1}/5</span>
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {SQUARE_LEVELS.map((lvl) => {
              const unlocked = isLevelUnlocked(lvl.id);
              const active = lvl.id === activeLevelId;
              return (
                <button
                  key={lvl.id}
                  disabled={!unlocked}
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border py-2.5 px-1 transition-all ${
                    active
                      ? "border-neon-pink bg-neon-pink/15 text-neon-pink neon-glow-pink font-bold"
                      : unlocked
                        ? "border-border bg-background/40 text-foreground hover:border-neon-pink/50 hover:bg-background/60"
                        : "border-border/30 bg-background/10 text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {t(`game.level.${lvl.id}`)}
                  </span>
                  <span
                    className="mt-1 text-lg font-extrabold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {lvl.tier}
                  </span>
                  {!unlocked && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-destructive/90 p-0.5 text-white">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div data-level-info className="mt-4 rounded-lg border border-border/45 bg-background/40 p-3 text-sm text-muted-foreground">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neon-cyan">
              {t("game.levelInfo")}:
            </span>
            {t(`game.level.desc.${activeLevelId}`)}
          </div>
          
          <div className="mt-2 text-center">
            <button
              onClick={handleShowTutorial}
              className="text-xs text-muted-foreground hover:text-neon-pink transition-colors underline decoration-dotted"
            >
              {t("tutorial.showAgain")}
            </button>
          </div>
        </div>

        {showSolution && (
          <div className="my-4 rounded-lg border border-neon-yellow/60 bg-neon-yellow/10 px-4 py-2 text-sm text-neon-yellow">
            {t("game.solutionShown")}
          </div>
        )}
        
        {showTutorial && (
          <Tutorial
            levelId={activeLevelId}
            board={board}
            pieces={pieces}
            selectedId={selectedId}
            selectedPiece={selected}
            hasRotated={hasRotated}
            hasFlipped={hasFlipped}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
            onResetTutorial={() => {
              setHasRotated(false);
              setHasFlipped(false);
            }}
            onHighlightElement={handleHighlightElement}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          <div className="flex justify-center">
            <div
              ref={boardContainerRef}
              className={`relative grid rounded-xl border-2 p-3 shadow-[0_0_30px_oklch(0.72_0.30_350/0.35)] transition-all ${
                highlightedElement === 'board' 
                  ? 'border-neon-pink shadow-[0_0_40px_oklch(0.72_0.30_350/0.6)] animate-pulse' 
                  : 'border-neon-pink/60'
              }`}
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gap: 6,
                background: "linear-gradient(135deg, oklch(0.96 0.02 90), oklch(0.88 0.04 70))",
              }}
            >
              {showDiceAnimation && (
                <DiceRollAnimation
                  blockers={blockers}
                  onComplete={() => setShowDiceAnimation(false)}
                  boardContainerRef={boardContainerRef}
                />
              )}
              {(solutionBoard ?? board).map((row, y) =>
                row.map((cell, x) => {
                  // Keep the board looking empty until the dice roll finishes and the
                  // dice visually transform into the pivots on top of it.
                  const isBlocker = cell === BLOCKER && !showDiceAnimation;
                  const pieceIdHere = cell && cell !== BLOCKER ? cell : null;
                  const pieceHere = pieceIdHere ? pieces.find((p) => p.id === pieceIdHere) : null;
                  const inPreview = previewCells?.set.has(`${x},${y}`);
                  const previewValid = previewCells?.valid;
                  return (
                    <button
                      key={`${x}-${y}`}
                      data-cell={`${x},${y}`}
                      onClick={() => !showSolution && handleCellClick(x, y)}
                      onPointerDown={(e) =>
                        pieceIdHere && !showSolution && startDrag(e, pieceIdHere, true)
                      }
                      onMouseEnter={() => setHover({ x, y })}
                      onMouseLeave={() => setHover(null)}
                      className={`relative aspect-square w-11 touch-none rounded-md transition-colors sm:w-14 ${
                        highlightedElement === 'placed-piece' && pieceIdHere === highlightedPieceId
                          ? 'animate-pulse' 
                          : ''
                      }`}
                      style={{
                        background: isBlocker
                          ? "oklch(0.25 0.03 40)"
                          : pieceHere
                            ? pieceHere.color
                            : inPreview
                              ? previewValid
                                ? "oklch(0.72 0.30 350 / 0.55)"
                                : "oklch(0.65 0.25 25 / 0.55)"
                              : "oklch(0.99 0.01 90)",
                        boxShadow: isBlocker
                          ? "inset 0 0 0 2px oklch(0.15 0.02 40), inset 0 4px 10px rgba(0,0,0,0.7)"
                          : pieceHere
                            ? highlightedElement === 'placed-piece' && pieceIdHere === highlightedPieceId
                              ? `0 0 25px ${pieceHere.color}, inset 0 0 0 2px rgba(255,255,255,0.5)`
                              : `0 0 10px ${pieceHere.color}, inset 0 0 0 1px rgba(255,255,255,0.25)`
                            : "inset 0 0 0 1px oklch(0.75 0.03 70)",
                      }}
                      aria-label={`Cell ${String.fromCharCode(65 + x)}${y + 1}`}
                    >
                      {isBlocker && (
                        <span className="absolute inset-0 flex items-center justify-center text-neon-yellow">
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            fill="currentColor"
                          >
                            <circle cx="12" cy="12" r="4" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                }),
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("game.pieces")} ({trayPieces.length}/{pieces.length})
                </span>
                {selected ? (
                  <span className="text-sm font-semibold" style={{ color: selected.color }}>
                    {selected.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{t("game.pickPiece")}</span>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={rotateSelected}
                    disabled={!selected || totalOrientations <= 1}
                    aria-label={t("game.rotate")}
                    title={t("game.rotate")}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      highlightedElement === 'rotate' 
                        ? 'border-neon-pink bg-neon-pink/20 shadow-[0_0_15px_oklch(0.72_0.30_350/0.5)] animate-pulse' 
                        : 'border-border bg-secondary text-secondary-foreground hover:border-neon-pink'
                    }`}
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={flipSelected}
                    disabled={!selected}
                    aria-label={t("game.flip")}
                    title={t("game.flip")}
                    className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      highlightedElement === 'flip' 
                        ? 'border-neon-pink bg-neon-pink/20 shadow-[0_0_15px_oklch(0.72_0.30_350/0.5)] animate-pulse' 
                        : 'border-border bg-secondary text-secondary-foreground hover:border-neon-pink'
                    }`}
                  >
                    <FlipHorizontal2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-9">
                {trayPieces.map((p) => {
                  const isSel = p.id === selectedId;
                  const isRestricted = currentLevelDef.restrictedPieces.includes(pieceNumber(p.id));
                  const isHighlighted = highlightedElement === 'piece' && highlightedPieceId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (suppressClickRef.current) return;
                        setSelectedId(p.id);
                      }}
                      onPointerDown={(e) => startDrag(e, p.id, false)}
                      title={isRestricted ? t("game.levelInfo") : undefined}
                      className={`relative flex aspect-square touch-none items-center justify-center rounded-lg border p-1 transition-all ${
                        isSel
                          ? "border-neon-pink bg-neon-pink/20 neon-glow-pink"
                          : isRestricted
                            ? "border-amber-500/60 bg-amber-500/5 hover:border-amber-500"
                            : "border-border bg-card hover:border-neon-pink/50"
                      } ${isHighlighted ? 'shadow-[0_0_20px_oklch(0.72_0.30_350/0.6)] animate-pulse border-neon-pink' : ''}`}
                    >
                      <PieceShape cells={p.cells} color={p.color} cellSize={9} gap={1} />
                      {isRestricted && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("game.hint")}</p>
            </div>
          </div>
        </div>
      </main>

      <GameNav borderClass="border-neon-pink/40">
        <GameNavBackLink to="/$lang/the-taber-square" />
        <GameNavTimer seconds={seconds} />
        <GameNavButton
          onClick={giveHint}
          disabled={hintUsed || !solution || won}
          colorClass="text-neon-cyan"
          icon={<Lightbulb className="h-5 w-5" />}
          label={hintUsed ? t("game.hintUsed") : t("game.hintBtn")}
        />
        <GameNavButton
          onClick={() => {
            setShowSolution((v) => !v);
            setHelped(true);
          }}
          disabled={!solution}
          colorClass="text-neon-yellow"
          icon={showSolution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          label={showSolution ? t("game.hideSolution") : t("game.solution")}
        />
        <GameNavButton
          onClick={newGame}
          colorClass="text-neon-pink"
          icon={<RefreshCw className="h-5 w-5" />}
          label={t("game.new")}
        />
      </GameNav>

      {drag && dragPiece && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -50%)" }}
        >
          <PieceShape cells={dragPiece.cells} color={dragPiece.color} cellSize={26} gap={3} />
        </div>
      )}

      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neon-pink bg-card p-8 text-center neon-glow-pink">
            <h2
              className="text-3xl tracking-widest text-neon-pink text-glow-pink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("game.solved")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{t("game.solvedDesc")}</p>

            {!helped ? (
              <ScoreForm
                game="taber-square"
                level={levelIndex(activeLevelId) + 1}
                seconds={seconds}
              />
            ) : (
              <p className="mt-4 text-sm text-neon-yellow">{t("game.solutionShown")}</p>
            )}

            <div className="mt-6 flex justify-center gap-2">
              {nextLevelId(activeLevelId) && (
                <button
                  onClick={() => {
                    const next = nextLevelId(activeLevelId);
                    if (next) {
                      handleSelectLevel(next);
                    }
                  }}
                  className="rounded-lg border border-neon-cyan bg-neon-cyan/20 px-4 py-2 text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/30"
                >
                  {t("game.nextLevel")}
                </button>
              )}
              <button
                onClick={newGame}
                className="rounded-lg border border-neon-pink bg-neon-pink/20 px-4 py-2 text-sm font-semibold text-neon-pink transition-all hover:bg-neon-pink/30"
              >
                {t("game.playAgain")}
              </button>
              <button
                onClick={() => setWon(false)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:border-neon-pink"
              >
                {t("game.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

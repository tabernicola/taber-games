import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PieceShape } from "@/components/tabersquare/PieceShape";
import { DiceRollAnimation } from "@/components/tabersquare/DiceRollAnimation";
import { ScoreForm } from "@/components/ScoreForm";
import { useI18n } from "@/lib/i18n";
import { useTimer } from "@/hooks/useTimer";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { formatTime } from "@/lib/scores";
import {
  Clock,
  FlipHorizontal2,
  Home,
  Lightbulb,
  RefreshCw,
  RotateCw,
  Eye,
  EyeOff,
} from "lucide-react";
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

export const Route = createFileRoute("/$lang/the-taber-square/play")({
  head: () => ({
    meta: [
      { title: "Play The Taber Square — The Taber Games" },
      {
        name: "description",
        content:
          "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6x6 grid against the clock.",
      },
      { property: "og:title", content: "Play The Taber Square" },
      {
        property: "og:description",
        content:
          "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6x6 grid against the clock.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaberSquarePage,
});

type PieceState = {
  id: string;
  name: string;
  color: string;
  cells: Cell[];
};

function TaberSquarePage() {
  const { t, slug } = useI18n();
  const { playSound } = useSoundEffects();
  const boardContainerRef = useRef<HTMLDivElement>(null);
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
  const { seconds, setSeconds } = useTimer(!won && board.length > 0 && !showDiceAnimation);

  const newGame = useCallback(() => {
    const puzzle = generatePuzzle();
    setBlockers(puzzle.blockers);
    setBoard(applyBlockers(puzzle.blockers));
    setPieces(
      PIECES.map((p) => ({ id: p.id, name: p.name, color: p.color, cells: normalize(p.cells) })),
    );
    setSelectedId(null);
    setHover(null);
    setWon(false);
    setSolution(solveBlockers(puzzle.blockers));
    setShowSolution(false);
    setHintUsed(false);
    setHelped(false);
    setSeconds(0);
    setShowDiceAnimation(true);
  }, [setSeconds]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (board.length && isSolved(board)) {
      playSound("win");
      setWon(true);
    }
  }, [board, playSound]);

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
    setPieces((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, cells: rotate(p.cells) } : p)),
    );
  }, [selected, playSound]);

  const flipSelected = useCallback(() => {
    if (!selected) return;
    playSound("rotate");
    setPieces((prev) =>
      prev.map((p) => (p.id === selected.id ? { ...p, cells: flip(p.cells) } : p)),
    );
  }, [selected, playSound]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") rotateSelected();
      if (e.key === "f" || e.key === "F") flipSelected();
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rotateSelected, flipSelected]);

  const handleCellClick = (x: number, y: number) => {
    const cell = board[y]?.[x];
    if (cell && cell !== BLOCKER) {
      playSound("click");
      setBoard(removePiece(board, cell));
      setSelectedId(cell);
      return;
    }
    if (!selected) return;
    if (canPlaceAt(board, selected.cells, x, y)) {
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
    const valid = canPlaceAt(board, cells, hover.x, hover.y);
    const set = new Set<string>();
    for (const [dx, dy] of cells) {
      const x = hover.x + dx;
      const y = hover.y + dy;
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) set.add(`${x},${y}`);
    }
    return { set, valid };
  }, [selected, hover, board]);

  const totalOrientations = useMemo(
    () => (selected ? allOrientations(selected.cells).length : 0),
    [selected],
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

        {showSolution && (
          <div className="my-4 rounded-lg border border-neon-yellow/60 bg-neon-yellow/10 px-4 py-2 text-sm text-neon-yellow">
            {t("game.solutionShown")}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          <div className="flex justify-center">
            <div
              ref={boardContainerRef}
              className="relative grid rounded-xl border-2 border-neon-pink/60 p-3 shadow-[0_0_30px_oklch(0.72_0.30_350/0.35)]"
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
                      onClick={() => !showSolution && handleCellClick(x, y)}
                      onMouseEnter={() => setHover({ x, y })}
                      onMouseLeave={() => setHover(null)}
                      className="relative aspect-square w-11 rounded-md transition-colors sm:w-14"
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
                            ? `0 0 10px ${pieceHere.color}, inset 0 0 0 1px rgba(255,255,255,0.25)`
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
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={flipSelected}
                    disabled={!selected}
                    aria-label={t("game.flip")}
                    title={t("game.flip")}
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FlipHorizontal2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-9">
                {pieces.map((p) => {
                  const placed = placedIds.has(p.id);
                  const isSel = p.id === selectedId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => !placed && setSelectedId(p.id)}
                      disabled={placed}
                      className={`flex aspect-square items-center justify-center rounded-lg border p-1 transition-all ${
                        isSel
                          ? "border-neon-pink bg-neon-pink/20 neon-glow-pink"
                          : "border-border bg-background/40 hover:border-neon-pink/60"
                      } ${placed ? "opacity-25" : ""}`}
                    >
                      <PieceShape cells={p.cells} color={p.color} cellSize={9} gap={1} />
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{t("game.hint")}</p>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neon-pink/40 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-2">
          <Link
            to="/$lang/the-taber-square"
            params={{ lang: slug }}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:text-neon-pink"
          >
            <Home className="h-5 w-5" />
            {t("common.back")}
          </Link>
          <div className="flex flex-none flex-col items-center justify-center gap-1 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-[10px] font-semibold text-neon-cyan">
            <Clock className="h-5 w-5" />
            <span className="tabular-nums">{formatTime(seconds)}</span>
          </div>
          <button
            onClick={giveHint}
            disabled={hintUsed || !solution || won}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-neon-cyan transition-colors disabled:opacity-40"
          >
            <Lightbulb className="h-5 w-5" />
            {hintUsed ? t("game.hintUsed") : t("game.hintBtn")}
          </button>
          <button
            onClick={() => {
              setShowSolution((v) => !v);
              setHelped(true);
            }}
            disabled={!solution}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-neon-yellow transition-colors disabled:opacity-40"
          >
            {showSolution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            {showSolution ? t("game.hideSolution") : t("game.solution")}
          </button>
          <button
            onClick={newGame}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-neon-pink transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            {t("game.new")}
          </button>
        </div>
      </nav>

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
              <ScoreForm game="taber-square" seconds={seconds} />
            ) : (
              <p className="mt-4 text-sm text-neon-yellow">{t("game.solutionShown")}</p>
            )}

            <div className="mt-6 flex justify-center gap-2">
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

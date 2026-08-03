import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PieceShape } from "@/components/tabersquare/PieceShape";
import { useI18n } from "@/lib/i18n";
import taberSquareLogoAsset from "@/assets/taber-square-logo-v2.png.asset.json";
import taberGamesLogoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import lovableLogoAsset from "@/assets/lovable-logo.png.asset.json";
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

export const Route = createFileRoute("/the-taber-square")({
  head: () => ({
    meta: [
      { title: "The Taber Square — The Taber Games" },
      {
        name: "description",
        content:
          "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6×6 grid.",
      },
      { property: "og:title", content: "The Taber Square — The Taber Games" },
      {
        property: "og:description",
        content:
          "Solo puzzle inspired by The Genius Square. Roll the blockers and fit all nine neon pieces onto the 6×6 grid.",
      },
    ],
  }),
  component: TaberSquarePage,
});

type PieceState = {
  id: string;
  name: string;
  color: string;
  cells: Cell[]; // current orientation
};

function TaberSquarePage() {
  const { t } = useI18n();
  const [blockers, setBlockers] = useState<Cell[]>([]);
  const [board, setBoard] = useState<BoardCell[][]>([]);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [won, setWon] = useState(false);
  const [solution, setSolution] = useState<Placement[] | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const newGame = useCallback(() => {
    const puzzle = generatePuzzle();
    setBlockers(puzzle.blockers);
    setBoard(applyBlockers(puzzle.blockers));
    setPieces(
      PIECES.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        cells: normalize(p.cells),
      })),
    );
    setSelectedId(null);
    setHover(null);
    setWon(false);
    setSolution(solveBlockers(puzzle.blockers));
    setShowSolution(false);
    setHintUsed(false);
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (board.length && isSolved(board)) setWon(true);
  }, [board]);

  const giveHint = useCallback(() => {
    if (hintUsed || !solution) return;
    // Find a piece that is not yet placed exactly where the solution wants it.
    const target = solution.find((pl) => {
      return !pl.cells.every(
        ([dx, dy]) => board[pl.oy + dy]?.[pl.ox + dx] === pl.id,
      );
    });
    if (!target) return;
    // Clear anything occupying those cells, plus the target piece itself.
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
    for (const row of board)
      for (const c of row) if (c && c !== BLOCKER) set.add(c);
    return set;
  }, [board]);

  const trayPieces = pieces.filter((p) => !placedIds.has(p.id));

  const rotateSelected = useCallback(() => {
    if (!selected) return;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, cells: rotate(p.cells) } : p,
      ),
    );
  }, [selected]);

  const flipSelected = useCallback(() => {
    if (!selected) return;
    setPieces((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, cells: flip(p.cells) } : p,
      ),
    );
  }, [selected]);

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
      // Remove that piece
      setBoard(removePiece(board, cell));
      setSelectedId(cell);
      return;
    }
    if (!selected) return;
    if (canPlaceAt(board, selected.cells, x, y)) {
      setBoard(placeCells(board, selected.cells, x, y, selected.id));
      // After placing, if there's a next unplaced piece, select it; else clear.
      const remaining = trayPieces.filter((p) => p.id !== selected.id);
      setSelectedId(remaining[0]?.id ?? null);
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
      if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE)
        set.add(`${x},${y}`);
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
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={taberSquareLogoAsset.url}
              alt="The Taber Square Logo"
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
            <div>
              <h1
                className="text-3xl tracking-widest text-neon-pink text-glow-pink sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("game.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("game.desc")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={giveHint}
            disabled={hintUsed || !solution || won}
            className="rounded-lg border border-neon-cyan bg-neon-cyan/10 px-4 py-2 text-sm font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {hintUsed ? t("game.hintUsed") : t("game.hintBtn")}
          </button>
          <button
            onClick={() => setShowSolution((v) => !v)}
            disabled={!solution}
            className="rounded-lg border border-neon-yellow bg-neon-yellow/10 px-4 py-2 text-sm font-semibold text-neon-yellow transition-all hover:bg-neon-yellow/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {showSolution ? t("game.hideSolution") : t("game.solution")}
          </button>
          <button
            onClick={newGame}
            className="rounded-lg border border-neon-pink bg-neon-pink/10 px-4 py-2 text-sm font-semibold text-neon-pink transition-all hover:bg-neon-pink/20 neon-glow-pink"
          >
            {t("game.new")}
          </button>
          </div>
        </div>

        {showSolution && (
          <div className="mb-4 rounded-lg border border-neon-yellow/60 bg-neon-yellow/10 px-4 py-2 text-sm text-neon-yellow">
            {t("game.solutionShown")}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          {/* Board */}
          <div className="flex justify-center">
            <div
              className="grid rounded-xl border-2 border-neon-pink/60 p-3 shadow-[0_0_30px_oklch(0.72_0.30_350/0.35)]"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gap: 6,
                background:
                  "linear-gradient(135deg, oklch(0.96 0.02 90), oklch(0.88 0.04 70))",
              }}
            >
              {(solutionBoard ?? board).map((row, y) =>
                row.map((cell, x) => {
                  const pieceIdHere = cell && cell !== BLOCKER ? cell : null;
                  const pieceHere = pieceIdHere
                    ? pieces.find((p) => p.id === pieceIdHere)
                    : null;
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
                        background:
                          cell === BLOCKER
                            ? "oklch(0.25 0.03 40)"
                            : pieceHere
                              ? pieceHere.color
                              : inPreview
                                ? previewValid
                                  ? "oklch(0.72 0.30 350 / 0.55)"
                                  : "oklch(0.65 0.25 25 / 0.55)"
                                : "oklch(0.99 0.01 90)",
                        boxShadow:
                          cell === BLOCKER
                            ? "inset 0 0 0 2px oklch(0.15 0.02 40), inset 0 4px 10px rgba(0,0,0,0.7)"
                            : pieceHere
                              ? `0 0 10px ${pieceHere.color}, inset 0 0 0 1px rgba(255,255,255,0.25)`
                              : "inset 0 0 0 1px oklch(0.75 0.03 70)",
                      }}
                      aria-label={`Cell ${String.fromCharCode(65 + x)}${y + 1}`}
                    >
                      {cell === BLOCKER && (
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

          {/* Controls + tray */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t("game.pieces")} ({trayPieces.length}/{pieces.length})
                </span>
                {selected ? (
                  <span
                    className="text-sm font-semibold"
                    style={{ color: selected.color }}
                  >
                    {selected.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t("game.pickPiece")}
                  </span>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={rotateSelected}
                    disabled={!selected || totalOrientations <= 1}
                    className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("game.rotate")}
                  </button>
                  <button
                    onClick={flipSelected}
                    disabled={!selected}
                    className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t("game.flip")}
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

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            The Taber Square: basado en The Genius Square de Salim Berghiche
          </p>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span>developed by</span>
            <a
              href="/"
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <img
                src={taberGamesLogoAsset.url}
                alt="The Taber Games"
                className="h-7 w-auto object-contain"
              />
            </a>
            <span>with</span>
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <img
                src={lovableLogoAsset.url}
                alt="Lovable"
                className="h-6 w-auto rounded object-contain"
              />
            </a>
          </p>
        </footer>

      </main>

      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-w-sm rounded-2xl border border-neon-pink bg-card p-8 text-center neon-glow-pink">
            <h2
              className="text-3xl tracking-widest text-neon-pink text-glow-pink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("game.solved")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("game.solvedDesc")}
            </p>
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

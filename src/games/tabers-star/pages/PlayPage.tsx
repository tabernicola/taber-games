import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameNav, GameNavBackLink, GameNavButton, GameNavTimer } from "@/platform/layout/GameNav";
import { TriShape } from "../ui/TriShape";
import { TaberStarLogo } from "../ui/TaberStarLogo";
import { Tutorial, type HighlightElement } from "../ui/Tutorial";
import type { PieceState } from "../ui/types";
import { WinModal } from "@/platform/kit/WinModal";
import { usePieceDragDrop } from "@/platform/kit/usePieceDragDrop";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { useKeyboardShortcuts } from "@/platform/hooks/useKeyboardShortcuts";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { FlipHorizontal2, Lightbulb, RefreshCw, RotateCw, Eye, EyeOff } from "lucide-react";
import {
  BLOCKER,
  BOARD,
  applyStarBlockers,
  canPlaceAt,
  generatePuzzle,
  isStarSolved,
  removePiece,
  solveStar,
  type StarBoardCell,
  type StarPlacement,
} from "../logic/game";
import { STAR_PIECES } from "../logic/pieces";
import { flipTri, normalizeTris, rotateTri, triKey, triVerts, type Tri } from "../logic/geometry";
import { isTutorialCompleted, markTutorialCompleted } from "../logic/progress";
import { createScoresService } from "@/platform/scores/createScoresService";

const scores = createScoresService("scores_tabers_star");

const TRI_BY_KEY = new Map<string, Tri>(BOARD.map((t) => [triKey(t), t]));
const IDX_BY_KEY = new Map<string, number>(BOARD.map((t, i) => [triKey(t), i]));

/** Board bounding box in cartesian space, for the SVG viewBox. */
const BOARD_BBOX = (() => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of BOARD) {
    for (const [x, y] of triVerts(t)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, w: maxX - minX, h: maxY - minY };
})();

export function PlayPage() {
  const { t } = useI18n();
  const { playSound } = useSoundEffects();
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const trayContainerRef = useRef<HTMLDivElement>(null);
  const actionsContainerRef = useRef<HTMLDivElement>(null);

  const [board, setBoard] = useState<StarBoardCell[]>([]);
  const [blockers, setBlockers] = useState<Tri[]>([]);
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [solution, setSolution] = useState<StarPlacement[] | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [helped, setHelped] = useState(false);
  const [won, setWon] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverTri, setHoverTri] = useState<Tri | null>(null);

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasRotated, setHasRotated] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HighlightElement>(null);
  const [highlightedPieceId, setHighlightedPieceId] = useState<string | undefined>(undefined);

  const { seconds, setSeconds } = useTimer(!won && board.length > 0 && !showTutorial);

  const stateRef = useRef({ board, pieces });
  stateRef.current = { board, pieces };

  const newGame = useCallback(() => {
    const puzzle = generatePuzzle();
    setBlockers(puzzle.blockers);
    setBoard(applyStarBlockers(puzzle.blockers));
    setPieces(
      STAR_PIECES.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        cells: normalizeTris(p.cells),
      })),
    );
    setSelectedId(null);
    setHoverTri(null);
    setWon(false);
    setSolution(solveStar(puzzle.blockers));
    setShowSolution(false);
    setHintUsed(false);
    setHelped(false);
    setHasRotated(false);
    setHasFlipped(false);
    setSeconds(0);
  }, [setSeconds]);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (board.length && isStarSolved(board)) {
      playSound("win");
      setWon(true);
    }
  }, [board, playSound]);

  // Show tutorial on first play
  useEffect(() => {
    if (!isTutorialCompleted()) {
      setHasRotated(false);
      setHasFlipped(false);
      setSelectedId(null);
      setShowTutorial(true);
    }
  }, []);

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
    setBoard(applyStarBlockers(blockers));
    setSelectedId(null);
    setShowTutorial(true);
  }, [blockers]);

  const handleResetTutorial = useCallback(() => {
    setHasRotated(false);
    setHasFlipped(false);
    setBoard(applyStarBlockers(blockers));
    setSelectedId(null);
  }, [blockers]);

  const handleResetRotateFlip = useCallback(() => {
    setHasRotated(false);
    setHasFlipped(false);
  }, []);

  const handleHighlightElement = useCallback((element: HighlightElement, pieceId?: string) => {
    setHighlightedElement(element);
    setHighlightedPieceId(pieceId);
  }, []);

  const handleScrollTo = useCallback((target: "board" | "tray" | "actions") => {
    if (target === "board" && boardContainerRef.current) {
      boardContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (target === "tray" && trayContainerRef.current) {
      trayContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (target === "actions" && actionsContainerRef.current) {
      actionsContainerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const solutionBoard = useMemo(() => {
    if (!showSolution || !solution) return null;
    let b = applyStarBlockers(blockers);
    for (const pl of solution) {
      b = b.slice();
      for (const tri of pl.tris) {
        const i = IDX_BY_KEY.get(triKey(tri));
        if (i !== undefined) b[i] = pl.id;
      }
    }
    return b;
  }, [showSolution, solution, blockers]);

  const selected = useMemo(
    () => pieces.find((p) => p.id === selectedId) ?? null,
    [pieces, selectedId],
  );

  const placedIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of board) if (c && c !== BLOCKER) set.add(c);
    return set;
  }, [board]);

  const trayPieces = pieces.filter((p) => !placedIds.has(p.id));

  const rotateSelected = useCallback(() => {
    if (!selected) return;
    playSound("rotate");
    setHasRotated(true);
    setPieces((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, cells: normalizeTris(p.cells.map(rotateTri)) } : p,
      ),
    );
  }, [selected, playSound]);

  const flipSelected = useCallback(() => {
    if (!selected) return;
    playSound("rotate");
    setHasFlipped(true);
    setPieces((prev) =>
      prev.map((p) =>
        p.id === selected.id ? { ...p, cells: normalizeTris(p.cells.map(flipTri)) } : p,
      ),
    );
  }, [selected, playSound]);

  useKeyboardShortcuts({
    r: rotateSelected,
    f: flipSelected,
    Escape: () => setSelectedId(null),
  });

  /** Translation that anchors a piece's first cell onto `target`. */
  const anchorFor = useCallback((cells: Tri[], target: Tri) => {
    return { dq: target.q - cells[0].q, dr: target.r - cells[0].r };
  }, []);

  /** Board triangle under a client point, or null when outside the star. */
  const triFromPoint = useCallback((clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY);
    const cellEl = el?.closest?.("[data-tri]") as HTMLElement | null;
    if (!cellEl || !boardContainerRef.current?.contains(cellEl)) return null;
    return TRI_BY_KEY.get(cellEl.dataset.tri!) ?? null;
  }, []);

  const placeOnBoard = useCallback(
    (b: StarBoardCell[], pieceId: string, cells: Tri[], dq: number, dr: number) => {
      let next = b;
      for (const cell of cells) {
        const idx = IDX_BY_KEY.get(triKey({ q: cell.q + dq, r: cell.r + dr, d: cell.d }));
        if (idx !== undefined) {
          if (next === b) next = b.slice();
          next[idx] = pieceId;
        }
      }
      return next;
    },
    [],
  );

  const { drag, startDrag, shouldSuppressClick } = usePieceDragDrop<Tri>({
    canStartDrag: () => !showSolution && !won && !showTutorial,
    resolveTarget: triFromPoint,
    onPickPiece: setSelectedId,
    onLiftPiece: (pieceId) => {
      playSound("click");
      setBoard((prev) => removePiece(prev, pieceId));
    },
    onHoverTarget: setHoverTri,
    onDrop: (pieceId, tri) => {
      const { board: b, pieces: ps } = stateRef.current;
      const piece = ps.find((p) => p.id === pieceId);
      if (piece && tri) {
        const { dq, dr } = anchorFor(piece.cells, tri);
        if (canPlaceAt(b, piece.cells, dq, dr)) {
          playSound("place");
          setBoard(placeOnBoard(b, piece.id, piece.cells, dq, dr));
          const placed = new Set<string>();
          for (const c of b) if (c && c !== BLOCKER) placed.add(c);
          placed.add(piece.id);
          const remaining = ps.filter((p) => p.id !== piece.id && !placed.has(p.id));
          setSelectedId(remaining[0]?.id ?? null);
          return;
        }
      }
      // Dropped outside or in an invalid spot: the piece returns to the tray.
      playSound("click");
      setSelectedId(piece?.id ?? null);
    },
  });

  const placeSelected = (target: Tri) => {
    if (shouldSuppressClick()) return;
    const occupantIdx = IDX_BY_KEY.get(triKey(target));
    const occupant = occupantIdx !== undefined ? board[occupantIdx] : null;
    if (occupant && occupant !== BLOCKER) {
      playSound("click");
      setBoard(removePiece(board, occupant));
      setSelectedId(occupant);
      return;
    }
    if (!selected || showSolution) return;
    const { dq, dr } = anchorFor(selected.cells, target);
    if (canPlaceAt(board, selected.cells, dq, dr)) {
      playSound("place");
      setBoard(placeOnBoard(board, selected.id, selected.cells, dq, dr));
      const remaining = trayPieces.filter((p) => p.id !== selected.id);
      setSelectedId(remaining[0]?.id ?? null);
    } else {
      playSound("click");
    }
  };

  const previewSet = useMemo(() => {
    if (!selected || !hoverTri) return null;
    const { dq, dr } = anchorFor(selected.cells, hoverTri);
    const valid = canPlaceAt(board, selected.cells, dq, dr);
    const set = new Set<string>();
    for (const cell of selected.cells) {
      set.add(triKey({ q: cell.q + dq, r: cell.r + dr, d: cell.d }));
    }
    return { set, valid };
  }, [selected, hoverTri, board, anchorFor]);

  const dragPiece = useMemo(
    () => (drag ? (pieces.find((p) => p.id === drag.id) ?? null) : null),
    [drag, pieces],
  );

  const giveHint = useCallback(() => {
    if (hintUsed || !solution) return;
    const target = solution.find(
      (pl) => !pl.tris.every((tri) => board[IDX_BY_KEY.get(triKey(tri))!] === pl.id),
    );
    if (!target) return;
    let next = removePiece(board, target.id);
    for (const tri of target.tris) {
      const i = IDX_BY_KEY.get(triKey(tri))!;
      if (next[i] && next[i] !== BLOCKER) next = removePiece(next, next[i]!);
    }
    next = next.slice();
    for (const tri of target.tris) {
      const i = IDX_BY_KEY.get(triKey(tri))!;
      next[i] = target.id;
    }
    setBoard(next);
    setSelectedId(null);
    setHintUsed(true);
    setHelped(true);
  }, [board, hintUsed, solution]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-4">
        <header className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <TaberStarLogo className="h-16 w-16 drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]" />
            <h1
              className="text-2xl tracking-widest text-neon-pink text-glow-pink sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              THE TABER'S STAR
            </h1>
          </div>
          <button
            onClick={handleShowTutorial}
            className="mt-3 cursor-pointer text-xs text-muted-foreground transition-colors underline decoration-dotted hover:text-neon-pink"
          >
            {t("tutorial.showAgain")}
          </button>
        </header>

        {showSolution && (
          <div className="my-4 rounded-lg border border-neon-yellow/60 bg-neon-yellow/10 px-4 py-2 text-sm text-neon-yellow">
            {t("game.solutionShown")}
          </div>
        )}

        {showTutorial && (
          <Tutorial
            board={board}
            pieces={pieces}
            selectedId={selectedId}
            selectedPiece={selected}
            hasRotated={hasRotated}
            hasFlipped={hasFlipped}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
            onResetTutorial={handleResetTutorial}
            onResetRotateFlip={handleResetRotateFlip}
            onHighlightElement={handleHighlightElement}
            onScrollTo={handleScrollTo}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          <div className="flex justify-center">
            <div
              ref={boardContainerRef}
              className={`relative rounded-xl border-2 p-3 transition-all ${
                showTutorial && highlightedElement === "board"
                  ? "relative z-50 border-neon-pink ring-4 ring-neon-pink ring-offset-4 ring-offset-background shadow-[0_0_50px_oklch(0.72_0.30_350/0.8)]"
                  : "border-neon-pink/60 shadow-[0_0_30px_oklch(0.72_0.30_350/0.35)]"
              }`}
              style={{
                background: "linear-gradient(135deg, oklch(0.96 0.02 90), oklch(0.88 0.04 70))",
              }}
            >
              <svg
                viewBox={`${BOARD_BBOX.minX - 1} ${BOARD_BBOX.minY - 1} ${BOARD_BBOX.w + 2} ${BOARD_BBOX.h + 2}`}
                className="max-w-full"
                style={{
                  width: Math.min(
                    520,
                    typeof window !== "undefined" ? window.innerWidth - 80 : 520,
                  ),
                  height: "auto",
                }}
              >
                {(solutionBoard ?? board).map((cell, i) => {
                  const tri = BOARD[i];
                  const key = triKey(tri);
                  const isBlocker = cell === BLOCKER;
                  const pieceHere =
                    cell && cell !== BLOCKER ? pieces.find((p) => p.id === cell) : null;
                  const inPreview = previewSet?.set.has(key);
                  const previewValid = previewSet?.valid;
                  const fill = isBlocker
                    ? "oklch(0.25 0.03 40)"
                    : pieceHere
                      ? pieceHere.color
                      : inPreview
                        ? previewValid
                          ? "oklch(0.72 0.30 350 / 0.55)"
                          : "oklch(0.65 0.25 25 / 0.55)"
                        : "oklch(0.99 0.01 90)";
                  return (
                    <polygon
                      key={key}
                      data-tri={key}
                      points={triVerts(tri)
                        .map(([x, y]) => `${x},${y}`)
                        .join(" ")}
                      fill={fill}
                      stroke={pieceHere ? "rgba(255,255,255,0.3)" : "oklch(0.75 0.03 70)"}
                      strokeWidth="0.06"
                      style={{ cursor: "pointer" }}
                      onClick={() => !showSolution && placeSelected(tri)}
                      onPointerDown={(e) =>
                        pieceHere && !showSolution && startDrag(e, pieceHere.id, true)
                      }
                      onMouseEnter={() => setHoverTri(tri)}
                      onMouseLeave={() => setHoverTri(null)}
                    >
                      {!isBlocker && !pieceHere && !inPreview && <title>{`Cell ${i}`}</title>}
                    </polygon>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div
              ref={trayContainerRef}
              className={`rounded-xl border bg-card p-4 transition-all ${
                showTutorial && highlightedElement === "tray"
                  ? "relative z-50 border-neon-pink ring-2 ring-neon-pink/80 shadow-[0_0_35px_oklch(0.72_0.30_350/0.5)]"
                  : "border-border"
              }`}
            >
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
                <div
                  ref={actionsContainerRef}
                  className={`ml-auto flex gap-2 rounded-lg p-1 transition-all ${
                    showTutorial && highlightedElement === "actions"
                      ? "relative z-50 ring-4 ring-neon-pink bg-neon-pink/20 shadow-[0_0_30px_oklch(0.72_0.30_350/0.8)] animate-pulse"
                      : ""
                  }`}
                >
                  <button
                    onClick={rotateSelected}
                    disabled={!selected}
                    aria-label={t("game.rotate")}
                    title={t("game.rotate")}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={flipSelected}
                    disabled={!selected}
                    aria-label={t("game.flip")}
                    title={t("game.flip")}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-secondary-foreground transition-colors hover:border-neon-pink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FlipHorizontal2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                {trayPieces.map((p) => {
                  const isSel = p.id === selectedId;
                  const isTargetTutorialPiece =
                    showTutorial && highlightedElement === "tray" && highlightedPieceId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (shouldSuppressClick()) return;
                        setSelectedId(p.id);
                      }}
                      onPointerDown={(e) => startDrag(e, p.id, false)}
                      className={`relative flex aspect-square touch-none items-center justify-center rounded-lg border p-1 transition-all ${
                        isSel
                          ? "border-neon-pink bg-neon-pink/20 neon-glow-pink"
                          : "border-border bg-card hover:border-neon-pink/50"
                      } ${
                        isTargetTutorialPiece
                          ? "relative z-50 scale-105 animate-pulse ring-4 border-neon-pink ring-neon-pink shadow-[0_0_30px_oklch(0.72_0.30_350/0.9)]"
                          : ""
                      }`}
                    >
                      <TriShape cells={p.cells} color={p.color} cellSize={11} />
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
        <GameNavBackLink to="/$lang/the-tabers-star" />
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
          <TriShape cells={dragPiece.cells} color={dragPiece.color} cellSize={26} />
        </div>
      )}

      {won && (
        <WinModal
          helped={helped}
          seconds={seconds}
          scores={scores}
          level={1}
          onPlayAgain={newGame}
          onClose={() => setWon(false)}
        />
      )}
    </div>
  );
}

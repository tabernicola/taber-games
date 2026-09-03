import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameNav, GameNavBackLink, GameNavButton, GameNavTimer } from "@/platform/layout/GameNav";
import { TriShape } from "../ui/TriShape";
import { TaberStarLogo } from "../ui/TaberStarLogo";
import { Mascot } from "../ui/Mascot";
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
  getCellColor,
  isStarSolved,
  removePiece,
  type StarBoardCell,
  type StarPlacement,
} from "../logic/game";
import { STAR_PIECES } from "../logic/pieces";
import {
  flipTri,
  normalizeTris,
  rotateTri,
  triKey,
  triVerts,
  type Tri,
  allTriOrientations,
} from "../logic/geometry";
import { isTutorialCompleted, markTutorialCompleted } from "../logic/progress";
import { createScoresService } from "@/platform/scores/createScoresService";
import { DiceRollAnimation } from "../ui/DiceRollAnimation";

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
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [nextBlockers, setNextBlockers] = useState<Tri[]>([]);

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

  const placedPieceColorsMap = useMemo(() => {
    const map: Record<string, string> = {};

    pieces.forEach((piece) => {
      const boardIndices = board
        .map((cell, idx) => (cell === piece.id ? idx : -1))
        .filter((idx) => idx !== -1);

      if (boardIndices.length === 0) return;

      const placedTris = boardIndices.map((idx) => BOARD[idx]);

      if (placedTris.length !== piece.cells.length) return;

      const placedSet = new Set(placedTris.map(triKey));
      const localCell = piece.cells[0];

      let dq = 0;
      let dr = 0;
      for (const absCell of placedTris) {
        const testDq = absCell.q - localCell.q;
        const testDr = absCell.r - localCell.r;
        const matches = piece.cells.every((lc) => {
          const absKey = triKey({ q: lc.q + testDq, r: lc.r + testDr, d: lc.d });
          return placedSet.has(absKey);
        });
        if (matches) {
          dq = testDq;
          dr = testDr;
          break;
        }
      }

      piece.cells.forEach((lc) => {
        const absTri = { q: lc.q + dq, r: lc.r + dr, d: lc.d };
        const absKey = triKey(absTri);
        if (lc.color !== undefined) {
          map[absKey] = lc.color;
        }
      });
    });

    return map;
  }, [pieces, board]);

  const newGame = useCallback(() => {
    const puzzle = generatePuzzle();
    setNextBlockers(puzzle.blockers);
    setShowDiceAnimation(true);
    setBoard(applyStarBlockers(puzzle.blockers));

    const piecesWithColors = STAR_PIECES.map((p) => {
      const placement = puzzle.solution?.find((pl) => pl.id === p.id);
      const normalizedCells = normalizeTris(p.cells);

      if (placement) {
        const placementSet = new Set(placement.tris.map(triKey));
        const orientations = allTriOrientations(p.cells);

        let orient: Tri[] | undefined;
        let dq = 0;
        let dr = 0;
        for (const candidate of orientations) {
          for (const localCell of candidate) {
            for (const absCell of placement.tris) {
              const testDq = absCell.q - localCell.q;
              const testDr = absCell.r - localCell.r;
              const matches = candidate.every((lc) => {
                const absKey = triKey({ q: lc.q + testDq, r: lc.r + testDr, d: lc.d });
                return placementSet.has(absKey);
              });
              if (matches) {
                orient = candidate;
                dq = testDq;
                dr = testDr;
                break;
              }
            }
            if (orient) break;
          }
          if (orient) break;
        }

        if (orient) {
          const colorMap = new Map<string, string>();
          placement.tris.forEach((absTri) => {
            const index = IDX_BY_KEY.get(triKey(absTri));
            if (index !== undefined) {
              colorMap.set(triKey(absTri), getCellColor(index));
            }
          });

          const cellsWithColors = orient.map((t) => {
            const absTri = { q: t.q + dq, r: t.r + dr, d: t.d };
            const color = colorMap.get(triKey(absTri));
            return { ...t, color };
          });

          // Scramble the starting orientation (random rotations + optional flip)
          // so pieces don't ship pre-aligned to the solution. Colors are attached
          // to each triangle and travel through rotateTri/flipTri, so the flag
          // palette on every piece is preserved.
          const rotations = Math.floor(Math.random() * 6);
          const doFlip = Math.random() < 0.5;
          let cells = cellsWithColors;
          for (let i = 0; i < rotations; i++) cells = cells.map(rotateTri);
          if (doFlip) cells = cells.map(flipTri);
          cells = normalizeTris(cells);

          return {
            id: p.id,
            name: p.name,
            color: cells[0]?.color,
            cells: cells,
          };
        }
      }

      return { id: p.id, name: p.name, color: p.color, cells: normalizedCells };
    });

    setPieces(piecesWithColors);
    setSelectedId(null);
    setHoverTri(null);
    setWon(false);
    setSolution(puzzle.solution);
    setShowSolution(false);
    setHintUsed(false);
    setHelped(false);
    setHasRotated(false);
    setHasFlipped(false);
    setSeconds(0);
  }, [setSeconds]);

  const handleDiceAnimationComplete = useCallback(() => {
    setShowDiceAnimation(false);
    setBlockers(nextBlockers);
  }, [nextBlockers]);

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
    <div className="ts-scope min-h-screen relative">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-32 pt-4">
        <header className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <TaberStarLogo className="h-24" />
            
          </div>
          <button
            onClick={handleShowTutorial}
            className="mt-3 cursor-pointer text-xs text-ts-ink-soft underline decoration-dotted decoration-ts-olive transition-colors hover:text-ts-olive-deep"
          >
            {t("tutorial.showAgain")}
          </button>
        </header>

        {showSolution && <div className="ts-solution-banner my-4">{t("game.solutionShown")}</div>}

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
              className={`ts-board-frame relative transition-all ${
                showTutorial && highlightedElement === "board" ? "z-50" : ""
              }`}
              data-highlight={showTutorial && highlightedElement === "board" ? "board" : undefined}
              style={{
                background: "linear-gradient(135deg, oklch(0.96 0.02 90), oklch(0.88 0.04 70))",
              }}
            >
              {showDiceAnimation && (
                <DiceRollAnimation
                  blockers={nextBlockers}
                  onComplete={handleDiceAnimationComplete}
                  boardContainerRef={boardContainerRef}
                />
              )}
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
                    ? getCellColor(i)
                    : pieceHere
                      ? placedPieceColorsMap[key] || pieceHere.color
                      : inPreview
                        ? previewValid
                          ? "rgba(92, 107, 58, 0.35)"
                          : "rgba(181, 83, 42, 0.35)"
                        : "oklch(0.72 0.02 240)";

                  return (
                    <polygon
                      key={key}
                      data-tri={key}
                      points={triVerts(tri)
                        .map(([x, y]) => `${x},${y}`)
                        .join(" ")}
                      fill={fill}
                      stroke={pieceHere ? "rgba(242, 230, 206, 0.85)" : "oklch(0.75 0.03 70)"}
                      strokeWidth={pieceHere ? 0.08 : 0.06}
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
              className={`ts-tray transition-all ${
                showTutorial && highlightedElement === "tray" ? "relative z-50" : ""
              }`}
              data-highlight={showTutorial && highlightedElement === "tray" ? "tray" : undefined}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-ts-ink-soft">
                  {t("game.pieces")} ({trayPieces.length}/{pieces.length})
                </span>
                {selected ? (
                  <span className="text-sm font-semibold" style={{ color: selected.color }}>
                    {selected.name}
                  </span>
                ) : (
                  <span className="text-xs text-ts-ink-soft">{t("game.pickPiece")}</span>
                )}
                <div
                  ref={actionsContainerRef}
                  className="ml-auto flex items-center gap-2"
                >
                  <button
                    onClick={rotateSelected}
                    disabled={!selected}
                    aria-label={t("game.rotate")}
                    title={t("game.rotate")}
                    className="ts-icon-btn"
                    data-highlight={
                      showTutorial && highlightedElement === "actions" ? "actions" : undefined
                    }
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={flipSelected}
                    disabled={!selected}
                    aria-label={t("game.flip")}
                    title={t("game.flip")}
                    className="ts-icon-btn"
                    data-highlight={
                      showTutorial && highlightedElement === "actions" ? "actions" : undefined
                    }
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
                      className={`ts-piece-btn p-1 ${isTargetTutorialPiece ? "relative z-50" : ""}`}
                      data-selected={isSel || undefined}
                      data-highlight={isTargetTutorialPiece ? "piece" : undefined}
                    >
                      <TriShape cells={p.cells} color={p.color} cellSize={11} />
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-ts-ink-soft">{t("game.hint")}</p>
            </div>
          </div>
        </div>
      </main>

      <GameNav borderClass="border-[#3B4624]/40">
        <GameNavBackLink to="/$lang/the-tabers-star" />
        <GameNavTimer seconds={seconds} />
        <GameNavButton
          onClick={giveHint}
          disabled={hintUsed || !solution || won}
          colorClass=""
          dataNav="hint"
          icon={<Lightbulb className="h-5 w-5" />}
          label={hintUsed ? t("game.hintUsed") : t("game.hintBtn")}
        />
        <GameNavButton
          onClick={() => {
            setShowSolution((v) => !v);
            setHelped(true);
          }}
          disabled={!solution}
          colorClass=""
          dataNav="solution"
          icon={showSolution ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          label={showSolution ? t("game.hideSolution") : t("game.solution")}
        />
        <GameNavButton
          onClick={newGame}
          colorClass=""
          dataNav="new"
          icon={<RefreshCw className="h-5 w-5" />}
          label={t("game.new")}
        />
      </GameNav>

      <Mascot className="ts-mascot ts-mascot--play" />

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

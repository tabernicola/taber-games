import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock, HelpCircle, Lock, RotateCcw, UserRound, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { formatTime } from "@/platform/scores/formatTime";
import type { Character } from "@/platform/characters/characters";
import { isTaberdokuSolved, taberdokuConflicts, type TaberdokuPuzzle } from "../logic/taberdoku";
import { TaberdokuRules } from "./TaberdokuRules";
import { TaberdokuTutorial } from "./TaberdokuTutorial";
import { TaberdokuLevelSelector } from "./TaberdokuLevelSelector";
import "@/games/tabers-taberdoku/light-theme.css";

function spritePathFor(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.replace(/\.png$/, "-sprite.png");
}

const ROOM_COLORS = [
  "#fde68a",
  "#bfdbfe",
  "#fecaca",
  "#bbf7d0",
  "#ddd6fe",
  "#fed7aa",
  "#a5f3fc",
  "#f9a8d4",
  "#e5e7eb",
];

function SpriteAnimation({ src, frameDuration = 160 }: { src: string; frameDuration?: number }) {
  const rows = 1;
  const cols = 6;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalFrames = cols * rows;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = src;
    let loaded = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);

    let frame = 0;
    let lastTime = 0;
    let animId: number;

    const animate = (time: number) => {
      if (time - lastTime >= frameDuration && loaded) {
        frame = (frame + 1) % totalFrames;
        lastTime = time;
      }
      if (loaded && canvas.width > 0 && canvas.height > 0 && img.complete) {
        const cols = img.width / img.height;
        const frameWidth = img.width / cols;
        const frameHeight = img.height / rows;
        const col = frame % cols;
        const row = Math.floor(frame / cols);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img,
          col * frameWidth,
          row * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
      animId = requestAnimationFrame(animate);
    };

    img.onload = () => {
      loaded = true;
      resize();
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [src, cols, rows, frameDuration, totalFrames]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function TaberdokuBoard({
  puzzle,
  characters,
  onSolve,
  level,
  board,
  progress,
  totalLevels,
  boardsPerLevel,
  completedBoards,
  tutorialOpen,
  onTutorialClose,
  onHelpClick,
  levelSelectorOpen,
  onLevelSelectorClose,
  onLevelSelect,
  onOpenLevelSelector,
  totalScore,
}: {
  puzzle: TaberdokuPuzzle;
  characters: Character[];
  onSolve: (time: string, unusedHearts: number) => void;
  level: number;
  board: number;
  progress: number;
  totalLevels: number;
  boardsPerLevel: number;
  completedBoards: Set<number>;
  tutorialOpen?: boolean;
  onTutorialClose?: () => void;
  onHelpClick?: () => void;
  levelSelectorOpen?: boolean;
  onLevelSelectorClose?: () => void;
  onLevelSelect?: (board: number) => void;
  onOpenLevelSelector?: () => void;
  totalScore?: number;
}) {
  const { t, slug } = useI18n();
  const { playSound } = useSoundEffects();
  const navigate = useNavigate();
  const size = puzzle.size;
  const cast = useMemo(() => characters.slice(0, size), [characters, size]);

  // Map each character to their correct cell and room color
  const charInfo = useMemo(() => {
    return cast.map((char, i) => {
      const correctCell = puzzle.solution[i];
      const roomIndex = puzzle.rooms[correctCell];
      return {
        char,
        correctCell,
        roomColor: ROOM_COLORS[roomIndex % ROOM_COLORS.length],
      };
    });
  }, [cast, puzzle.solution, puzzle.rooms]);

  // Legend avatars are sized from the cast length so the row always fills the
  // board width: 384/count matches 80% of a board cell on a 480px board, and the
  // 100% fallback keeps them inside the tile on narrower screens. The divisor
  // never drops below 6 (the smallest puzzle) so short casts stay readable.
  const legendAvatarWidth = `min(${Math.round(384 / Math.max(cast.length, 6))}px, 100%)`;

  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    const cellToCharacterIndex = new Map<number, number>();
    puzzle.solution.forEach((cell, characterIndex) => {
      cellToCharacterIndex.set(cell, characterIndex);
    });

    puzzle.givens.forEach((cell) => {
      const characterIndex = cellToCharacterIndex.get(cell);
      const info = characterIndex === undefined ? undefined : charInfo[characterIndex];
      if (info) map[info.char.id] = cell;
    });
    return map;
  }, [puzzle.givens, puzzle.solution, charInfo]);

  const [placements, setPlacements] = useState<Record<string, number>>(initial);
  const [crosses, setCrosses] = useState<Set<number>>(new Set());
  const [errorCells, setErrorCells] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState(0);
  const [lastErrorCell, setLastErrorCell] = useState<number | null>(null);
  const lives = 3 - errors;
  const gameOver = errors >= 3;
  // Mouse, touch and pen all run through the same pointer gesture, so the
  // board behaves identically no matter which device drives it.
  const DOUBLE_TAP_MS = 300;
  // Keyboard activation has no real pointer id; any value that can never
  // collide with a pointer id works.
  const KEYBOARD_POINTER_ID = -1;
  const boardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<{
    pointerId: number;
    startCell: number;
    lastCell: number;
    targetCross: boolean;
    moved: boolean;
  } | null>(null);
  const lastTapRef = useRef<{ cell: number; time: number } | null>(null);
  // Latest pointer position plus its frame handle, so a drag hit-tests at most
  // once per frame instead of on every pointermove event.
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null);
  const moveFrameRef = useRef<number | null>(null);
  // A drag paints several cells in a single gesture, so `crosses` must be read
  // and written through a ref: React state can still be stale when the next
  // pointermove arrives.
  const crossesRef = useRef(crosses);

  const occupied = useMemo(() => Object.values(placements), [placements]);
  const solved = isTaberdokuSolved(puzzle, occupied);
  const { seconds } = useTimer(!solved);
  // Bumped every time the session score grows, so the star block remounts and
  // replays its animation. A boolean would stay true after the first award.
  const [scorePulse, setScorePulse] = useState(0);
  const prevTotalScoreRef = useRef(totalScore);
  useEffect(() => {
    const previous = prevTotalScoreRef.current;
    prevTotalScoreRef.current = totalScore;
    if (previous === undefined || totalScore === undefined) return;
    if (totalScore > previous) setScorePulse((pulse) => pulse + 1);
  }, [totalScore]);
  // The win sound and the solve callback must fire exactly once per solved board.
  // Without this guard the effect re-runs whenever onSolve changes identity
  // (every parent render), replaying the sound and re-reporting the solve.
  const solveHandledRef = useRef(false);
  const solveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSolveRef = useRef(onSolve);
  useEffect(() => {
    onSolveRef.current = onSolve;
  }, [onSolve]);

  useEffect(() => {
    if (!solved) {
      solveHandledRef.current = false;
      return;
    }
    if (solveHandledRef.current) return;
    solveHandledRef.current = true;
    playSound("win");
    const time = formatTime(seconds);
    const unusedHearts = lives;
    solveTimerRef.current = setTimeout(() => {
      onSolveRef.current(time, unusedHearts);
    }, 500);
  }, [playSound, solved, seconds, lives]);

  // Only cancel a pending solve callback when the board unmounts, never on
  // effect re-runs (that would swallow the completion entirely).
  useEffect(
    () => () => {
      if (solveTimerRef.current) {
        clearTimeout(solveTimerRef.current);
        solveTimerRef.current = null;
      }
    },
    [],
  );

  const conflicts = useMemo(() => taberdokuConflicts(puzzle, occupied), [puzzle, occupied]);

  const charAt = useCallback(
    (cell: number) => {
      return charInfo.find((c) => placements[c.char.id] === cell) ?? undefined;
    },
    [charInfo, placements],
  );

  const isGiven = useCallback((cell: number) => puzzle.givens.includes(cell), [puzzle.givens]);

  // Every mutation of `crosses` goes through here so `crossesRef` can never
  // drift from the state a drag is painting against.
  const commitCrosses = useCallback((updater: (prev: Set<number>) => Set<number>) => {
    const next = updater(crossesRef.current);
    crossesRef.current = next;
    setCrosses(next);
  }, []);

  // The pointer listeners live on `window` and are subscribed once, so the
  // gesture handlers read the live board state from a ref instead of closing
  // over values that go stale while a drag is in flight.
  const boardStateRef = useRef({ solved, gameOver, errorCells, charAt, isGiven });
  useEffect(() => {
    boardStateRef.current = { solved, gameOver, errorCells, charAt, isGiven };
  }, [solved, gameOver, errorCells, charAt, isGiven]);

  const applyCross = useCallback(
    (cell: number, shouldMark: boolean) => {
      const state = boardStateRef.current;
      if (state.solved || state.gameOver) return;
      if (state.isGiven(cell)) return;
      if (state.errorCells.has(cell)) return;
      if (state.charAt(cell)) return;
      if (crossesRef.current.has(cell) === shouldMark) return;

      commitCrosses((prev) => {
        const next = new Set(prev);
        if (shouldMark) {
          next.add(cell);
          playSound("click");
        } else {
          next.delete(cell);
          playSound("roll");
        }
        return next;
      });
    },
    [commitCrosses, playSound],
  );

  const handleCellDoubleClick = useCallback(
    (cell: number) => {
      if (solved) return;
      if (gameOver) return;
      if (isGiven(cell)) return;
      if (errorCells.has(cell)) return;

      const charForCell = charInfo.find((c) => c.correctCell === cell);
      if (!charForCell) {
        setErrors((e) => e + 1);
        playSound("error");
        setErrorCells((prev) => {
          const next = new Set(prev);
          next.add(cell);
          return next;
        });
        commitCrosses((prev) => {
          const next = new Set(prev);
          next.delete(cell);
          return next;
        });
        setLastErrorCell(cell);
        setTimeout(() => setLastErrorCell(null), 800);
        return;
      }

      const currentCell = placements[charForCell.char.id];
      if (currentCell === cell) return;
      if (currentCell !== undefined) {
        setPlacements((prev) => {
          const next = { ...prev };
          next[charForCell.char.id] = cell;
          return next;
        });
        playSound("place");
        commitCrosses((prev) => {
          const next = new Set(prev);
          next.delete(cell);
          next.delete(currentCell);
          return next;
        });
        return;
      }

      setPlacements((prev) => ({ ...prev, [charForCell.char.id]: cell }));

      playSound("place");
      commitCrosses((prev) => {
        const next = new Set(prev);
        next.delete(cell);
        return next;
      });
    },
    [charInfo, commitCrosses, errorCells, gameOver, isGiven, placements, playSound, solved],
  );

  // The pointerup handler lives on `window` and would otherwise capture a stale
  // double-click handler, so keep a ref to the current one.
  const doubleClickRef = useRef(handleCellDoubleClick);
  useEffect(() => {
    doubleClickRef.current = handleCellDoubleClick;
  }, [handleCellDoubleClick]);

  /** Cell under a viewport point, or null when the point is outside the grid. */
  const cellFromPoint = useCallback((clientX: number, clientY: number) => {
    const cellEl = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLButtonElement>("button[data-cell]");
    if (!cellEl || !boardRef.current?.contains(cellEl)) return null;
    const cell = Number(cellEl.dataset.cell);
    return Number.isNaN(cell) ? null : cell;
  }, []);

  /** Opens a paint gesture on a cell and toggles its X right away. */
  const startGesture = useCallback(
    (cell: number, pointerId: number) => {
      const targetCross = !crossesRef.current.has(cell);
      gestureRef.current = {
        pointerId,
        startCell: cell,
        lastCell: cell,
        targetCross,
        moved: false,
      };
      applyCross(cell, targetCross);
    },
    [applyCross],
  );

  /** Resolves a completed gesture as a single or double tap. */
  const finishGesture = useCallback(() => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture || gesture.moved) return;

    const now = Date.now();
    const previous = lastTapRef.current;
    if (previous && previous.cell === gesture.startCell && now - previous.time < DOUBLE_TAP_MS) {
      lastTapRef.current = null;
      doubleClickRef.current(gesture.startCell);
      return;
    }
    lastTapRef.current = { cell: gesture.startCell, time: now };
  }, []);

  const handlePointerDown = (cell: number, event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startGesture(cell, event.pointerId);
  };

  /** Ends the gesture started by a pointer, if that pointer is the active one. */
  const finishPointerGesture = useCallback(
    (event: PointerEvent) => {
      if (gestureRef.current?.pointerId !== event.pointerId) return;
      finishGesture();
    },
    [finishGesture],
  );

  const cancelGesture = useCallback(() => {
    gestureRef.current = null;
    pendingPointRef.current = null;
    if (moveFrameRef.current !== null) {
      cancelAnimationFrame(moveFrameRef.current);
      moveFrameRef.current = null;
    }
  }, []);

  // One gesture for every device: press a cell to toggle its X immediately,
  // drag to paint the same state across cells, double tap to place a character.
  useEffect(() => {
    const paintLatestPoint = () => {
      moveFrameRef.current = null;
      const point = pendingPointRef.current;
      const gesture = gestureRef.current;
      pendingPointRef.current = null;
      if (!point || !gesture) return;

      const cell = cellFromPoint(point.x, point.y);
      if (cell === null || cell === gesture.lastCell) return;

      gesture.moved = true;
      applyCross(cell, gesture.targetCross);
      gesture.lastCell = cell;
    };

    const onMove = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture) return;
      // A release delivered outside the window never reaches `pointerup`, so
      // drop the gesture as soon as no button is held. Without this, plain
      // hover would keep painting X marks.
      if (event.buttons === 0) {
        cancelGesture();
        return;
      }
      // Ignore other pointers (second finger, stray touch) so they cannot
      // hijack or prematurely end the active gesture.
      if (event.pointerId !== gesture.pointerId) return;

      pendingPointRef.current = { x: event.clientX, y: event.clientY };
      if (moveFrameRef.current === null) {
        moveFrameRef.current = requestAnimationFrame(paintLatestPoint);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finishPointerGesture);
    window.addEventListener("pointercancel", cancelGesture);
    window.addEventListener("blur", cancelGesture);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finishPointerGesture);
      window.removeEventListener("pointercancel", cancelGesture);
      window.removeEventListener("blur", cancelGesture);
      cancelGesture();
    };
  }, [applyCross, cancelGesture, cellFromPoint, finishPointerGesture]);

  const reset = () => {
    playSound("click");
    setPlacements(initial);
    commitCrosses(() => new Set());
    setErrorCells(new Set());
    setErrors(0);
    setLastErrorCell(null);
  };

  return (
    <div className="tabers-taberdoku-light relative min-h-screen">
      <header className="sticky top-0 z-30 flex flex-nowrap items-center gap-2 border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            void navigate({ to: "/$lang/tabers-taberdoku", params: { lang: slug } });
          }}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold tracking-widest text-primary sm:text-base">
          {t("taberdoku.title")}
        </h1>
        {onHelpClick && (
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onHelpClick();
            }}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("taberdoku.tutorial.title")}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        )}
      </header>

      <main className="taberdoku-play relative z-10 px-2 pb-28 pt-6">
        {solved && (
          <p className="mb-3 text-center text-lg font-bold text-primary">
            {t("taberdoku.solvedIn", { time: formatTime(seconds) })}
          </p>
        )}

        {gameOver && (
          <div className="taberdoku-status mx-auto mb-3 rounded-xl bg-destructive/10 border border-destructive/40 px-4 py-3 text-center">
            <p className="text-sm font-bold text-destructive">{t("taberdoku.gameOver")}</p>
            <p className="text-xs text-destructive/70 mt-0.5">{t("taberdoku.restartLevel")}</p>
          </div>
        )}

        {/* Score + level badge + lives */}
        <div className="taberdoku-status mx-auto mb-3 flex items-center gap-2">
          {totalScore !== undefined ? (
            <div
              key={scorePulse}
              className={`flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 text-primary ${
                scorePulse > 0 ? "taberdoku-score-pulse" : ""
              }`}
            >
              <span className="text-sm leading-none">⭐</span>
              <span className="text-sm font-bold tabular-nums">{totalScore}</span>
            </div>
          ) : (
            <span className="h-10 shrink-0" />
          )}
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-full border border-border bg-primary/15 px-4 py-1.5">
            <span
              className="absolute inset-y-0 left-0 bg-primary/35 transition-all"
              style={{ width: `${progress}%` }}
            />
            <span className="relative block truncate text-center text-base font-extrabold tracking-wide text-primary">
              {t("taberdoku.level", { current: level })}
            </span>
          </div>
          <div className="flex shrink-0 gap-0.5 text-base">
            {[0, 1, 2].map((i) => (
              <span key={i}>{i < lives ? "❤️" : "💔"}</span>
            ))}
          </div>
        </div>

        {/* Character legend: silhouettes until the character is found on the board. The tiles
            share the board width, so the avatar shrinks as characters are added. */}
        <div className="taberdoku-status mx-auto mb-3 flex flex-nowrap items-stretch gap-1 py-0.5 sm:gap-1.5">
          {charInfo.map(({ char }) => {
            const isFound = placements[char.id] !== undefined;
            return (
              <div
                key={char.id}
                className={`flex min-w-0 flex-1 items-center justify-center rounded-lg border px-1 py-1 text-[10px] transition-all ${
                  isFound ? "border-primary/60 bg-primary/10" : "border-border bg-muted"
                }`}
              >
                <span
                  className="relative aspect-square items-center justify-center overflow-hidden rounded-full"
                  style={{ width: legendAvatarWidth }}
                >
                  {isFound ? (
                    char.image ? (
                      <img
                        src={char.image}
                        alt={char.name}
                        className="h-full w-full rounded-full object-cover object-top"
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{ background: ROOM_COLORS[char.id.length % ROOM_COLORS.length] }}
                      >
                        {char.name.slice(0, 2)}
                      </span>
                    )
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-300">
                      <UserRound className="h-1/2 w-1/2 text-slate-500" aria-hidden="true" />
                    </span>
                  )}
                  {isFound && (
                    <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[7px]">
                      ✓
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div
          ref={boardRef}
          className="taberdoku-board mx-auto mb-3 grid touch-none select-none overflow-hidden rounded-xl border-2 border-slate-700"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: size * size }, (_, cell) => {
            const charInfo_cell = charAt(cell);
            const spritePath = spritePathFor(charInfo_cell?.char.image);
            const given = isGiven(cell);
            const bad = conflicts.has(cell);
            const hasError = errorCells.has(cell);
            const hasCross = crosses.has(cell) && !hasError;
            const isErrorCell = lastErrorCell === cell;
            const roomColor = ROOM_COLORS[puzzle.rooms[cell] % ROOM_COLORS.length];

            return (
              <button
                key={cell}
                type="button"
                data-cell={cell}
                onPointerDown={(event) => handlePointerDown(cell, event)}
                // Enter/Space on a focused cell still has to work. Pointer
                // gestures fire `click` with detail > 0, so only keyboard
                // activation (detail === 0) reaches this handler.
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  startGesture(cell, KEYBOARD_POINTER_ID);
                  finishGesture();
                }}
                className={`relative aspect-square border border-slate-400/70 ${
                  bad ? "ring-2 ring-inset ring-rose-500" : ""
                } ${isErrorCell ? "ring-2 ring-inset ring-red-800 animate-pulse" : ""}`}
                style={{ background: roomColor }}
                aria-label={`${Math.floor(cell / size) + 1},${(cell % size) + 1}`}
              >
                {charInfo_cell && (
                  <>
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: charInfo_cell.roomColor }}
                    >
                      {spritePath ? (
                        <SpriteAnimation src={spritePath} />
                      ) : charInfo_cell.char.image ? (
                        <img
                          src={charInfo_cell.char.image}
                          alt={charInfo_cell.char.name}
                          draggable={false}
                          className={`h-full w-full object-cover object-top ${given ? "" : "opacity-95"}`}
                        />
                      ) : (
                        <span className="text-xs font-bold">
                          {charInfo_cell.char.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    {given && (
                      <span className="absolute top-1 right-1 text-[8px] font-bold text-slate-600 bg-white/80 rounded px-0.5">
                        ✓
                      </span>
                    )}
                  </>
                )}

                {hasError && (
                  <X className="absolute inset-0 mx-auto my-auto h-3/4 w-3/4 text-red-950 stroke-[3] pointer-events-none" />
                )}
                {hasCross && !charInfo_cell && (
                  <X className="absolute inset-0 mx-auto my-auto h-3/4 w-3/4 text-destructive/70 stroke-2 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        <p className="taberdoku-status mx-auto mb-3 text-center text-xs text-muted-foreground">
          {t("taberdoku.clickHint")}
        </p>

        <TaberdokuRules characters={cast} />

        {levelSelectorOpen && onLevelSelectorClose && onLevelSelect && onOpenLevelSelector && (
          <TaberdokuLevelSelector
            open={levelSelectorOpen}
            currentLevel={level}
            totalLevels={totalLevels}
            completedBoards={completedBoards}
            characters={characters}
            onSelect={onLevelSelect}
            onClose={onLevelSelectorClose}
          />
        )}
      </main>

      {tutorialOpen && onTutorialClose && (
        <TaberdokuTutorial open={tutorialOpen} characters={characters} onClose={onTutorialClose} />
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div
          className={`mx-auto flex max-w-md items-center gap-2 px-3 py-2 ${
            totalScore !== undefined ? "justify-between" : "justify-center"
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="tabular-nums">{formatTime(seconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound("click");
              onOpenLevelSelector?.();
            }}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("taberdoku.levels")}
          >
            <Lock className="h-5 w-5" />
            {t("taberdoku.levels")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5" />
            {t("taberdoku.reset")}
          </button>
        </div>
      </nav>
    </div>
  );
}

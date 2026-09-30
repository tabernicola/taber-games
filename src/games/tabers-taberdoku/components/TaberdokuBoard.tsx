import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock, HelpCircle, Lock, RotateCcw, TrendingUp, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { formatTime } from "@/platform/scores/formatTime";
import type { MurdokuCharacter } from "../logic/characters";
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
  characters: MurdokuCharacter[];
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
  const clickTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const touchStartCell = useRef<number | null>(null);
  const touchCell = useRef<number | null>(null);
  const touchStartCellHasCross = useRef(false);
  const touchMoved = useRef(false);
  const lastTouchEndTime = useRef(0);

  useEffect(
    () => () => {
      clickTimers.current.forEach((timer) => clearTimeout(timer));
      clickTimers.current.clear();
    },
    [],
  );

  const occupied = useMemo(() => Object.values(placements), [placements]);
  const solved = isTaberdokuSolved(puzzle, occupied);
  const { seconds } = useTimer(!solved);
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

  const isGiven = (cell: number) => puzzle.givens.includes(cell);

  const handleCellClick = (cell: number) => {
    if (solved) return;
    if (gameOver) return;
    if (isGiven(cell)) return;
    if (errorCells.has(cell)) return;

    const shouldAddCross = !crosses.has(cell);
    setCrosses((prev) => {
      const next = new Set(prev);
      if (shouldAddCross) {
        next.add(cell);
        playSound("click");
      } else {
        next.delete(cell);
        playSound("roll");
      }
      return next;
    });
  };

  const handleCellDoubleClick = (cell: number) => {
    console.log("double click on cell", cell);
    if (solved) return;
    if (gameOver) return;
    if (isGiven(cell)) return;
    if (errorCells.has(cell)) return;

    const existing = charAt(cell);
    console.log("looking for char for cell", cell, charInfo);
    const charForCell = charInfo.find((c) => c.correctCell === cell);
    console.log("char for cell", cell, charForCell);
    if (!charForCell) {
      setErrors((e) => e + 1);
      playSound("error");
      setErrorCells((prev) => {
        const next = new Set(prev);
        next.add(cell);
        return next;
      });
      setCrosses((prev) => {
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
      setCrosses((prev) => {
        const next = new Set(prev);
        next.delete(cell);
        next.delete(currentCell);
        return next;
      });
      return;
    }

    setPlacements((prev) => ({ ...prev, [charForCell.char.id]: cell }));

    playSound("place");
    setCrosses((prev) => {
      const next = new Set(prev);
      next.delete(cell);
      return next;
    });
  };

  const scheduleSingleClick = (cell: number) => {
    const existingTimer = clickTimers.current.get(cell);
    if (existingTimer) {
      clearTimeout(existingTimer);
      clickTimers.current.delete(cell);
      return;
    }

    const timer = setTimeout(() => {
      clickTimers.current.delete(cell);
      handleCellClick(cell);
    }, 50);
    clickTimers.current.set(cell, timer);
  };

  const handleMouseClick = (cell: number) => {
    if (Date.now() - lastTouchEndTime.current < 500) {
      lastTouchEndTime.current = 0;
      return;
    }

    scheduleSingleClick(cell);
  };

  const setCrossForTouch = (cell: number, shouldMark: boolean) => {
    if (solved || isGiven(cell) || errorCells.has(cell) || charAt(cell)) return;
    if (crosses.has(cell) === shouldMark) return;

    setCrosses((prev) => {
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
  };

  const handleTouchStart = (cell: number) => {
    touchStartCell.current = cell;
    touchCell.current = cell;
    touchStartCellHasCross.current = crosses.has(cell);
    touchMoved.current = false;
    setCrossForTouch(cell, !touchStartCellHasCross.current);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLButtonElement>) => {
    if (touchStartCell.current === null) return;

    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return;

    const currentCellButton = document
      .elementFromPoint(touch.clientX, touch.clientY)
      ?.closest<HTMLButtonElement>("button[data-cell]");
    if (!currentCellButton) return;

    const currentCell = Number(currentCellButton.dataset.cell);
    if (Number.isNaN(currentCell) || currentCell === touchCell.current) return;

    touchMoved.current = true;
    setCrossForTouch(currentCell, !touchStartCellHasCross.current);
    touchCell.current = currentCell;
  };

  const handleTouchEnd = (cell: number) => {
    const startCell = touchStartCell.current;
    const wasTap = startCell === cell && !touchMoved.current;
    const currentTime = Date.now();

    if (wasTap && currentTime - lastTouchEndTime.current < 300) {
      console.log("double tap detected");
      touchStartCell.current = null;
      touchMoved.current = false;
      lastTouchEndTime.current = currentTime;
      handleCellDoubleClick(cell);
      return;
    }

    lastTouchEndTime.current = currentTime;
    touchStartCell.current = null;
    touchMoved.current = false;

    if (wasTap) {
      //handleCellClick(cell);
    } else if (startCell !== null) {
      setCrossForTouch(startCell, !touchStartCellHasCross.current);
    }
  };

  const handleTouchCancel = () => {
    touchStartCell.current = null;
    touchMoved.current = false;
  };

  const reset = () => {
    playSound("click");
    setPlacements(initial);
    setCrosses(new Set());
    setErrorCells(new Set());
    setErrors(0);
    setLastErrorCell(null);
  };

  return (
    <div className="tabers-taberdoku-light min-h-screen">
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
          {t("taberdoku.title")} · {t("taberdoku.levelOf", { current: level, total: totalLevels })}
        </h1>
        <div className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm font-semibold text-muted-foreground sm:gap-4">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="tabular-nums">{progress}%</span>
          </span>

          <div className="w-20 sm:w-24">
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
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

      <main className="px-2 pb-32 pt-4">
        {solved && (
          <p className="mb-3 text-center text-lg font-bold text-primary">
            {t("taberdoku.solvedIn", { time: formatTime(seconds) })}
          </p>
        )}

        {/* Character legend + lives */}
        <div className="mx-auto mb-3 flex max-w-[480px] items-center justify-between gap-2">
          <div className="flex flex-nowrap gap-1 overflow-x-auto py-0.5 sm:gap-1.5">
            {charInfo.map(({ char, roomColor }) => {
              const isPlaced = placements[char.id] !== undefined;
              const isGivenChar = puzzle.givens.includes(placements[char.id] ?? -1);
              return (
                <div
                  key={char.id}
                  className={`flex items-center justify-center rounded-lg border border-border px-1.5 py-1 text-[10px] transition-all ${
                    isPlaced ? "opacity-60 border-primary/50" : "opacity-100"
                  }`}
                  style={{ background: roomColor }}
                >
                  <span
                    className="flex h-[24px] w-[24px] items-center justify-center rounded-full text-[8px] font-bold text-white relative"
                    style={{ background: roomColor }}
                  >
                    {char.image ? (
                      <img
                        src={char.image}
                        alt={char.name}
                        className="h-full w-full rounded-full object-cover object-top"
                      />
                    ) : (
                      char.name.slice(0, 2)
                    )}
                    {isPlaced && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[6px]">
                        ✓
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5 text-base">
            {[0, 1, 2].map((i) => (
              <span key={i}>{i < lives ? "❤️" : "💔"}</span>
            ))}
          </div>
        </div>

        {gameOver && (
          <div className="mx-auto mb-3 max-w-[480px] rounded-xl bg-destructive/10 border border-destructive/40 px-4 py-3 text-center">
            <p className="text-sm font-bold text-destructive">{t("taberdoku.gameOver")}</p>
            <p className="text-xs text-destructive/70 mt-0.5">{t("taberdoku.restartLevel")}</p>
          </div>
        )}

        <div
          className="mx-auto mb-3 grid max-w-[480px] overflow-hidden rounded-xl border-2 border-slate-700"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
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

            const onClick = () => handleMouseClick(cell);
            const onDoubleClick = () => handleCellDoubleClick(cell);
            const onTouchStart = () => handleTouchStart(cell);
            const onTouchMove = (event: React.TouchEvent<HTMLButtonElement>) =>
              handleTouchMove(event);
            const onTouchEnd = () => handleTouchEnd(cell);

            return (
              <button
                key={cell}
                type="button"
                data-cell={cell}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={handleTouchCancel}
                className={`relative aspect-square border border-slate-400/70 touch-none ${
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

        <p className="mx-auto mb-3 max-w-[480px] text-center text-xs text-muted-foreground">
          {t("taberdoku.doubleClick")}
        </p>

        <TaberdokuRules characters={cast} />

        {levelSelectorOpen && onLevelSelectorClose && onLevelSelect && onOpenLevelSelector && (
          <TaberdokuLevelSelector
            open={levelSelectorOpen}
            currentLevel={level}
            totalLevels={totalLevels}
            completedBoards={completedBoards}
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

          {totalScore !== undefined && (
            <div className="flex flex-col items-center gap-1 text-[10px] font-semibold text-primary">
              <span className="text-base leading-none">⭐</span>
              <span className="tabular-nums">{totalScore}</span>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock, RotateCcw, X } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { formatTime } from "@/platform/scores/formatTime";
import type { MurdokuCharacter } from "../logic/characters";
import { isTaberdokuSolved, taberdokuConflicts, type TaberdokuPuzzle } from "../logic/taberdoku";
import "@/games/tabers-taberdoku/light-theme.css";

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

export function TaberdokuBoard({
  puzzle,
  characters,
  onNewBoard,
}: {
  puzzle: TaberdokuPuzzle;
  characters: MurdokuCharacter[];
  onNewBoard: () => void;
}) {
  const { t, slug } = useI18n();
  const navigate = useNavigate();
  const size = puzzle.size;
  const characterColumns = size === 6 ? 3 : size <= 8 ? 4 : 5;
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
  const solved = errorCells.size === 0 && isTaberdokuSolved(puzzle, occupied);
  const { seconds } = useTimer(!solved);
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
    if (isGiven(cell)) return;
    if (errorCells.has(cell)) return;

    setCrosses((prev) => {
      const next = new Set(prev);
      if (next.has(cell)) {
        next.delete(cell);
      } else {
        next.add(cell);
      }
      return next;
    });
  };

  const handleCellDoubleClick = (cell: number) => {
    if (solved) return;
    if (isGiven(cell)) return;
    if (errorCells.has(cell)) return;

    const existing = charAt(cell);
    if (existing) return;

    const charForCell = charInfo.find((c) => c.correctCell === cell);
    if (!charForCell) {
      setErrors((e) => e + 1);
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
    if (currentCell !== undefined) {
      if (currentCell === cell) return;
      setPlacements((prev) => {
        const next = { ...prev };
        next[charForCell.char.id] = cell;
        return next;
      });
      setCrosses((prev) => {
        const next = new Set(prev);
        next.delete(cell);
        next.delete(currentCell);
        return next;
      });
      return;
    }

    setPlacements((prev) => ({ ...prev, [charForCell.char.id]: cell }));
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
    }, 500);
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

    setCrosses((prev) => {
      const next = new Set(prev);
      if (shouldMark) {
        next.add(cell);
      } else {
        next.delete(cell);
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
    setPlacements(initial);
    setCrosses(new Set());
    setErrorCells(new Set());
    setErrors(0);
    setLastErrorCell(null);
  };

  return (
    <div className="tabers-taberdoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => void navigate({ to: "/$lang/tabers-taberdoku", params: { lang: slug } })}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold tracking-widest text-primary">
          {t("taberdoku.title")} · {size}×{size}
        </h1>
        <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(seconds)}
        </span>
      </header>

      <main className="px-2 pb-32 pt-4">
        {solved && (
          <p className="mb-3 text-center text-lg font-bold text-primary">
            {t("taberdoku.solvedIn", { time: formatTime(seconds) })}
          </p>
        )}

        <p className="mx-auto mb-3 max-w-[480px] text-center text-xs text-muted-foreground">
          {t("taberdoku.rules")}
        </p>

        {errors > 0 && (
          <p className="mx-auto mb-3 max-w-[480px] text-center text-xs text-destructive">
            {t("taberdoku.errors", { count: errors })}
          </p>
        )}

        <div
          className="mx-auto grid max-w-[480px] overflow-hidden rounded-xl border-2 border-slate-700"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: size * size }, (_, cell) => {
            const charInfo_cell = charAt(cell);
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
                      {charInfo_cell.char.image ? (
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

        {/* Character legend - shows each character with their room color, not selectable */}
        <div
          className="mt-4 grid mx-auto max-w-[480px] gap-2"
          style={{ gridTemplateColumns: `repeat(${characterColumns}, minmax(0, 1fr))` }}
        >
          <p
            className="mb-2 text-center text-xs text-muted-foreground"
            style={{ gridColumn: "1 / -1" }}
          >
            {t("taberdoku.characters")}
          </p>
          {charInfo.map(({ char, roomColor }) => {
            const isPlaced = placements[char.id] !== undefined;
            const isGivenChar = puzzle.givens.includes(placements[char.id] ?? -1);
            return (
              <div
                key={char.id}
                className={`flex items-center justify-center rounded-lg border border-border px-2 py-1.5 text-xs transition-all ${
                  isPlaced ? "opacity-60 border-primary/50" : "opacity-100"
                }`}
                style={{ background: roomColor }}
              >
                <span
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[10px] font-bold text-white relative"
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
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px]">
                      ✓
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-3 py-2">
          <button
            type="button"
            onClick={reset}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5" />
            {t("taberdoku.reset")}
          </button>
          <button
            type="button"
            onClick={onNewBoard}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5 rotate-180" />
            {t("taberdoku.newBoard")}
          </button>
        </div>
      </nav>
    </div>
  );
}

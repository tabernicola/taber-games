import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, Clock, Eraser, Eye, HelpCircle, RotateCcw } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import { useAuth } from "@/platform/hooks/useAuth";
import { formatTime } from "@/platform/scores/formatTime";
import type { Character } from "@/platform/characters/characters";
import {
  generateSudoku,
  isAllowed,
  isSudokuSolved,
  sudokuConflicts,
  type SudokuLevel,
  type SudokuPuzzle,
} from "../logic/sudoku";
import { CharacterTray } from "./CharacterTray";
import { SudokuTutorial } from "./SudokuTutorial";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/platform/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import "@/games/tabers-sudoku/light-theme.css";

const TUTORIAL_STORAGE_KEY = "tabers-sudoku-tutorial-completed";

type SavedSudokuState = {
  level: SudokuLevel;
  puzzle: (number | null)[];
  solution: number[];
  fixed: number[];
  grid: (number | null)[];
  seconds: number;
  timestamp: number;
  showHints: boolean;
};

function getSaveKey(userId: string | null): string {
  return userId ? `tabers-sudoku-save-${userId}` : "tabers-sudoku-save-anonymous";
}

function saveSudokuState(
  userId: string | null,
  state: SavedSudokuState,
): void {
  const key = getSaveKey(userId);
  setStorageItem(key, JSON.stringify(state));
}

function loadSudokuState(userId: string | null): SavedSudokuState | null {
  const key = getSaveKey(userId);
  const saved = getStorageItem(key);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function clearSudokuState(userId: string | null): void {
  const key = getSaveKey(userId);
  removeStorageItem(key);
}

function spritePathFor(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.replace(/\.png$/, "-sprite.png");
}

/** Transforms pX.png → pX-number.png for the Sudoku character tray display. */
function numberImagePath(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.replace(/\.png$/, "-number.png");
}

function SpriteAnimation({
  src,
  frameDuration = 160,
  animate = true,
}: {
  src: string;
  frameDuration?: number;
  animate?: boolean;
}) {
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

    const tick = (time: number) => {
      if (animate && time - lastTime >= frameDuration && loaded) {
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
      animId = requestAnimationFrame(tick);
    };

    img.onload = () => {
      loaded = true;
      resize();
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [src, cols, rows, frameDuration, totalFrames, animate]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export function SudokuBoard({
  level: initialLevel,
  characters,
}: {
  level: SudokuLevel;
  characters: Character[];
}) {
  const { t, slug } = useI18n();
  const { playSound } = useSoundEffects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id ?? null;
  const [level, setLevel] = useState<SudokuLevel>(initialLevel);
  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [erasing, setErasing] = useState(false);
  const [round, setRound] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showHints, setShowHints] = useState(false);

  // Show tutorial on first visit
  useEffect(() => {
    const completed = getStorageItem(TUTORIAL_STORAGE_KEY);
    if (!completed) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setStorageItem(TUTORIAL_STORAGE_KEY, "1");
  };

  // Load saved game on mount
  useEffect(() => {
    const saved = loadSudokuState(userId);
    if (saved && saved.level === initialLevel) {
      setLevel(saved.level);
      setPuzzle({
        level: saved.level,
        puzzle: saved.puzzle,
        solution: saved.solution,
        fixed: new Set(saved.fixed),
      });
      setGrid(saved.grid);
      setSeconds(saved.seconds);
      setShowHints(saved.showHints ?? false);
      setHasSavedGame(true);
    } else {
      setHasSavedGame(false);
      setPuzzle(null);
      const id = window.setTimeout(() => {
        const next = generateSudoku(level);
        setPuzzle(next);
        setGrid([...next.puzzle]);
        setSelected(null);
        setErasing(false);
        setSeconds(0);
        setShowHints(false);
      }, 20);
      return () => window.clearTimeout(id);
    }
  }, [initialLevel, userId]);

  const handleLevelChange = (newLevel: SudokuLevel) => {
    setLevel(newLevel);
    setLevelDropdownOpen(false);
    clearSudokuState(userId);
    setHasSavedGame(false);
  };

  const handleNewGame = () => {
    clearSudokuState(userId);
    setHasSavedGame(false);
    setRound((r) => r + 1);
  };

  const solved = useMemo(() => grid.length === 81 && isSudokuSolved(grid), [grid]);
  const conflicts = useMemo(
    () => (grid.length === 81 ? sudokuConflicts(grid) : new Set<number>()),
    [grid],
  );

  // Timer
  useEffect(() => {
    if (!puzzle || solved) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [puzzle, solved]);

  // Auto-save game state
  useEffect(() => {
    if (!puzzle || solved) {
      clearSudokuState(userId);
      setHasSavedGame(false);
      return;
    }

    const saveState: SavedSudokuState = {
      level,
      puzzle: puzzle.puzzle,
      solution: puzzle.solution,
      fixed: Array.from(puzzle.fixed),
      grid,
      seconds,
      timestamp: Date.now(),
      showHints,
    };

    saveSudokuState(userId, saveState);
    setHasSavedGame(true);
  }, [grid, seconds, level, puzzle, solved, userId, showHints]);
  useEffect(() => {
    if (solved) {
      playSound("win");
    }
  }, [playSound, solved]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    characters.forEach((char, value) => {
      out[char.id] = 9 - grid.filter((v) => v === value).length;
    });
    return out;
  }, [characters, grid]);

  const handleCell = (index: number) => {
    if (!puzzle || solved || puzzle.fixed.has(index)) return;

    const nextGrid = [...grid];
    if (erasing) {
      nextGrid[index] = null;
      setGrid(nextGrid);
      playSound("click");
      return;
    }
    if (selected === null) return;

    const nextValue = nextGrid[index] === selected ? null : selected;
    const isPlacing = nextValue === selected;
    nextGrid[index] = nextValue;
    setGrid(nextGrid);
    playSound(isPlacing ? (sudokuConflicts(nextGrid).has(index) ? "error" : "place") : "click");
  };

  const selectedCharId = selected !== null ? (characters[selected]?.id ?? null) : null;

  // Calculate cells where selected character cannot be placed
  const invalidCells = useMemo(() => {
    if (!showHints || selected === null || !puzzle) return new Set<number>();
    const invalid = new Set<number>();
    for (let i = 0; i < 81; i++) {
      // Skip cells that already have the selected character
      if (grid[i] === selected) continue;
      // Mark cells where the character cannot be placed
      if (!isAllowed(grid, i, selected)) {
        invalid.add(i);
      }
    }
    console.log("Invalid cells:", invalid.size, "selected:", selected);
    return invalid;
  }, [showHints, selected, grid, puzzle]);

  return (
    <div className="tabers-sudoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            void navigate({ to: "/$lang/taberdoku/tabers-sudoku", params: { lang: slug } });
          }}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {hasSavedGame && (
            <span className="text-xs text-primary">{t("sudoku.continue")}</span>
          )}
          <h1 className="text-base font-bold tracking-widest text-primary">
            {t("sudoku.title")} · {t(`sudoku.level.${level}`)}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setShowTutorial(true);
          }}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("sudoku.help")}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <main className="px-2 pb-32 pt-4">
        {!puzzle && (
          <p className="py-20 text-center text-muted-foreground">{t("sudoku.generating")}</p>
        )}

        {puzzle && (
          <>
            {solved && (
              <p className="mb-3 text-center text-lg font-bold text-primary">
                {t("sudoku.solvedIn", { time: formatTime(seconds) })}
              </p>
            )}
            <div className="mx-auto grid max-w-[480px] grid-cols-9 overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-700">
              {grid.map((value, index) => {
                const row = Math.floor(index / 9);
                const col = index % 9;
                const fixed = puzzle.fixed.has(index);
                const char = value !== null ? characters[value] : undefined;
                const bad = conflicts.has(index);
                const isSelected = selected !== null && value === selected;
                const highlight = isSelected ? "ring-2 ring-inset ring-primary" : "";
                const invalid = invalidCells.has(index);
                const spritePath = char?.image ? spritePathFor(char.image) : undefined;
                let bgColor = fixed ? "bg-slate-100" : "bg-white";
                if (bad) bgColor = "bg-rose-200";
                if (invalid) bgColor = "bg-slate-300";
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCell(index)}
                    className={`relative aspect-square ${bgColor} ${highlight}`}
                    style={{
                      borderRight:
                        col % 3 === 2 && col !== 8 ? "2px solid #334155" : "1px solid #cbd5e1",
                      borderBottom:
                        row % 3 === 2 && row !== 8 ? "2px solid #334155" : "1px solid #cbd5e1",
                    }}
                    aria-label={`${row + 1},${col + 1}`}
                  >
                    {char && (
                      <>
                        {spritePath ? (
                          <SpriteAnimation src={spritePath} animate={isSelected} />
                        ) : char.image ? (
                          <img
                            src={char.image}
                            alt={char.name}
                            className={`h-full w-full object-cover object-top ${fixed ? "" : "opacity-90"}`}
                          />
                        ) : (
                          <span className="text-xs font-bold">{char.name.slice(0, 2)}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <CharacterTray
                characters={characters}
                selectedId={selectedCharId}
                counts={counts}
                onSelect={(id) => {
                  const idx = characters.findIndex((c) => c.id === id);
                  setErasing(false);
                  setSelected(selected === idx ? null : idx);
                }}
              />
            </div>
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-between gap-2 px-3 py-2">
          <div className="flex flex-1 items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSound("click");
                if (!puzzle) return;
                setGrid(puzzle.puzzle);
                setSelected(null);
                setErasing(false);
              }}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
            >
              <RotateCcw className="h-5 w-5" />
              {t("sudoku.reset")}
            </button>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                setShowHints((h) => !h);
              }}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${
                showHints ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Eye className="h-5 w-5" />
              {t("sudoku.hints")}
            </button>
            <div className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  handleNewGame();
                }}
                className="flex flex-1 flex-col items-center gap-1 rounded-l-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground border-r border-border"
              >
                <Eraser className="h-5 w-5" />
                {t("game.new")}
              </button>
              <DropdownMenu open={levelDropdownOpen} onOpenChange={setLevelDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound("click");
                    }}
                    className="flex h-full w-8 items-center justify-center rounded-r-lg px-1 text-muted-foreground hover:bg-muted"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8}>
                  {(["easy", "medium", "hard", "expert"] as const).map((lvl) => (
                    <DropdownMenuItem
                      key={lvl}
                      onClick={() => {
                        playSound("click");
                        handleLevelChange(lvl);
                      }}
                    >
                      {t(`sudoku.level.${lvl}`)}
                      {lvl === level && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(seconds)}
          </span>
        </div>
      </nav>
      <SudokuTutorial open={showTutorial} onClose={handleTutorialClose} />
    </div>
  );
}

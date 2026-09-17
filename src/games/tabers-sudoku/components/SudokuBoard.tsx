import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock, Eraser, RotateCcw } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { formatTime } from "@/platform/scores/formatTime";
import type { MurdokuCharacter } from "../logic/characters";
import {
  generateSudoku,
  isSudokuSolved,
  sudokuConflicts,
  type SudokuLevel,
  type SudokuPuzzle,
} from "../logic/sudoku";
import { CharacterTray } from "./CharacterTray";
import "@/games/tabers-sudoku/light-theme.css";

export function SudokuBoard({
  level,
  characters,
}: {
  level: SudokuLevel;
  characters: MurdokuCharacter[];
}) {
  const { t, slug } = useI18n();
  const navigate = useNavigate();

  const [puzzle, setPuzzle] = useState<SudokuPuzzle | null>(null);
  const [grid, setGrid] = useState<(number | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [erasing, setErasing] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    setPuzzle(null);
    const id = window.setTimeout(() => {
      const next = generateSudoku(level);
      setPuzzle(next);
      setGrid([...next.puzzle]);
      setSelected(null);
      setErasing(false);
    }, 20);
    return () => window.clearTimeout(id);
  }, [level, round]);

  const solved = useMemo(() => grid.length === 81 && isSudokuSolved(grid), [grid]);
  const { seconds } = useTimer(!!puzzle && !solved);
  const conflicts = useMemo(
    () => (grid.length === 81 ? sudokuConflicts(grid) : new Set<number>()),
    [grid],
  );

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    characters.forEach((char, value) => {
      out[char.id] = 9 - grid.filter((v) => v === value).length;
    });
    return out;
  }, [characters, grid]);

  const handleCell = (index: number) => {
    if (!puzzle || solved || puzzle.fixed.has(index)) return;
    setGrid((prev) => {
      const next = [...prev];
      if (erasing) {
        next[index] = null;
        return next;
      }
      if (selected === null) return prev;
      next[index] = next[index] === selected ? null : selected;
      return next;
    });
  };

  const selectedCharId = selected !== null ? (characters[selected]?.id ?? null) : null;

  return (
    <div className="tabers-sudoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => void navigate({ to: "/$lang/tabers-sudoku", params: { lang: slug } })}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("common.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold tracking-widest text-primary">
          {t("sudoku.title")} · {t(`sudoku.level.${level}`)}
        </h1>
        <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(seconds)}
        </span>
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
                const highlight =
                  selected !== null && value === selected ? "ring-2 ring-inset ring-primary" : "";
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCell(index)}
                    className={`relative aspect-square ${fixed ? "bg-slate-100" : "bg-white"} ${
                      bad ? "bg-rose-200" : ""
                    } ${highlight}`}
                    style={{
                      borderRight:
                        col % 3 === 2 && col !== 8 ? "2px solid #334155" : "1px solid #cbd5e1",
                      borderBottom:
                        row % 3 === 2 && row !== 8 ? "2px solid #334155" : "1px solid #cbd5e1",
                    }}
                    aria-label={`${row + 1},${col + 1}`}
                  >
                    {char &&
                      (char.image ? (
                        <img
                          src={char.image}
                          alt={char.name}
                          className={`h-full w-full object-cover object-top ${fixed ? "" : "opacity-90"}`}
                        />
                      ) : (
                        <span className="text-xs font-bold">{char.name.slice(0, 2)}</span>
                      ))}
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
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              setErasing((v) => !v);
              setSelected(null);
            }}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${
              erasing ? "border border-primary bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            <Eraser className="h-5 w-5" />
            {t("sudoku.reset")}
          </button>
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5" />
            {t("game.new")}
          </button>
        </div>
      </nav>
    </div>
  );
}

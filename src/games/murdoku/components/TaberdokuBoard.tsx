import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Clock, Eraser, RotateCcw } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useTimer } from "@/platform/hooks/useTimer";
import { formatTime } from "@/platform/scores/formatTime";
import type { MurdokuCharacter } from "../logic/characters";
import { isTaberdokuSolved, taberdokuConflicts, type TaberdokuPuzzle } from "../logic/taberdoku";
import { CharacterTray } from "./CharacterTray";
import "@/games/murdoku/light-theme.css";

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
  const cast = useMemo(() => characters.slice(0, size), [characters, size]);

  const initial = useMemo(() => {
    const map: Record<string, number> = {};
    puzzle.givens.forEach((cell, i) => {
      const char = cast[i];
      if (char) map[char.id] = cell;
    });
    return map;
  }, [puzzle, cast]);

  const [placements, setPlacements] = useState<Record<string, number>>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [erasing, setErasing] = useState(false);

  const occupied = useMemo(() => Object.values(placements), [placements]);
  const solved = isTaberdokuSolved(puzzle, occupied);
  const { seconds } = useTimer(!solved);
  const conflicts = useMemo(() => taberdokuConflicts(puzzle, occupied), [puzzle, occupied]);

  const charAt = (cell: number) => cast.find((c) => placements[c.id] === cell) ?? undefined;

  const handleCell = (cell: number) => {
    if (solved) return;
    const existing = charAt(cell);
    if (erasing) {
      if (existing) {
        setPlacements((prev) => {
          const next = { ...prev };
          delete next[existing.id];
          return next;
        });
      }
      return;
    }
    if (existing) {
      setPlacements((prev) => {
        const next = { ...prev };
        delete next[existing.id];
        return next;
      });
      return;
    }
    if (!selectedId) return;
    setPlacements((prev) => ({ ...prev, [selectedId]: cell }));
  };

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const char of cast) out[char.id] = placements[char.id] === undefined ? 1 : 0;
    return out;
  }, [cast, placements]);

  const reset = () => {
    setPlacements(initial);
    setSelectedId(null);
    setErasing(false);
  };

  return (
    <div className="murdoku-light min-h-screen">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-3 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => void navigate({ to: "/$lang/murdoku", params: { lang: slug } })}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t("murdoku.back")}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold tracking-widest text-primary">
          {t("murdoku.mode.taberdoku")} · {size}×{size}
        </h1>
        <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          {formatTime(seconds)}
        </span>
      </header>

      <main className="px-2 pb-32 pt-4">
        {solved && (
          <p className="mb-3 text-center text-lg font-bold text-primary">
            {t("murdoku.solvedIn", { time: formatTime(seconds) })}
          </p>
        )}
        <p className="mx-auto mb-3 max-w-[480px] text-center text-xs text-muted-foreground">
          {t("murdoku.taberdokuRules")}
        </p>

        <div
          className="mx-auto grid max-w-[480px] overflow-hidden rounded-xl border-2 border-slate-700"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: size * size }, (_, cell) => {
            const char = charAt(cell);
            const given = puzzle.givens.includes(cell);
            const bad = conflicts.has(cell);
            return (
              <button
                key={cell}
                type="button"
                onClick={() => handleCell(cell)}
                className={`relative aspect-square border border-slate-400/70 ${
                  bad ? "ring-2 ring-inset ring-rose-500" : ""
                }`}
                style={{ background: ROOM_COLORS[puzzle.rooms[cell] % ROOM_COLORS.length] }}
                aria-label={`${Math.floor(cell / size) + 1},${(cell % size) + 1}`}
              >
                {char &&
                  (char.image ? (
                    <img
                      src={char.image}
                      alt={char.name}
                      className={`h-full w-full object-cover object-top ${given ? "" : "opacity-95"}`}
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
            characters={cast}
            selectedId={selectedId}
            counts={counts}
            onSelect={(id) => {
              setErasing(false);
              setSelectedId(selectedId === id ? null : id);
            }}
          />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => {
              setErasing((v) => !v);
              setSelectedId(null);
            }}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${
              erasing ? "border border-primary bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            <Eraser className="h-5 w-5" />
            {t("murdoku.erase")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5" />
            {t("murdoku.reset")}
          </button>
          <button
            type="button"
            onClick={onNewBoard}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-muted-foreground"
          >
            <RotateCcw className="h-5 w-5 rotate-180" />
            {t("murdoku.newBoard")}
          </button>
        </div>
      </nav>
    </div>
  );
}

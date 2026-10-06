import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import type { Character } from "@/platform/characters/characters";

const SUDOKU_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function CharacterTray({
  characters,
  selectedId,
  onSelect,
  counts,
}: {
  characters: Character[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** optional remaining count badge per character id */
  counts?: Record<string, number>;
}) {
  const { playSound } = useSoundEffects();
  return (
    <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-center gap-2 px-2">
      {characters.map((char, index) => {
        const active = selectedId === char.id;
        const left = counts?.[char.id];
        const done = left !== undefined && left <= 0;
        const number = SUDOKU_NUMBERS[index] ?? "";
        return (
          <button
            key={char.id}
            type="button"
            onClick={() => {
              playSound("click");
              onSelect(char.id);
            }}
            aria-pressed={active}
            title={char.name}
            className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
              active
                ? "border-primary ring-2 ring-primary/40 scale-110 shadow-[0_0_16px_var(--neon-pink)]"
                : "border-border hover:border-muted-foreground/60 hover:scale-105"
            } ${done ? "opacity-40" : ""}`}
            style={{
              background: active
                ? "linear-gradient(135deg, var(--neon-pink)/15, var(--neon-cyan)/15)"
                : "linear-gradient(135deg, var(--card), var(--muted))",
            }}
          >
            {char.image ? (
              <>
                <img
                  src={char.image}
                  alt={char.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  style={{ filter: done ? "grayscale(1)" : "none" }}
                />
                <span
                  className="relative z-10 text-2xl font-black tabular-nums select-none"
                  style={{
                    color: active ? "var(--neon-pink)" : "var(--foreground)",
                    textShadow: active
                      ? "0 0 8px var(--neon-pink), 0 0 16px var(--neon-pink)"
                      : "0 2px 4px rgba(0,0,0,0.3)",
                    filter: done ? "grayscale(1)" : "none",
                  }}
                >
                  {number}
                </span>
                {active && (
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-neon-pink/30 via-neon-cyan/30 to-neon-pink/30 animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </>
            ) : (
              <span
                className="relative z-10 text-2xl font-black tabular-nums select-none"
                style={{
                  color: active ? "var(--neon-pink)" : "var(--foreground)",
                  textShadow: active
                    ? "0 0 8px var(--neon-pink), 0 0 16px var(--neon-pink)"
                    : "none",
                  filter: done ? "grayscale(1)" : "none",
                }}
              >
                {number}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

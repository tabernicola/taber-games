import { useSoundEffects } from "@/platform/hooks/useSoundEffects";
import type { Character } from "@/platform/characters/characters";

const SUDOKU_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Transforms pX.png → pX-number.png for the Sudoku character tray display. */
function numberImagePath(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return image.replace(/\.png$/, "-number.png");
}

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
  const firstFive = characters.slice(0, 5);
  const lastFour = characters.slice(5, 9);

  const renderRow = (items: Character[], cols: number) => (
    <div
      className="mx-auto flex w-full max-w-[480px] items-center justify-center gap-2 px-2"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((char, index) => {
        const globalIndex = items === firstFive ? index : index + 5;
        const active = selectedId === char.id;
        const left = counts?.[char.id];
        const done = left !== undefined && left <= 0;
        const number = SUDOKU_NUMBERS[globalIndex] ?? "";
        const trayImage = numberImagePath(char.image);
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
            className={`relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
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
            {trayImage ? (
              <img
                src={trayImage}
                alt={char.name}
                className="h-full w-full object-contain"
                style={{ filter: done ? "grayscale(1)" : "none" }}
              />
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

  return (
    <div className="flex flex-col items-center gap-2">
      {renderRow(firstFive, 5)}
      {renderRow(lastFour, 4)}
    </div>
  );
}

import type { MurdokuCharacter } from "../logic/characters";

export function CharacterTray({
  characters,
  selectedId,
  onSelect,
  counts,
}: {
  characters: MurdokuCharacter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** optional remaining count badge per character id */
  counts?: Record<string, number>;
}) {
  return (
    <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-center gap-2 px-2">
      {characters.map((char) => {
        const active = selectedId === char.id;
        const left = counts?.[char.id];
        const done = left !== undefined && left <= 0;
        return (
          <button
            key={char.id}
            type="button"
            onClick={() => onSelect(char.id)}
            aria-pressed={active}
            title={char.name}
            className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${
              active
                ? "border-primary ring-2 ring-primary/40 scale-110"
                : "border-border hover:border-muted-foreground/60"
            } ${done ? "opacity-40" : ""}`}
          >
            {char.image ? (
              <img
                src={char.image}
                alt={char.name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <span className="text-xs font-bold">{char.name.slice(0, 2)}</span>
            )}
            {left !== undefined && left > 0 && (
              <span className="absolute -bottom-0.5 right-0 rounded-full bg-background/90 px-1 text-[10px] font-bold text-foreground">
                {left}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

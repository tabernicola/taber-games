import type { Clue } from "../data/gameSchema";
import { ClueTypeBadge } from "./ClueTypeBadge";

export function CluesView({
  clues,
  readClues,
  onToggleRead,
}: {
  clues: Clue[];
  readClues: Set<string>;
  onToggleRead: (clueId: string) => void;
}) {
  if (clues.length === 0) {
    return <div className="p-4 text-center text-sm text-muted-foreground">{""}</div>;
  }

  return (
    <div className="p-3">
      <ul className="space-y-2">
        {clues.map((clue) => {
          const isRead = readClues.has(clue.id);
          return (
            <li
              key={clue.id}
              onClick={() => onToggleRead(clue.id)}
              className={`cursor-pointer rounded-lg border border-border bg-card p-3 text-sm transition-all hover:border-neon-pink/60 ${
                isRead ? "bg-muted/30 opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 text-xs font-semibold ${
                    isRead ? "line-through decoration-muted-foreground" : "text-neon-pink"
                  }`}
                >
                  #
                </span>
                <div className="flex-1">
                  <ClueTypeBadge type={clue.type} />
                  <p
                    className={`mt-1 ${isRead ? "line-through text-muted-foreground/50" : "text-foreground"}`}
                  >
                    {clue.text}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

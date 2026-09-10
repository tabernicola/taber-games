import type { CaseContent, Position } from "../data/gameSchema";
import type { Mark } from "./deductionState";
import { posKey, cycleMark, markLabel } from "./deductionState";

export function DeductionGrid({
  content,
  marks,
  onMarkChange,
  disabled,
}: {
  content: CaseContent;
  marks: Record<string, Mark>;
  onMarkChange: (key: string, mark: Mark) => void;
  disabled?: boolean;
}) {
  const { gridRows, gridCols } = content;

  const handleCycle = (pos: Position) => {
    if (disabled) return;
    const key = posKey(pos.row, pos.col);
    const next = cycleMark(marks[key] ?? null);
    onMarkChange(key, next);
  };

  return (
    <div className="p-3">
      <div className="mb-2 text-center">
        <h2 className="text-xl font-bold tracking-widest text-neon-pink">Notebook</h2>
        <p className="text-xs text-muted-foreground">Tap cells to cycle marks</p>
      </div>

      <div className="mx-auto max-w-[480px]">
        <div
          className="relative grid gap-0.5 rounded-xl border-2 border-border bg-muted/10 p-0.5"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
          {Array.from({ length: gridRows }).map((_, row) =>
            Array.from({ length: gridCols }).map((_, col) => {
              const pos: Position = { row, col };
              const key = posKey(row, col);
              const mark = marks[key] ?? null;
              const isConfirmed = mark === "confirm";
              const isExcluded = mark === "exclude";

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleCycle(pos)}
                  className={`flex aspect-square items-center justify-center text-xl transition-all ${
                    isConfirmed
                      ? "bg-neon-pink/15 text-neon-pink ring-1 ring-neon-pink"
                      : isExcluded
                        ? "bg-muted/30 text-destructive"
                        : "bg-card text-muted-foreground hover:bg-neon-pink/10"
                  }`}
                >
                  {mark !== null && markLabel(mark)}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

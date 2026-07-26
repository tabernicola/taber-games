import type { Cell } from "@/lib/tabersquare/pieces";

interface PieceShapeProps {
  cells: Cell[];
  color: string;
  cellSize?: number;
  gap?: number;
}

export function PieceShape({ cells, color, cellSize = 22, gap = 2 }: PieceShapeProps) {
  const maxX = Math.max(...cells.map(([x]) => x));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const cols = maxX + 1;
  const rows = maxY + 1;
  const w = cols * cellSize + (cols - 1) * gap;
  const h = rows * cellSize + (rows - 1) * gap;
  const set = new Set(cells.map(([x, y]) => `${x},${y}`));

  return (
    <div
      className="relative"
      style={{ width: w, height: h }}
      aria-hidden
    >
      {Array.from({ length: rows }).map((_, y) =>
        Array.from({ length: cols }).map((_, x) => {
          if (!set.has(`${x},${y}`)) return null;
          return (
            <div
              key={`${x}-${y}`}
              className="absolute rounded-sm"
              style={{
                left: x * (cellSize + gap),
                top: y * (cellSize + gap),
                width: cellSize,
                height: cellSize,
                background: color,
                boxShadow: `0 0 12px ${color}, inset 0 0 0 1px rgba(255,255,255,0.15)`,
              }}
            />
          );
        }),
      )}
    </div>
  );
}

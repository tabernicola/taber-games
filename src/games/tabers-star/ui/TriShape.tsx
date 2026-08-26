import { triVerts, type Tri } from "../logic/geometry";

interface TriShapeProps {
  cells: Tri[];
  color: string;
  /** Pixel length of a unit triangle edge. */
  cellSize?: number;
}

/** SVG rendering of a triangular piece, mirroring PieceShape's neon look. */
export function TriShape({ cells, color, cellSize = 22 }: TriShapeProps) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of cells) {
    for (const [x, y] of triVerts(t)) {
      const px = x * cellSize;
      const py = y * cellSize;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
  }
  const pad = 1;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`${minX - pad} ${minY - pad} ${w} ${h}`}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      aria-hidden
    >
      {cells.map((t) => (
        <polygon
          key={`${t.q},${t.r},${t.d}`}
          points={triVerts(t)
            .map(([x, y]) => `${x * cellSize},${y * cellSize}`)
            .join(" ")}
          fill={color}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}

import { useMemo } from "react";
import { triVerts, type Tri } from "../logic/geometry";

interface TriShapeProps {
  cells: Tri[];
  color?: string;
  /** Pixel length of a unit triangle edge. */
  cellSize?: number;
  /** Color of the thin inner stroke (close to the fill). */
  innerStroke?: string;
  /** Color of the outer ring that surrounds the inner stroke. */
  outerStroke?: string;
  /** Width of the inner stroke. */
  innerStrokeWidth?: number;
  /** Width of the outer ring. */
  outerStrokeWidth?: number;
}

/** SVG rendering of a triangular piece.
 * Non-neon: black pieces get a soft paper shadow (no pink glow); coloured
 * pieces render flat without glow. Each cell is drawn as two stacked
 * polygons to produce a two-tone border (Option A): an outer layer that
 * reserves the ring space and an inner layer with the fill plus a thin
 * inner stroke. Defaults: inner stroke = black, outer ring = transparent. */
export function TriShape({
  cells,
  color,
  cellSize = 22,
  innerStroke = "#000000",
  outerStroke = "transparent",
  innerStrokeWidth = 0.2,
  outerStrokeWidth = 2.8,
}: TriShapeProps) {
  const fallbackColor = color || cells[0]?.color || "#000000";
  const isBlack = useMemo(
    () => fallbackColor === "#000000" || fallbackColor === "#1a1a1a" || fallbackColor === "black",
    [fallbackColor],
  );
  // Soft paper shadow only for dark (flag-black) pieces; no neon glow anywhere.
  const filter = isBlack ? "drop-shadow(0 2px 0 rgba(0,0,0,0.4))" : "none";

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
  const pad = outerStrokeWidth;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`${minX - pad} ${minY - pad} ${w} ${h}`}
      style={{ filter }}
      aria-hidden
    >
      {cells.map((t) => {
        const cellColor = t.color || fallbackColor;
        const pts = triVerts(t)
          .map(([x, y]) => `${x * cellSize},${y * cellSize}`)
          .join(" ");
        return (
          <g key={`${t.q},${t.r},${t.d}`}>
            {/* Outer ring: reserves the space for the outer border. */}
            <polygon
              points={pts}
              fill="none"
              stroke={outerStroke}
              strokeWidth={outerStrokeWidth}
              strokeLinejoin="round"
            />
            {/* Inner polygon: fill + thin black inner stroke. */}
            <polygon
              points={pts}
              fill={cellColor}
              stroke={innerStroke}
              strokeWidth={innerStrokeWidth}
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

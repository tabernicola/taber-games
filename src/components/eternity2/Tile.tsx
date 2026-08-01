import { memo } from "react";
import { patternOf } from "@/lib/eternity2/patterns";
import type { Edges } from "@/lib/eternity2/game";

const WEDGES: Record<number, string> = {
  0: "0,0 100,0 50,50",
  1: "100,0 100,100 50,50",
  2: "100,100 0,100 50,50",
  3: "0,100 0,0 50,50",
};

const GLYPH_POS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 24 },
  1: { x: 76, y: 52 },
  2: { x: 50, y: 80 },
  3: { x: 24, y: 52 },
};

type Props = {
  edges: Edges;
  size: number;
  selected?: boolean;
  conflict?: boolean;
  locked?: boolean;
  onClick?: () => void;
  title?: string;
};

function TileImpl({ edges, size, selected, conflict, locked, onClick, title }: Props) {
  const showGlyphs = size >= 46;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="e2-tile"
      data-selected={selected ? "" : undefined}
      data-conflict={conflict ? "" : undefined}
      data-locked={locked ? "" : undefined}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
        {[0, 1, 2, 3].map((i) => {
          const p = patternOf(edges[i]);
          return (
            <g key={i}>
              <polygon points={WEDGES[i]} fill={p.color} />
              <polygon
                points={WEDGES[i]}
                fill="none"
                stroke={p.shade}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {showGlyphs && p.glyph ? (
                <text
                  x={GLYPH_POS[i].x}
                  y={GLYPH_POS[i].y}
                  fontSize={20}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {p.glyph}
                </text>
              ) : null}
            </g>
          );
        })}
        <rect x="0" y="0" width="100" height="100" fill="url(#e2gloss)" pointerEvents="none" />
        <defs>
          <linearGradient id="e2gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>
        </defs>
      </svg>
    </button>
  );
}

export const Tile = memo(TileImpl);

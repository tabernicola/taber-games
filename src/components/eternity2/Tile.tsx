import { memo } from "react";
import { patternOf, type Shape } from "@/lib/eternity2/patterns";
import type { Edges } from "@/lib/eternity2/game";

const WEDGES: Record<number, string> = {
  0: "0,0 100,0 50,50",
  1: "100,0 100,100 50,50",
  2: "100,100 0,100 50,50",
  3: "0,100 0,0 50,50",
};

const MOTIF_POS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 22 },
  1: { x: 78, y: 50 },
  2: { x: 50, y: 78 },
  3: { x: 22, y: 50 },
};

function Motif({ shape, x, y, color }: { shape: Shape; x: number; y: number; color: string }) {
  const common = { fill: color, stroke: "rgba(0,0,0,0.35)", strokeWidth: 1.2 };
  switch (shape) {
    case "circle":
      return <circle cx={x} cy={y} r={7} {...common} />;
    case "triangle":
      return <polygon points={`${x},${y - 8} ${x + 8},${y + 6} ${x - 8},${y + 6}`} {...common} />;
    case "diamond":
      return <polygon points={`${x},${y - 9} ${x + 8},${y} ${x},${y + 9} ${x - 8},${y}`} {...common} />;
    case "star":
      return (
        <polygon
          points={Array.from({ length: 10 }, (_, i) => {
            const r = i % 2 === 0 ? 9 : 4;
            const a = (Math.PI / 5) * i - Math.PI / 2;
            return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
          }).join(" ")}
          {...common}
        />
      );
    case "flower":
      return (
        <g {...common}>
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={x + 5 * Math.cos((Math.PI / 2) * i)}
              cy={y + 5 * Math.sin((Math.PI / 2) * i)}
              r={4}
            />
          ))}
        </g>
      );
    case "bone":
      return (
        <g {...common}>
          <rect x={x - 8} y={y - 2.5} width={16} height={5} rx={2.5} />
          <circle cx={x - 8} cy={y} r={4} />
          <circle cx={x + 8} cy={y} r={4} />
        </g>
      );
    case "leaf":
      return (
        <path
          d={`M ${x} ${y - 9} Q ${x + 9} ${y} ${x} ${y + 9} Q ${x - 9} ${y} ${x} ${y - 9} Z`}
          {...common}
        />
      );
    case "paw":
    default:
      return (
        <g {...common}>
          <ellipse cx={x} cy={y + 3} rx={6} ry={5} />
          <circle cx={x - 6} cy={y - 4} r={2.6} />
          <circle cx={x} cy={y - 6} r={2.6} />
          <circle cx={x + 6} cy={y - 4} r={2.6} />
        </g>
      );
  }
}

type Props = {
  edges: Edges;
  size: number;
  selected?: boolean;
  conflict?: boolean;
  locked?: boolean;
  candidate?: boolean;
  dim?: boolean;
  onClick?: () => void;
  title?: string;
};

function TileImpl({ edges, size, selected, conflict, locked, candidate, dim, onClick, title }: Props) {
  const showMotifs = size >= 34;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="e2-tile"
      data-selected={selected ? "" : undefined}
      data-conflict={conflict ? "" : undefined}
      data-locked={locked ? "" : undefined}
      data-candidate={candidate ? "" : undefined}
      data-dim={dim ? "" : undefined}
      style={{ width: size, height: size }}
    >

      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id="e2gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>
        </defs>
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
              {showMotifs && edges[i] > 0 ? (
                <Motif shape={p.shape} x={MOTIF_POS[i].x} y={MOTIF_POS[i].y} color={p.shade} />
              ) : null}
            </g>
          );
        })}
        <rect x="0" y="0" width="100" height="100" fill="url(#e2gloss)" pointerEvents="none" />
      </svg>
    </button>
  );
}

export const Tile = memo(TileImpl);

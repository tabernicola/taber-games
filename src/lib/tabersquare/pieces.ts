// The 9 pieces of The Taber Square. Cells sum to 29 (= 36 - 7 blockers).
// Each piece is a list of [col, row] offsets in its base orientation.

export type Cell = [number, number];

export interface PieceDef {
  id: string;
  /** Official Genius Square piece number (1–9). */
  number: number;
  name: string;
  color: string; // css var
  cells: Cell[];
}

/** Colours aligned with The Genius Square rule sheet (Smart Games). */
export const PIECES: PieceDef[] = [
  { id: "p1", number: 1, name: "Mono", color: "var(--neon-yellow)", cells: [[0, 0]] },
  {
    id: "p2",
    number: 2,
    name: "Duo",
    color: "var(--neon-orange)",
    cells: [
      [0, 0],
      [1, 0],
    ],
  },
  {
    id: "p3",
    number: 3,
    name: "Tri-I",
    color: "var(--neon-cyan)",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
  },
  {
    id: "p4",
    number: 4,
    name: "Tri-L",
    color: "var(--neon-green)",
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: "p5",
    number: 5,
    name: "Square",
    color: "var(--neon-blue)",
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: "p6",
    number: 6,
    name: "L-4",
    color: "var(--neon-violet)",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
  },
  {
    id: "p7",
    number: 7,
    name: "T-4",
    color: "var(--neon-pink)",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
  },
  {
    id: "p8",
    number: 8,
    name: "S-4",
    color: "var(--neon-red)",
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  {
    id: "p9",
    number: 9,
    name: "I-4",
    color: "var(--piece-orange-bar)",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  },
];

export function normalize(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map(([x]) => x));
  const minY = Math.min(...cells.map(([, y]) => y));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Cell)
    .sort(([a1, b1], [a2, b2]) => a1 - a2 || b1 - b2);
}

export function rotate(cells: Cell[]): Cell[] {
  // 90° clockwise: (x, y) -> (-y, x)
  return normalize(cells.map(([x, y]) => [-y, x] as Cell));
}

export function flip(cells: Cell[]): Cell[] {
  // Mirror horizontally: (x, y) -> (-x, y)
  return normalize(cells.map(([x, y]) => [-x, y] as Cell));
}

export function allOrientations(cells: Cell[]): Cell[][] {
  const seen = new Set<string>();
  const result: Cell[][] = [];
  const current = normalize(cells);
  for (let f = 0; f < 2; f++) {
    let c = f === 0 ? current : flip(current);
    for (let r = 0; r < 4; r++) {
      const key = JSON.stringify(c);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(c);
      }
      c = rotate(c);
    }
  }
  return result;
}

// The 11 pieces of The Genius Star (used in The Taber's Star).
// Triangle areas sum to 41 (= 48 - 7 blockers).
// Each piece is a list of unit triangles {q, r, d} in its base orientation.

import type { Tri } from "./geometry";

export interface StarPieceDef {
  id: string;
  name: string;
  color: string; // css var
  cells: Tri[];
}

const u = (q: number, r: number): Tri => ({ q, r, d: 0 });
const d = (q: number, r: number): Tri => ({ q, r, d: 1 });

export const STAR_PIECES: StarPieceDef[] = [
  // 1. Moniamond (1 triangle)
  {
    id: "s1",
    name: "Moniamond",
    color: "var(--piece-light-blue)",
    cells: [u(0, 0)],
  },
  // 2. Diamond (2 triangles) - rhombus
  {
    id: "s2",
    name: "Diamond",
    color: "var(--piece-yellow)",
    cells: [u(0, 0), d(0, 0)],
  },
  // 3. Triamond A - Trapezoid (3 triangles) - up with left & right down neighbors
  {
    id: "s3",
    name: "Trapezoid 1",
    color: "var(--piece-purple)",
    cells: [u(0, 0), d(-1, 0), d(0, 0)],
  },
  // 4. Triamond B - Straight 3 (3 triangles) - line of 3
  {
    id: "s4",
    name: "Straight 3",
    color: "var(--piece-light-green)",
    cells: [u(0, 0), d(0, 0), u(1, 0)],
  },
  // 5. Tetriamond A - Straight 4 (4 triangles) - line of 4
  {
    id: "s5",
    name: "Straight 4",
    color: "var(--piece-orange)",
    cells: [u(0, 0), d(0, 0), u(1, 0), d(1, 0)],
  },
  // 6. Pentiamond A - Straight 5 (5 triangles) - line of 5
  {
    id: "s6",
    name: "Straight 5",
    color: "var(--piece-red)",
    cells: [u(0, 0), d(0, 0), u(1, 0), d(1, 0), u(2, 0)],
  },
  // 7. Tetriamond B - T-shape (4 triangles)
  {
    id: "s7",
    name: "T-Shape",
    color: "var(--piece-dark-green)",
    cells: [u(0, 0), d(0, 0), d(-1, 0), u(0, 1)],
  },
  // 8. Tetriamond C - Parallelogram (4 triangles) - 2x2 rhombus
  {
    id: "s8",
    name: "Parallelogram",
    color: "var(--piece-brown)",
    cells: [u(0, 0), u(1, 0), d(0, 0), d(1, 0)],
  },
  // 9. Pentomino B - House (5 triangles)
  {
    id: "s9",
    name: "House",
    color: "var(--piece-dark-blue)",
    cells: [u(0, 0), d(0, 0), u(1, 0), d(1, 0), u(0, 1)],
  },
  // 10. Pentomino C - Crown (5 triangles)
  {
    id: "s10",
    name: "Crown",
    color: "var(--piece-light-blue)",
    cells: [u(0, 0), u(1, 0), u(0, 1), d(0, 0), d(1, 0)],
  },
  // 11. Pentomino D - Chevron (5 triangles)
  {
    id: "s11",
    name: "Chevron",
    color: "var(--piece-light-green)",
    cells: [u(0, 0), d(0, 0), u(0, 1), d(0, 1), u(1, 0)],
  },
];
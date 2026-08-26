// The 7 pieces of The Taber's Star. Triangle areas sum to 41 (= 48 - 6 blockers).
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
  {
    id: "s1",
    name: "Triangle",
    color: "var(--piece-light-blue)",
    cells: [u(0, 0), u(1, 0), u(0, 1), d(0, 0)],
  },
  {
    id: "s2",
    name: "Zigzag",
    color: "var(--piece-purple)",
    cells: [u(0, 0), d(0, 0), u(1, 0), d(1, 0), u(2, 0)],
  },
  {
    id: "s3",
    name: "Crown",
    color: "var(--piece-dark-green)",
    cells: [u(0, 0), u(1, 0), u(0, 1), d(0, 0), d(1, 0)],
  },
  {
    id: "s4",
    name: "Clover",
    color: "var(--piece-brown)",
    cells: [d(0, 0), u(0, 0), u(1, 0), u(0, 1), d(1, 0), d(0, 1)],
  },
  {
    id: "s5",
    name: "Clover Plus",
    color: "var(--piece-orange)",
    cells: [d(0, 0), u(0, 0), u(1, 0), u(0, 1), d(1, 0), d(0, 1), u(1, 1)],
  },
  {
    id: "s6",
    name: "Lightning",
    color: "var(--piece-red)",
    cells: [u(0, 0), d(0, 0), u(1, 0), d(1, 0), u(2, 0), d(2, 0), u(0, 1)],
  },
  {
    id: "s7",
    name: "Arrow",
    color: "var(--piece-dark-blue)",
    cells: [u(0, 0), u(1, 0), u(0, 1), d(0, 0), d(-1, 1), d(0, 1), u(1, 1)],
  },
];

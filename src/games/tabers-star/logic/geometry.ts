// Triangular-lattice geometry for The Taber's Star.
//
// A cell is a unit triangle of the regular triangular tiling, addressed by
// integer axial coords (q, r) plus orientation d (0 = pointing up, 1 = down):
//   up(q,r)   vertices: (q,r), (q+1,r), (q,r+1)
//   down(q,r) vertices: (q+1,r), (q+1,r+1), (q,r+1)
// with cart(q,r) = (q + r/2, r * sqrt(3)/2).

export const SQRT3 = Math.sqrt(3);
export const HALF_H = SQRT3 / 2; // height of a unit triangle

export interface Tri {
  q: number;
  r: number;
  d: 0 | 1;
  color?: string;
}

export function triKey(t: Tri): string {
  return `${t.q},${t.r},${t.d}`;
}

export function cartX(q: number, r: number): number {
  return q + r / 2;
}

export function cartY(r: number): number {
  return r * HALF_H;
}

/** Vertices of a unit triangle in cartesian space. */
export function triVerts(t: Tri): [number, number][] {
  if (t.d === 0) {
    return [
      [cartX(t.q, t.r), cartY(t.r)],
      [cartX(t.q + 1, t.r), cartY(t.r)],
      [cartX(t.q, t.r + 1), cartY(t.r + 1)],
    ];
  }
  return [
    [cartX(t.q + 1, t.r), cartY(t.r)],
    [cartX(t.q + 1, t.r + 1), cartY(t.r + 1)],
    [cartX(t.q, t.r + 1), cartY(t.r + 1)],
  ];
}

/** Centroid of a unit triangle in cartesian space. */
export function triCentroid(t: Tri): [number, number] {
  // up: coeffs (q+1/3, r+1/3); down: (q+2/3, r+2/3)
  const o = t.d === 0 ? 1 / 3 : 2 / 3;
  return [cartX(t.q + o, t.r + o), cartY(t.r + o)];
}

/** Rotate 60° counter-clockwise. Orientation flips each step. */
export function rotateTri(t: Tri): Tri {
  const next =
    t.d === 0 ? { q: -t.r - 1, r: t.q + t.r, d: 1 } : { q: -t.r - 1, r: t.q + t.r + 1, d: 0 };
  if (t.color !== undefined) next.color = t.color;
  return next;
}

/** Mirror across the vertical axis. Orientation is preserved. */
export function flipTri(t: Tri): Tri {
  const next = { q: -t.q - t.r - (t.d === 0 ? 1 : 2), r: t.r, d: t.d };
  if (t.color !== undefined) next.color = t.color;
  return next;
}

/** Translate so min(q) = 0 and then min(r) = 0. Deterministic per shape. */
export function normalizeTris(tris: Tri[]): Tri[] {
  const minQ = Math.min(...tris.map((t) => t.q));
  let shifted = tris.map((t) => ({ ...t, q: t.q - minQ }));
  const minR = Math.min(...shifted.map((t) => t.r));
  shifted = shifted.map((t) => ({ ...t, r: t.r - minR }));
  return shifted.sort((a, b) => a.q - b.q || a.r - b.r || a.d - b.d);
}

export function trisKey(tris: Tri[]): string {
  return JSON.stringify(normalizeTris(tris));
}

/** All unique orientations (rotations × mirror) of a piece. */
export function allTriOrientations(cells: Tri[]): Tri[][] {
  const seen = new Set<string>();
  const result: Tri[][] = [];
  const current = normalizeTris(cells);
  for (let f = 0; f < 2; f++) {
    let c = f === 0 ? current : normalizeTris(current.map(flipTri));
    for (let rot = 0; rot < 6; rot++) {
      const key = trisKey(c);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(normalizeTris(c));
      }
      c = c.map(rotateTri);
    }
  }
  return result;
}

const UP_NBRS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [0, -1],
];
const DOWN_NBRS: [number, number][] = [
  [0, 0],
  [1, 0],
  [0, 1],
];

/** Edge-neighbours of a unit triangle (same orientation results). */
export function triNeighbors(t: Tri): Tri[] {
  const offs = t.d === 0 ? UP_NBRS : DOWN_NBRS;
  return offs.map(([dq, dr]) => ({ q: t.q + dq, r: t.r + dr, d: (1 - t.d) as 0 | 1 }));
}

// The 7 real dice of the game, each with 6 faces. Each face is a [col, row]
// coordinate on the 6x6 board (column A→0..F→5, row 1→0..6→5). Some dice have
// repeated faces; the unique faces of all dice together cover the 36 cells.

import type { Cell } from "./pieces";

export const DICE: Cell[][] = [
  // Die 1: A1, C1, D1, D2, E2, F3
  [
    [0, 0],
    [2, 0],
    [3, 0],
    [3, 1],
    [4, 1],
    [5, 2],
  ],
  // Die 2: A2, A3, B1, B2, B3, C2
  [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 1],
  ],
  // Die 3: B4, C3, C4, D3, D4, E3
  [
    [1, 3],
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
    [4, 2],
  ],
  // Die 4: A4, B5, C5, C6, D6, F6
  [
    [0, 3],
    [1, 4],
    [2, 4],
    [2, 5],
    [3, 5],
    [5, 5],
  ],
  // Die 5: D5, E4, E5, E6, F4, F5
  [
    [3, 4],
    [4, 3],
    [4, 4],
    [4, 5],
    [5, 3],
    [5, 4],
  ],
  // Die 6: A5, A5, B6, E1, F2, F2 (4 unique faces)
  [
    [0, 4],
    [0, 4],
    [1, 5],
    [4, 0],
    [5, 1],
    [5, 1],
  ],
  // Die 7: A6, A6, A6, F1, F1, F1 (2 unique faces)
  [
    [0, 5],
    [0, 5],
    [0, 5],
    [5, 0],
    [5, 0],
    [5, 0],
  ],
];

export function rollDice(): Cell[] {
  return DICE.map((faces) => faces[Math.floor(Math.random() * faces.length)]);
}

export function dedupeBlockers(blockers: Cell[]): Cell[] {
  const seen = new Set<string>();
  const result: Cell[] = [];
  for (const [x, y] of blockers) {
    const key = `${x},${y}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push([x, y]);
    }
  }
  return result;
}

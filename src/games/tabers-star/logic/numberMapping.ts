// Number mapping for The Taber's Star board cells
// Maps numbers 1-48 to specific triangles based on Genius Star geometry

import type { Tri } from "./geometry";
import { triKey } from "./geometry";

/** Map each number (1-48) to its corresponding board cell */
let NUMBER_TO_CELL: Map<number, Tri> | null = null;

/** Map each board cell to its number (for reverse lookup) */
let CELL_TO_NUMBER: Map<string, number> | null = null;

let isInitialized = false;

/**
 * Initialize the number mapping with a simple sequential mapping
 * for now to test if the basic system works
 */
function initializeNumberMapping(board: Tri[]) {
  NUMBER_TO_CELL = new Map<number, Tri>();
  CELL_TO_NUMBER = new Map<string, number>();

  // Simple sequential mapping: number 1 = board[0], number 2 = board[1], etc.
  for (let i = 0; i < board.length && i < 48; i++) {
    NUMBER_TO_CELL.set(i + 1, board[i]);
    CELL_TO_NUMBER.set(triKey(board[i]), i + 1);
  }

  isInitialized = true;
}

/** Ensure the mapping is initialized before use */
function ensureInitialized(board: Tri[]) {
  if (!isInitialized && board && board.length > 0) {
    initializeNumberMapping(board);
  }
}

/** Get the board cell for a specific number */
export function getCellForNumber(number: number, board: Tri[]): Tri | null {
  ensureInitialized(board);
  return NUMBER_TO_CELL?.get(number) || null;
}

/** Get the number for a specific board cell */
export function getNumberForCell(cell: Tri, board: Tri[]): number | null {
  ensureInitialized(board);
  return CELL_TO_NUMBER?.get(triKey(cell)) || null;
}

/** Get all cells that should contain specific numbers */
export function getCellsWithNumbers(numbers: number[], board: Tri[]): Tri[] {
  ensureInitialized(board);
  const cells: Tri[] = [];
  for (const num of numbers) {
    const cell = NUMBER_TO_CELL?.get(num);
    if (cell) cells.push(cell);
  }
  return cells;
}

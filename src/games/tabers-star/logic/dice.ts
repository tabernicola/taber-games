// Dice system for The Taber's Star based on Genius Star
// 7 dice: 4 d6 and 3 d8 with specific number distributions

import type { Tri } from "./geometry";

/** Definition of a die with its faces */
export interface Die {
  id: string;
  type: "d6" | "d8";
  faces: number[];
}

/** The 7 dice based on Genius Star specifications */
export const DICE: Die[] = [
  // 4 six-sided dice (d6)
  { id: "d1", type: "d6", faces: [1, 5, 15, 34, 44, 48] },
  { id: "d2", type: "d6", faces: [10, 10, 27, 27, 31, 31] },
  { id: "d3", type: "d6", faces: [18, 18, 22, 22, 39, 39] },
  { id: "d4", type: "d6", faces: [19, 20, 21, 28, 29, 30] },
  // 3 eight-sided dice (d8)
  { id: "d5", type: "d8", faces: [2, 4, 7, 8, 9, 11, 16, 17] },
  { id: "d6", type: "d8", faces: [12, 13, 23, 24, 32, 33, 41, 42] },
  { id: "d7", type: "d8", faces: [25, 26, 36, 37, 38, 40, 45, 47] },
];

/** Roll a single die and return the result */
export function rollDie(die: Die): number {
  const randomIndex = Math.floor(Math.random() * die.faces.length);
  console.log(`Rolled die ${die.id} (${die.type}): ${die.faces[randomIndex]}`);
  return die.faces[randomIndex];
}

/** Roll all 7 dice and return the results */
export function rollAllDice(): number[] {
  return DICE.map(rollDie);
}

/** Result of dice roll with mapping to board cells */
export interface DiceResult {
  dieId: string;
  number: number;
  cell: Tri | null; // null if number not found in mapping
}

/** Complete dice roll with board cell mappings */
export interface DiceRoll {
  results: DiceResult[];
  blockedCells: Tri[];
}

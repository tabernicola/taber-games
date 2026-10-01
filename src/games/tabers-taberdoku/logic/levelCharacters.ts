import { TABERDOKU_TOTAL_LEVELS } from "./taberdokuPuzzles";
import type { MurdokuCharacter } from "./characters";

/**
 * The finale level has no character on purpose. Levels are paired with the cast
 * by position, so without this guard the last level would silently borrow the
 * next suspect once a tenth character is added to the database.
 */
export const LEVEL_WITHOUT_CHARACTER = TABERDOKU_TOTAL_LEVELS;

/**
 * Character that represents a level, or undefined when the level has none.
 * Pairing is by position, so it stays stable between sessions as long as the
 * cast is fetched in a stable order (it is, ordered by name).
 */
export function characterForLevel(
  level: number,
  characters: MurdokuCharacter[],
): MurdokuCharacter | undefined {
  if (level < 1 || level === LEVEL_WITHOUT_CHARACTER) return undefined;
  return characters[level - 1];
}

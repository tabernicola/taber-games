/** Difficulty tiers from The Genius Square (Smart Games / Salim Berghiche). */
export type SquareLevelId = "starter" | "junior" | "expert" | "master" | "wizard";

export interface SquareLevelDef {
  id: SquareLevelId;
  /** 1-indexed tier shown to the player. */
  tier: number;
  /** Piece numbers (1–9) that may not share a side with each other. */
  restrictedPieces: number[];
}

/** Order matches the official rule sheet: Starter → Junior → Expert → Master → Wizard. */
export const SQUARE_LEVELS: SquareLevelDef[] = [
  { id: "starter", tier: 1, restrictedPieces: [] },
  { id: "junior", tier: 2, restrictedPieces: [1, 2] },
  { id: "expert", tier: 3, restrictedPieces: [1, 2, 3] },
  { id: "master", tier: 4, restrictedPieces: [2, 3, 4] },
  { id: "wizard", tier: 5, restrictedPieces: [1, 2, 3, 4] },
];

export function getLevel(id: SquareLevelId): SquareLevelDef {
  return SQUARE_LEVELS.find((l) => l.id === id) ?? SQUARE_LEVELS[0];
}

export function nextLevelId(id: SquareLevelId): SquareLevelId | null {
  const idx = SQUARE_LEVELS.findIndex((l) => l.id === id);
  return idx >= 0 && idx < SQUARE_LEVELS.length - 1 ? SQUARE_LEVELS[idx + 1].id : null;
}

export function levelIndex(id: SquareLevelId): number {
  return SQUARE_LEVELS.findIndex((l) => l.id === id);
}

export function isRestrictedPiece(level: SquareLevelDef, pieceNumber: number): boolean {
  return level.restrictedPieces.includes(pieceNumber);
}

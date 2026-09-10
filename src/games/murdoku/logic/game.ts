export type CaseStatus = "draft" | "pending_review" | "approved" | "rejected";

export type Position = {
  row: number;
  col: number;
};

export type Room = {
  id: string;
  name: string;
  emoji?: string;
  cells: Position[];
};

export type Character = {
  id: string;
  name: string;
  emoji?: string;
  image?: string;
};

export type ClueType = "fact" | "elimination";

export type Clue = {
  id: string;
  text: string;
  type: ClueType;
};

export type Placement = {
  characterId: string;
  row: number;
  col: number;
};

export type Solution = {
  killerId: string;
  victimId: string;
  placements: Placement[];
};

export type CaseContent = {
  gridRows: number;
  gridCols: number;
  rooms: Room[];
  characters: Character[];
  solution: Solution;
  clues: Clue[];
};

export type MurdokuCase = {
  id: string;
  title: string;
  creator_id: string | null;
  status: CaseStatus;
  content: CaseContent;
  rejection_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Guess = {
  killerId: string;
  victimId: string;
};

export type GuessResult = {
  correct: boolean;
  killer: boolean;
  victim: boolean;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type SolvabilityResult = {
  solvable: boolean;
  reason: string;
};

export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function getRoomForCell(rooms: Room[], pos: Position): Room | undefined {
  return rooms.find((room) => room.cells.some((c) => c.row === pos.row && c.col === pos.col));
}

export function getPlacement(placements: Placement[], characterId: string): Placement | undefined {
  return placements.find((p) => p.characterId === characterId);
}

export function characterAtPosition(placements: Placement[], pos: Position): string[] {
  return placements.filter((p) => p.row === pos.row && p.col === pos.col).map((p) => p.characterId);
}

export function validateRooms(content: CaseContent): string[] {
  const errors: string[] = [];
  const { gridRows, gridCols, rooms } = content;

  if (gridRows <= 0 || gridCols <= 0) {
    errors.push("Grid dimensions must be positive");
    return errors;
  }

  const cellOwners = new Map<string, string[]>();
  for (const room of rooms) {
    if (room.cells.length === 0) {
      errors.push(`Room "${room.id}" has no cells`);
      continue;
    }
    for (const cell of room.cells) {
      if (cell.row < 0 || cell.row >= gridRows || cell.col < 0 || cell.col >= gridCols) {
        errors.push(`Room "${room.id}" has cell out of bounds: (${cell.row}, ${cell.col})`);
        continue;
      }
      const key = posKey(cell.row, cell.col);
      const owners = cellOwners.get(key) ?? [];
      owners.push(room.id);
      cellOwners.set(key, owners);
    }
  }

  for (const [key, owners] of cellOwners) {
    if (owners.length > 1) {
      errors.push(`Cell ${key} belongs to multiple rooms: ${owners.join(", ")}`);
    }
  }

  let uncovered = 0;
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      if (!cellOwners.has(posKey(r, c))) uncovered++;
    }
  }
  if (uncovered > 0) {
    errors.push(`${uncovered} cell(s) are not covered by any room`);
  }

  return errors;
}

export function uniqueIds(items: { id: string; name: string }[], label: string): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.push(item.id);
    }
    seen.add(item.id);
    if (!item.name.trim()) {
      errors.push(`${label} "${item.id}" has an empty name`);
    }
  }
  if (duplicates.length > 0) {
    errors.push(`${label} has duplicate IDs: ${duplicates.join(", ")}`);
  }
  return errors;
}

export function validateSolution(content: CaseContent): ValidationResult {
  const errors: string[] = [];
  const { rooms, characters, solution } = content;

  errors.push(...uniqueIds(characters, "Character"));
  errors.push(...validateRooms(content));

  if (characters.length === 0) errors.push("Need at least one character");
  if (rooms.length === 0) errors.push("Need at least one room");
  if (content.clues.length === 0) errors.push("Need at least one clue");

  const charIds = new Set(characters.map((c) => c.id));
  if (!charIds.has(solution.killerId)) {
    errors.push(`Killer "${solution.killerId}" does not exist in characters list`);
  }
  if (!charIds.has(solution.victimId)) {
    errors.push(`Victim "${solution.victimId}" does not exist in characters list`);
  }
  if (solution.killerId === solution.victimId) {
    errors.push("Killer and victim must be different characters");
  }

  const placedIds = new Set<string>();
  for (const placement of solution.placements) {
    if (!charIds.has(placement.characterId)) {
      errors.push(`Placement references unknown character: ${placement.characterId}`);
      continue;
    }
    if (placement.row < 0 || placement.row >= content.gridRows) {
      errors.push(`Placement for "${placement.characterId}" has invalid row: ${placement.row}`);
    }
    if (placement.col < 0 || placement.col >= content.gridCols) {
      errors.push(`Placement for "${placement.characterId}" has invalid col: ${placement.col}`);
    }
    if (placedIds.has(placement.characterId)) {
      errors.push(`Character "${placement.characterId}" is placed more than once`);
    }
    placedIds.add(placement.characterId);
  }

  for (const character of characters) {
    if (!placedIds.has(character.id)) {
      errors.push(`Character "${character.id}" is missing from placements`);
    }
  }

  const killerPos = getPlacement(solution.placements, solution.killerId);
  const victimPos = getPlacement(solution.placements, solution.victimId);
  if (killerPos && victimPos) {
    if (killerPos.row !== victimPos.row || killerPos.col !== victimPos.col) {
      errors.push("Killer and victim must be in the same cell (the murder scene)");
    }
  }

  errors.push(...checkSudokuConstraints(content, solution.placements));

  return { valid: errors.length === 0, errors };
}

export function checkSudokuConstraints(content: CaseContent, placements: Placement[]): string[] {
  const errors: string[] = [];
  const { killerId, victimId } = content.solution ?? {
    killerId: "",
    victimId: "",
  };

  const byRow = new Map<string, Placement[]>();
  const byCol = new Map<string, Placement[]>();
  const byRoom = new Map<string, Placement[]>();

  for (const placement of placements) {
    const key = posKey(placement.row, placement.col);
    const isKillerOrVictim =
      placement.characterId === killerId || placement.characterId === victimId;

    const rowKey = `row:${placement.row}`;
    const colKey = `col:${placement.col}`;
    const room = getRoomForCell(content.rooms, {
      row: placement.row,
      col: placement.col,
    });
    const roomKey = `room:${room?.id ?? "unknown"}`;

    const addToGroup = (map: Map<string, Placement[]>, groupKey: string) => {
      const group = map.get(groupKey) ?? [];
      group.push(placement);
      map.set(groupKey, group);
    };

    addToGroup(byRow, rowKey);
    addToGroup(byCol, colKey);
    addToGroup(byRoom, roomKey);
  }

  const checkGroup = (label: string, groups: Map<string, Placement[]>): void => {
    for (const [key, group] of groups) {
      if (group.length > 1) {
        const areKillerVictim =
          group.length === 2 &&
          group.every((p) => p.characterId === killerId || p.characterId === victimId);
        if (!areKillerVictim) {
          const names = group.map((p) => p.characterId).join(", ");
          errors.push(
            `${label} ${key} has ${group.length} characters: ${names} (max 1 allowed, except killer+victim)`,
          );
        }
      }
    }
  };

  checkGroup("Row", byRow);
  checkGroup("Column", byCol);
  checkGroup("Room", byRoom);

  return errors;
}

export function checkGuess(guess: Guess, solution: Solution): GuessResult {
  const killer = guess.killerId === solution.killerId;
  const victim = guess.victimId === solution.victimId;
  return {
    correct: killer && victim,
    killer,
    victim,
  };
}

export function isCaseSolvable(content: CaseContent): SolvabilityResult {
  const validation = validateSolution(content);
  if (!validation.valid) {
    return { solvable: false, reason: validation.errors.join("; ") };
  }

  if (content.clues.length === 0) {
    return { solvable: false, reason: "Case has no clues" };
  }

  const seenClueIds = new Set<string>();
  for (const clue of content.clues) {
    if (seenClueIds.has(clue.id)) {
      return { solvable: false, reason: `Duplicate clue ID: ${clue.id}` };
    }
    seenClueIds.add(clue.id);
    if (!clue.text.trim()) {
      return { solvable: false, reason: `Clue "${clue.id}" has empty text` };
    }
  }

  if (content.characters.length < 3) {
    return { solvable: false, reason: "Need at least 3 characters" };
  }

  return { solvable: true, reason: "" };
}

export function buildEmptyGrid(rows: number, cols: number): Position[] {
  const cells: Position[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: r, col: c });
    }
  }
  return cells;
}

export function createDefaultRooms(
  gridRows: number,
  gridCols: number,
  roomRows: number,
  roomCols: number,
): Room[] {
  const rooms: Room[] = [];
  let roomIndex = 0;
  for (let r = 0; r < gridRows; r += roomRows) {
    for (let c = 0; c < gridCols; c += roomCols) {
      const cells: Position[] = [];
      for (let dr = 0; dr < roomRows; dr++) {
        for (let dc = 0; dc < roomCols; dc++) {
          const row = r + dr;
          const col = c + dc;
          if (row < gridRows && col < gridCols) {
            cells.push({ row, col });
          }
        }
      }
      rooms.push({
        id: `room-${roomIndex}`,
        name: `Room ${roomIndex + 1}`,
        cells,
      });
      roomIndex++;
    }
  }
  return rooms;
}

export const DEFAULT_CASE_CONTENT: CaseContent = {
  gridRows: 0,
  gridCols: 0,
  rooms: [],
  characters: [],
  solution: { killerId: "", victimId: "", placements: [] },
  clues: [],
};

export function createEmptyCase(title: string): MurdokuCase {
  return {
    id: "",
    title,
    creator_id: null,
    status: "draft",
    content: { ...DEFAULT_CASE_CONTENT },
    rejection_note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

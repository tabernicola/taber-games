import { ETERNITY2_ORIGINAL_PIECES, ETERNITY2_CLUE } from "./pieces-original";

export type Edges = readonly [number, number, number, number]; // top, right, bottom, left
export type Rotation = 0 | 1 | 2 | 3;

export type Tile = {
  id: number;
  edges: Edges;
};

export type Placement = {
  tileId: number;
  rotation: Rotation;
  locked: boolean;
} | null;

export type Level = {
  size: number;
  tiles: Tile[];
  /** cells that start already filled and cannot be moved */
  fixed: { index: number; tileId: number; rotation: Rotation }[];
  /** true for the original, published Eternity II puzzle */
  original: boolean;
  /** known solution per cell (absent for the original 16x16 board) */
  solution?: { tileId: number; rotation: Rotation }[];
  /** corners that have been hinted by the user (for tracking penalties) */
  hintedCorners?: number[];
};

export const LEVELS = [4, 6, 8, 12, 16] as const;
export type LevelSize = (typeof LEVELS)[number];

/** Edges of a tile after rotating it "r" quarter turns clockwise. */
export function rotate(edges: Edges, r: Rotation): Edges {
  return [
    edges[(0 - r + 4) % 4],
    edges[(1 - r + 4) % 4],
    edges[(2 - r + 4) % 4],
    edges[(3 - r + 4) % 4],
  ] as const;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PATTERN_COUNT: Record<number, number> = { 4: 4, 6: 6, 8: 9, 12: 14 };

/** Builds a guaranteed-solvable random board of the given size. */
function generateRandomLevel(size: number): Level {
  const k = PATTERN_COUNT[size] ?? 10;
  const rnd = () => 1 + Math.floor(Math.random() * k);

  // horizontal seams between row r and r+1, vertical seams between col c and c+1
  const h: number[][] = Array.from({ length: size - 1 }, () => Array.from({ length: size }, rnd));
  const v: number[][] = Array.from({ length: size }, () => Array.from({ length: size - 1 }, rnd));

  const solved: Edges[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      solved.push([
        r === 0 ? 0 : h[r - 1][c],
        c === size - 1 ? 0 : v[r][c],
        r === size - 1 ? 0 : h[r][c],
        c === 0 ? 0 : v[r][c - 1],
      ] as const);
    }
  }

  // tiles are handed to the player already rotated and shuffled
  const shuffled = shuffle(
    solved.map((_edges, cell) => ({ cell, r: Math.floor(Math.random() * 4) as Rotation })),
  );
  const tiles: Tile[] = shuffled.map((s, i) => ({ id: i, edges: rotate(solved[s.cell], s.r) }));

  const solution: { tileId: number; rotation: Rotation }[] = new Array(size * size);
  shuffled.forEach((s, i) => {
    solution[s.cell] = { tileId: i, rotation: ((4 - s.r) % 4) as Rotation };
  });

  // Center position
  const centerPos = Math.floor(size / 2) * size + Math.floor(size / 2);

  // Build fixed pieces array - only center piece as initial hint
  const fixed: { index: number; tileId: number; rotation: Rotation }[] = [];

  // Add centerpiece as hint
  const centerTile = shuffled.find((s) => s.cell === centerPos);
  if (centerTile) {
    const tileId = shuffled.indexOf(centerTile);
    fixed.push({
      index: centerPos,
      tileId,
      rotation: ((4 - centerTile.r) % 4) as Rotation,
    });
  }

  return { size, tiles, fixed, original: false, solution, hintedCorners: [] };
}

/** The one and only original Eternity II board: fixed 256-piece set + published clue. */
function originalLevel(): Level {
  const tiles: Tile[] = ETERNITY2_ORIGINAL_PIECES.map((edges, i) => ({
    id: i,
    edges: edges as Edges,
  }));
  return {
    size: 16,
    tiles,
    fixed: [
      {
        index: ETERNITY2_CLUE.row * 16 + ETERNITY2_CLUE.col,
        tileId: ETERNITY2_CLUE.pieceIndex,
        rotation: ETERNITY2_CLUE.rotation as Rotation,
      },
    ],
    original: true,
    hintedCorners: [],
  };
}

export function createLevel(size: LevelSize): Level {
  return size === 16 ? originalLevel() : generateRandomLevel(size);
}

/** Get corner positions and their solution for hint system */
export function getCornerHints(
  level: Level,
): { index: number; tileId: number; rotation: Rotation }[] {
  if (!level.solution || level.size === 16) return [];

  const size = level.size;
  const cornerPositions = [
    0, // top-left
    size - 1, // top-right
    size * (size - 1), // bottom-left
    size * size - 1, // bottom-right
  ];

  const hintedSet = new Set(level.hintedCorners || []);

  return cornerPositions
    .filter((pos) => !hintedSet.has(pos))
    .map((pos) => ({
      index: pos,
      tileId: level.solution![pos].tileId,
      rotation: level.solution![pos].rotation,
    }));
}

export function emptyBoard(level: Level): Placement[] {
  const board: Placement[] = Array.from({ length: level.size * level.size }, () => null);
  for (const f of level.fixed) {
    board[f.index] = { tileId: f.tileId, rotation: f.rotation, locked: true };
  }
  return board;
}

export function edgesAt(level: Level, p: Placement): Edges | null {
  if (!p) return null;
  return rotate(level.tiles[p.tileId].edges, p.rotation);
}

/** Seams around `index` that clash for a tile showing edges `e` there. */
function edgeConflicts(level: Level, board: Placement[], index: number, e: Edges): number {
  const n = level.size;
  const r = Math.floor(index / n);
  const c = index % n;
  let bad = 0;

  // outer frame: edge facing outside must be the gray border pattern (0)
  if ((r === 0) !== (e[0] === 0)) bad++;
  if ((c === n - 1) !== (e[1] === 0)) bad++;
  if ((r === n - 1) !== (e[2] === 0)) bad++;
  if ((c === 0) !== (e[3] === 0)) bad++;

  const up = r > 0 ? edgesAt(level, board[index - n]) : null;
  if (up && up[2] !== e[0]) bad++;
  const right = c < n - 1 ? edgesAt(level, board[index + 1]) : null;
  if (right && right[3] !== e[1]) bad++;
  const down = r < n - 1 ? edgesAt(level, board[index + n]) : null;
  if (down && down[0] !== e[2]) bad++;
  const left = c > 0 ? edgesAt(level, board[index - 1]) : null;
  if (left && left[1] !== e[3]) bad++;

  return bad;
}

/**
 * Number of seams around a cell that clash with an already placed neighbor
 * (or with the outer frame). 0 means the tile sits legally where it is.
 */
export function conflictsAt(level: Level, board: Placement[], index: number): number {
  const e = edgesAt(level, board[index]);
  return e ? edgeConflicts(level, board, index, e) : 0;
}

export function totalConflicts(level: Level, board: Placement[]): number {
  let n = 0;
  for (let i = 0; i < board.length; i++) n += conflictsAt(level, board, i);
  return n;
}

export function isSolved(level: Level, board: Placement[]): boolean {
  return board.every(Boolean) && totalConflicts(level, board) === 0;
}

/** Highest score used for the original board: matching seams out of 480. */
export function matchedSeams(level: Level, board: Placement[]): { matched: number; total: number } {
  const n = level.size;
  const total = 2 * n * (n - 1);
  let matched = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const i = r * n + c;
      const e = edgesAt(level, board[i]);
      if (!e) continue;
      if (c < n - 1) {
        const right = edgesAt(level, board[i + 1]);
        if (right && right[3] === e[1]) matched++;
      }
      if (r < n - 1) {
        const down = edgesAt(level, board[i + n]);
        if (down && down[0] === e[2]) matched++;
      }
    }
  }
  return { matched, total };
}

/** Can a tile with these (already rotated) edges sit legally at `index`? */
export function fitsAt(level: Level, board: Placement[], index: number, e: Edges): boolean {
  return edgeConflicts(level, board, index, e) === 0;
}

/** Tiles from `tiles` that fit at `index`, with the first rotation that works. */
export function candidatesAt(
  level: Level,
  board: Placement[],
  index: number,
  tiles: Tile[],
): Map<number, Rotation> {
  const out = new Map<number, Rotation>();
  for (const tile of tiles) {
    for (let r = 0 as Rotation; r < 4; r = (r + 1) as Rotation) {
      if (fitsAt(level, board, index, rotate(tile.edges, r))) {
        out.set(tile.id, r);
        break;
      }
    }
  }
  return out;
}

/** Get all tile IDs that are currently placed on the board */
function getPlacedTileIds(board: Placement[]): Set<number> {
  const placed = new Set<number>();
  for (const p of board) {
    if (p) placed.add(p.tileId);
  }
  return placed;
}

/** Check if a position is a corner position */
function isCorner(index: number, size: number): boolean {
  const corners = [0, size - 1, size * (size - 1), size * size - 1];
  return corners.includes(index);
}

/** Check if a position is on the edge of the board */
function isEdge(index: number, size: number): boolean {
  const r = Math.floor(index / size);
  const c = index % size;
  return r === 0 || r === size - 1 || c === 0 || c === size - 1;
}

/** Get positions in the current layer (working from outside in) */
function getLayerPositions(size: number, layer: number): number[] {
  const positions: number[] = [];
  const start = layer;
  const end = size - 1 - layer;

  if (start > end) return positions;

  // Top edge (left to right)
  for (let c = start; c <= end; c++) {
    positions.push(start * size + c);
  }

  // Right edge (top to bottom, excluding corners)
  for (let r = start + 1; r < end; r++) {
    positions.push(r * size + end);
  }

  // Bottom edge (right to left, excluding corners)
  for (let c = end; c >= start; c--) {
    positions.push(end * size + c);
  }

  // Left edge (bottom to top, excluding corners)
  for (let r = end - 1; r > start; r--) {
    positions.push(r * size + start);
  }

  return positions;
}

/** Optimized CSP solver - uses MRV + Degree + LCV heuristics with AC-3 propagation and memoization */
export function* bruteForceSolver(
  level: Level,
  board: Placement[],
): Generator<{ board: Placement[]; index: number; placed: boolean }, boolean, unknown> {
  const size = level.size;
  const totalCells = size * size;
  const currentBoard = board.slice();
  const filledCells = new Set<number>();

  // Cache structures for optimization
  const candidatesCache = new Map<string, Map<number, Rotation>>();
  const visitedStates = new Set<string>();

  // Add locked cells to filled set
  for (let i = 0; i < currentBoard.length; i++) {
    if (currentBoard[i] && currentBoard[i]!.locked) {
      filledCells.add(i);
    }
  }

  // Precompute tile rarity for LCV heuristic
  function computeTileRarity(tiles: Tile[]): Map<number, number> {
    const edgeFrequency = new Map<number, number>();

    // Count edge pattern frequencies
    for (const tile of tiles) {
      for (const edge of tile.edges) {
        edgeFrequency.set(edge, (edgeFrequency.get(edge) || 0) + 1);
      }
    }

    // Compute rarity for each tile (sum of inverse frequencies)
    const rarity = new Map<number, number>();
    for (const tile of tiles) {
      let tileRarity = 0;
      for (const edge of tile.edges) {
        tileRarity += 1 / (edgeFrequency.get(edge) || 1);
      }
      rarity.set(tile.id, tileRarity);
    }

    return rarity;
  }

  const tileRarity = computeTileRarity(level.tiles);

  // Find closest corner to hint
  function findClosestCornerToHint(): number {
    if (level.fixed.length === 0) return 0; // Default to top-left if no hint

    const hintIndex = level.fixed[0].index;
    const hintRow = Math.floor(hintIndex / size);
    const hintCol = hintIndex % size;

    const corners = [
      { index: 0, row: 0, col: 0 }, // top-left
      { index: size - 1, row: 0, col: size - 1 }, // top-right
      { index: size * (size - 1), row: size - 1, col: 0 }, // bottom-left
      { index: size * size - 1, row: size - 1, col: size - 1 }, // bottom-right
    ];

    let closest = corners[0];
    let minDistance = Math.abs(hintRow - closest.row) + Math.abs(hintCol - closest.col);

    for (const corner of corners) {
      const distance = Math.abs(hintRow - corner.row) + Math.abs(hintCol - corner.col);
      if (distance < minDistance) {
        minDistance = distance;
        closest = corner;
      }
    }

    return closest.index;
  }

  // Get adjacent empty cells to a filled cell
  function getAdjacentEmptyCells(filledIndex: number): number[] {
    const row = Math.floor(filledIndex / size);
    const col = filledIndex % size;
    const adjacent: number[] = [];

    // Check all 4 directions
    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 }, // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 }, // right
    ];

    for (const { dr, dc } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const newIndex = newRow * size + newCol;
        if (!currentBoard[newIndex] || !currentBoard[newIndex]!.locked) {
          adjacent.push(newIndex);
        }
      }
    }

    return adjacent;
  }

  // Check if a cell has at least one adjacent piece
  function hasAdjacentPiece(index: number): boolean {
    const row = Math.floor(index / size);
    const col = index % size;

    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 }, // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 }, // right
    ];

    for (const { dr, dc } of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const adjIndex = newRow * size + newCol;
        if (currentBoard[adjIndex]) {
          return true; // Has at least one adjacent piece
        }
      }
    }

    return false; // No adjacent pieces
  }

  // Count empty neighbors (for degree heuristic)
  function countEmptyNeighbors(cell: number): number {
    const adjacent = getAdjacentEmptyCells(cell);
    return adjacent.filter((c) => !filledCells.has(c)).length;
  }

  // Get cached candidates with memoization
  function getCachedCandidates(cell: number, tiles: Tile[]): Map<number, Rotation> {
    const cacheKey = `${cell}-${tiles
      .map((t) => t.id)
      .sort()
      .join(",")}`;
    if (candidatesCache.has(cacheKey)) {
      return candidatesCache.get(cacheKey)!;
    }

    const candidates = candidatesAt(level, currentBoard, cell, tiles);
    candidatesCache.set(cacheKey, candidates);
    return candidates;
  }

  // Get state signature for memoization
  function getStateSignature(): string {
    return currentBoard.map((p) => (p ? `${p.tileId}-${p.rotation}` : "null")).join("|");
  }

  // Count how constrained neighbors would be by placing a tile (LCV heuristic)
  function countConstrainedNeighbors(cell: number, tile: Tile, availableTiles: Tile[]): number {
    let constrainedCount = 0;
    const tempBoard = currentBoard.slice();
    tempBoard[cell] = { tileId: tile.id, rotation: 0, locked: false };

    const adjacent = getAdjacentEmptyCells(cell);
    for (const adjCell of adjacent) {
      if (filledCells.has(adjCell)) continue;

      const candidatesBefore = countCandidates(adjCell, availableTiles);
      const remainingTiles = availableTiles.filter((t) => t.id !== tile.id);
      const candidatesAfter = countCandidates(adjCell, remainingTiles);

      if (candidatesAfter < candidatesBefore) {
        constrainedCount += candidatesBefore - candidatesAfter;
      }
    }

    return constrainedCount;
  }

  // Order tiles by LCV (least constraining first)
  function orderTilesByLCV(cell: number, tiles: Tile[]): Tile[] {
    return tiles.slice().sort((a, b) => {
      const constrainingA = countConstrainedNeighbors(cell, a, tiles);
      const constrainingB = countConstrainedNeighbors(cell, b, tiles);
      return constrainingA - constrainingB; // Less constraining first
    });
  }

  // Check if the current board state is consistent (forward checking)
  function isConsistent(availableTiles: Tile[]): boolean {
    // Check all empty cells that have adjacent pieces
    for (let i = 0; i < currentBoard.length; i++) {
      // Skip if already filled or locked
      if (currentBoard[i]) continue;

      // Skip if no adjacent pieces (not relevant yet)
      if (!hasAdjacentPiece(i)) continue;

      // Check if at least one tile can fit here
      let hasValidOption = false;
      for (const tile of availableTiles) {
        for (let r = 0 as Rotation; r < 4; r = (r + 1) as Rotation) {
          if (fitsAt(level, currentBoard, i, rotate(tile.edges, r))) {
            hasValidOption = true;
            break;
          }
        }
        if (hasValidOption) break;
      }

      // If no tile can fit, this state is inconsistent
      if (!hasValidOption) return false;
    }

    return true; // All relevant cells have at least one valid option
  }

  // AC-3 constraint propagation (simplified for edge matching)
  function maintainArcConsistency(availableTiles: Tile[]): boolean {
    const queue: { cell: number; neighbor: number }[] = [];

    // Initialize queue with all cell-neighbor pairs where at least one is filled
    for (const filledIndex of filledCells) {
      const adjacent = getAdjacentEmptyCells(filledIndex);
      for (const cell of adjacent) {
        queue.push({ cell, neighbor: filledIndex });
      }
    }

    // Process queue
    while (queue.length > 0) {
      const { cell, neighbor } = queue.shift()!;

      // Skip if cell is now filled
      if (currentBoard[cell]) continue;

      // Check if this cell still has valid options
      let hasValidOption = false;
      for (const tile of availableTiles) {
        for (let r = 0 as Rotation; r < 4; r = (r + 1) as Rotation) {
          if (fitsAt(level, currentBoard, cell, rotate(tile.edges, r))) {
            hasValidOption = true;
            break;
          }
        }
        if (hasValidOption) break;
      }

      if (!hasValidOption) {
        return false; // Arc inconsistency detected
      }
    }

    return true; // All arcs are consistent
  }

  // Count how many tiles can fit in a cell
  function countCandidates(index: number, availableTiles: Tile[]): number {
    let count = 0;
    for (const tile of availableTiles) {
      for (let r = 0 as Rotation; r < 4; r = (r + 1) as Rotation) {
        if (fitsAt(level, currentBoard, index, rotate(tile.edges, r))) {
          count++;
          break; // Count each tile once (any rotation)
        }
      }
    }
    return count;
  }

  // Select next cell using MRV + Degree heuristic
  function selectNextCellMRV(availableTiles: Tile[]): number | null {
    let bestCell: number | null = null;
    let minCandidates = Infinity;
    let maxDegree = -1;

    // Check all cells adjacent to already filled cells
    for (const filledIndex of filledCells) {
      const adjacent = getAdjacentEmptyCells(filledIndex);

      for (const cell of adjacent) {
        if (filledCells.has(cell)) continue; // Skip already filled

        const candidates = countCandidates(cell, availableTiles);

        // MRV: minimum candidates
        if (candidates < minCandidates && candidates > 0) {
          minCandidates = candidates;
          maxDegree = countEmptyNeighbors(cell);
          bestCell = cell;
        }
        // Degree heuristic: break ties with higher degree
        else if (candidates === minCandidates && candidates > 0) {
          const degree = countEmptyNeighbors(cell);
          if (degree > maxDegree) {
            maxDegree = degree;
            bestCell = cell;
          }
        }
      }
    }

    return bestCell;
  }

  // Enhanced recursive solver with MRV + Degree + LCV + memoization
  function* solveRecursive(
    availableTiles: Tile[],
  ): Generator<{ board: Placement[]; index: number; placed: boolean }, boolean, unknown> {
    // Check for memoized states
    const stateSignature = getStateSignature();
    if (visitedStates.has(stateSignature)) {
      return false; // Already explored this state
    }
    visitedStates.add(stateSignature);

    // Check if solved
    if (filledCells.size === totalCells) return true;

    // Select next cell with MRV + Degree heuristic
    const nextCell = selectNextCellMRV(availableTiles);
    if (nextCell === null) return false;

    // Get candidates with caching
    const candidates = getCachedCandidates(nextCell, availableTiles);
    if (candidates.size === 0) return false;

    // Order tiles by LCV (least constraining first)
    const orderedTiles = orderTilesByLCV(nextCell, availableTiles);

    // Try each tile in LCV order
    for (const tile of orderedTiles) {
      const rotation = candidates.get(tile.id);
      if (rotation === undefined) continue;

      const rotatedEdges = rotate(tile.edges, rotation);

      if (fitsAt(level, currentBoard, nextCell, rotatedEdges)) {
        // Place the tile
        currentBoard[nextCell] = { tileId: tile.id, rotation, locked: false };
        filledCells.add(nextCell);
        const remainingTiles = availableTiles.filter((t) => t.id !== tile.id);

        yield { board: currentBoard.slice(), index: nextCell, placed: true };

        // Forward checking: verify consistency after placement
        if (isConsistent(remainingTiles)) {
          // Only recurse if state is still consistent
          if (yield* solveRecursive(remainingTiles)) return true;
        }

        // Backtrack
        currentBoard[nextCell] = null;
        filledCells.delete(nextCell);
        yield { board: currentBoard.slice(), index: nextCell, placed: false };
      }
    }

    return false;
  }

  // Get initial available tiles
  const placedIds = getPlacedTileIds(currentBoard);
  let availableTiles = level.tiles.filter((tile) => !placedIds.has(tile.id));

  // Sort initial tiles by rarity (rarest first)
  availableTiles = availableTiles.sort((a, b) => {
    const rarityA = tileRarity.get(a.id) || 0;
    const rarityB = tileRarity.get(b.id) || 0;
    return rarityB - rarityA; // Rarest first
  });

  // Start from the closest corner if it's empty
  const startCorner = findClosestCornerToHint();

  if (!currentBoard[startCorner] || !currentBoard[startCorner]!.locked) {
    // Get candidates for start corner with caching
    const startCandidates = getCachedCandidates(startCorner, availableTiles);

    // Order tiles by LCV for initial placement
    const orderedTiles = orderTilesByLCV(startCorner, availableTiles);

    for (const tile of orderedTiles) {
      const rotation = startCandidates.get(tile.id);
      if (rotation === undefined) continue;

      const rotatedEdges = rotate(tile.edges, rotation);

      if (fitsAt(level, currentBoard, startCorner, rotatedEdges)) {
        currentBoard[startCorner] = { tileId: tile.id, rotation, locked: false };
        filledCells.add(startCorner);
        const remainingTiles = availableTiles.filter((t) => t.id !== tile.id);

        yield { board: currentBoard.slice(), index: startCorner, placed: true };

        // Forward checking: verify consistency after placement
        if (isConsistent(remainingTiles)) {
          if (yield* solveRecursive(remainingTiles)) return true;
        }

        currentBoard[startCorner] = null;
        filledCells.delete(startCorner);
        yield { board: currentBoard.slice(), index: startCorner, placed: false };
      }
    }
  } else {
    filledCells.add(startCorner);
    if (yield* solveRecursive(availableTiles)) return true;
    filledCells.delete(startCorner);
  }

  return false;
}

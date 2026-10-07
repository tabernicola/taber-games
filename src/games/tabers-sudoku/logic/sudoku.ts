// Classic 9x9 sudoku where digits are replaced by the 9 Murdoku characters.
// Values are 0..8 (index into the character list); null means empty.

export type SudokuLevel = "easy" | "medium" | "hard" | "expert";

export const SUDOKU_LEVELS: SudokuLevel[] = ["easy", "medium", "hard", "expert"];

/** Number of pre-filled cells per difficulty. */
const GIVENS: Record<SudokuLevel, number> = {
  easy: 42,
  medium: 34,
  hard: 28,
  expert: 24,
};

export type SudokuPuzzle = {
  level: SudokuLevel;
  /** 81 cells, null = empty */
  puzzle: (number | null)[];
  /** 81 cells, fully solved */
  solution: number[];
  /** indices that came pre-filled and cannot be changed */
  fixed: Set<number>;
};

export function boxOf(index: number): number {
  const row = Math.floor(index / 9);
  const col = index % 9;
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isAllowed(grid: (number | null)[], index: number, value: number): boolean {
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row * 9 + c] === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r * 9 + col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const i = r * 9 + c;
      if (i !== index && grid[i] === value) return false;
    }
  }
  return true;
}

function fill(grid: (number | null)[], pos: number, rand: () => number): boolean {
  if (pos === 81) return true;
  if (grid[pos] !== null) return fill(grid, pos + 1, rand);
  for (const value of shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rand)) {
    if (!isAllowed(grid, pos, value)) continue;
    grid[pos] = value;
    if (fill(grid, pos + 1, rand)) return true;
    grid[pos] = null;
  }
  return false;
}

/** Counts solutions, stopping as soon as `limit` is reached. */
export function countSolutions(grid: (number | null)[], limit = 2): number {
  const work = [...grid];
  let found = 0;

  const rec = (): void => {
    if (found >= limit) return;
    let best = -1;
    let bestOptions: number[] = [];
    for (let i = 0; i < 81; i++) {
      if (work[i] !== null) continue;
      const options: number[] = [];
      for (let v = 0; v < 9; v++) if (isAllowed(work, i, v)) options.push(v);
      if (options.length === 0) return;
      if (best === -1 || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        if (options.length === 1) break;
      }
    }
    if (best === -1) {
      found++;
      return;
    }
    for (const v of bestOptions) {
      work[best] = v;
      rec();
      work[best] = null;
      if (found >= limit) return;
    }
  };

  rec();
  return found;
}

export function generateSudoku(level: SudokuLevel, rand: () => number = Math.random): SudokuPuzzle {
  const solved: (number | null)[] = Array<number | null>(81).fill(null);
  fill(solved, 0, rand);
  const solution = solved as number[];

  const puzzle: (number | null)[] = [...solution];
  const target = GIVENS[level];
  
  // Eliminar celdas mientras maintaining unique solution
  for (const index of shuffle([...Array(81).keys()], rand)) {
    const filled = puzzle.filter((v) => v !== null).length;
    if (filled <= target) break;
    const backup = puzzle[index];
    puzzle[index] = null;
    if (countSolutions(puzzle, 2) !== 1) puzzle[index] = backup;
  }

  // Ajustar dificultad según técnicas necesarias con iteraciones múltiples
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    attempts++;
    const techniques = getRequiredTechniques(puzzle);
    
    // Verificar si el puzzle cumple con el nivel de dificultad
    const meetsDifficulty = checkDifficultyRequirements(level, techniques);
    
    if (meetsDifficulty) break;

    // Si no cumple, intentar eliminar más celdas
    const removed = removeMoreCells(puzzle, level, rand);
    if (!removed) break; // No se pueden eliminar más celdas
  }

  const fixed = new Set<number>();
  puzzle.forEach((v, i) => {
    if (v !== null) fixed.add(i);
  });

  return { level, puzzle, solution, fixed };
}

function checkDifficultyRequirements(level: SudokuLevel, techniques: RequiredTechniques): boolean {
  switch (level) {
    case "easy":
      // Easy: solo naked singles
      return techniques.naked && !techniques.hidden && !techniques.pairs;
    case "medium":
      // Medium: requiere hidden singles
      return techniques.naked && techniques.hidden && !techniques.pairs;
    case "hard":
      // Hard: requiere pairs
      return techniques.naked && techniques.hidden && techniques.pairs && !techniques.triples && !techniques.advanced;
    case "expert":
      // Expert: requiere técnicas avanzadas o triples
      return techniques.naked && techniques.hidden && techniques.pairs && 
             (techniques.triples || techniques.advanced || techniques.backtracking);
    default:
      return true;
  }
}

function removeMoreCells(puzzle: (number | null)[], level: SudokuLevel, rand: () => number): boolean {
  const minGivens = {
    easy: 40,
    medium: 32,
    hard: 26,
    expert: 22,
  };

  const currentGivens = puzzle.filter((v) => v !== null).length;
  if (currentGivens <= minGivens[level]) return false;

  for (const index of shuffle([...Array(81).keys()], rand)) {
    if (puzzle[index] === null) continue;
    const backup = puzzle[index];
    puzzle[index] = null;
    
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[index] = backup;
      continue;
    }

    const newGivens = puzzle.filter((v) => v !== null).length;
    if (newGivens <= minGivens[level]) {
      puzzle[index] = backup;
      return true; // Llegamos al mínimo, pero eliminamos al menos una celda
    }

    return true;
  }

  return false;
}

// Técnicas de resolución
type RequiredTechniques = {
  naked: boolean;      // Naked singles
  hidden: boolean;    // Hidden singles
  pairs: boolean;     // Naked/hidden pairs
  triples: boolean;   // Naked/hidden triples
  advanced: boolean;  // X-Wing, Swordfish, XY-Wing, etc.
  backtracking: boolean; // Requiere búsqueda trial-and-error
};

function getRequiredTechniques(grid: (number | null)[]): RequiredTechniques {
  const solver = new SudokuSolver(grid);
  const techniques: RequiredTechniques = {
    naked: false,
    hidden: false,
    pairs: false,
    triples: false,
    advanced: false,
    backtracking: false,
  };

  let progress = true;
  let iterations = 0;
  const maxIterations = 200;

  while (progress && iterations < maxIterations) {
    progress = false;
    iterations++;

    // Naked singles
    if (solver.applyNakedSingles()) {
      techniques.naked = true;
      progress = true;
      continue;
    }

    // Hidden singles
    if (solver.applyHiddenSingles()) {
      techniques.hidden = true;
      progress = true;
      continue;
    }

    // Naked pairs
    if (solver.applyNakedPairs()) {
      techniques.pairs = true;
      progress = true;
      continue;
    }

    // Hidden pairs
    if (solver.applyHiddenPairs()) {
      techniques.pairs = true;
      progress = true;
      continue;
    }

    // Naked triples
    if (solver.applyNakedTriples()) {
      techniques.triples = true;
      progress = true;
      continue;
    }

    // Hidden triples
    if (solver.applyHiddenTriples()) {
      techniques.triples = true;
      progress = true;
      continue;
    }

    // X-Wing
    if (solver.applyXWing()) {
      techniques.advanced = true;
      progress = true;
      continue;
    }

    // Swordfish
    if (solver.applySwordfish()) {
      techniques.advanced = true;
      progress = true;
      continue;
    }

    // XY-Wing
    if (solver.applyXYWing()) {
      techniques.advanced = true;
      progress = true;
      continue;
    }

    // Si llegamos aquí, necesitamos backtracking
    techniques.backtracking = true;
    break;
  }

  return techniques;
}

class SudokuSolver {
  private grid: (number | null)[];
  private candidates: Map<number, Set<number>>;

  constructor(grid: (number | null)[]) {
    this.grid = [...grid];
    this.candidates = new Map();
    this.calculateCandidates();
  }

  private calculateCandidates() {
    for (let i = 0; i < 81; i++) {
      if (this.grid[i] !== null) continue;
      const opts: Set<number> = new Set();
      for (let v = 0; v < 9; v++) {
        if (isAllowed(this.grid, i, v)) opts.add(v);
      }
      this.candidates.set(i, opts);
    }
  }

  private updateCandidates(index: number, value: number) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    // Remove value from candidates in same row, column, box
    for (let c = 0; c < 9; c++) {
      const i = row * 9 + c;
      if (this.candidates.has(i)) {
        this.candidates.get(i)!.delete(value);
      }
    }
    for (let r = 0; r < 9; r++) {
      const i = r * 9 + col;
      if (this.candidates.has(i)) {
        this.candidates.get(i)!.delete(value);
      }
    }
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        const i = r * 9 + c;
        if (this.candidates.has(i)) {
          this.candidates.get(i)!.delete(value);
        }
      }
    }
  }

  applyNakedSingles(): boolean {
    let progress = false;
    for (let i = 0; i < 81; i++) {
      if (this.grid[i] !== null) continue;
      const opts = this.candidates.get(i);
      if (opts && opts.size === 1) {
        const value = Array.from(opts)[0];
        this.grid[i] = value;
        this.updateCandidates(i, value);
        this.candidates.delete(i);
        progress = true;
      }
    }
    return progress;
  }

  applyHiddenSingles(): boolean {
    let progress = false;

    // Check rows
    for (let row = 0; row < 9; row++) {
      for (let v = 0; v < 9; v++) {
        const candidates: number[] = [];
        for (let col = 0; col < 9; col++) {
          const i = row * 9 + col;
          if (this.grid[i] === null && this.candidates.get(i)?.has(v)) {
            candidates.push(i);
          }
        }
        if (candidates.length === 1) {
          this.grid[candidates[0]] = v;
          this.updateCandidates(candidates[0], v);
          this.candidates.delete(candidates[0]);
          progress = true;
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      for (let v = 0; v < 9; v++) {
        const candidates: number[] = [];
        for (let row = 0; row < 9; row++) {
          const i = row * 9 + col;
          if (this.grid[i] === null && this.candidates.get(i)?.has(v)) {
            candidates.push(i);
          }
        }
        if (candidates.length === 1) {
          this.grid[candidates[0]] = v;
          this.updateCandidates(candidates[0], v);
          this.candidates.delete(candidates[0]);
          progress = true;
        }
      }
    }

    // Check boxes
    for (let box = 0; box < 9; box++) {
      for (let v = 0; v < 9; v++) {
        const candidates: number[] = [];
        const boxRow = Math.floor(box / 3) * 3;
        const boxCol = (box % 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            const i = r * 9 + c;
            if (this.grid[i] === null && this.candidates.get(i)?.has(v)) {
              candidates.push(i);
            }
          }
        }
        if (candidates.length === 1) {
          this.grid[candidates[0]] = v;
          this.updateCandidates(candidates[0], v);
          this.candidates.delete(candidates[0]);
          progress = true;
        }
      }
    }

    return progress;
  }

  applyNakedPairs(): boolean {
    let progress = false;

    // Check rows
    for (let row = 0; row < 9; row++) {
      const emptyCells: number[] = [];
      for (let col = 0; col < 9; col++) {
        const i = row * 9 + col;
        if (this.grid[i] === null) emptyCells.push(i);
      }

      for (let i = 0; i < emptyCells.length; i++) {
        for (let j = i + 1; j < emptyCells.length; j++) {
          const opts1 = this.candidates.get(emptyCells[i]);
          const opts2 = this.candidates.get(emptyCells[j]);
          if (!opts1 || !opts2 || opts1.size !== 2 || opts2.size !== 2) continue;

          const arr1 = Array.from(opts1);
          const arr2 = Array.from(opts2);
          if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
            // Naked pair found - remove these options from other cells
            for (const cell of emptyCells) {
              if (cell !== emptyCells[i] && cell !== emptyCells[j]) {
                const cellOpts = this.candidates.get(cell);
                if (cellOpts) {
                  for (const opt of arr1) {
                    if (cellOpts.has(opt)) {
                      cellOpts.delete(opt);
                      progress = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Check columns and boxes similarly
    progress = progress || this.applyNakedPairsCols() || this.applyNakedPairsBoxes();

    return progress;
  }

  private applyNakedPairsCols(): boolean {
    let progress = false;
    for (let col = 0; col < 9; col++) {
      const emptyCells: number[] = [];
      for (let row = 0; row < 9; row++) {
        const i = row * 9 + col;
        if (this.grid[i] === null) emptyCells.push(i);
      }

      for (let i = 0; i < emptyCells.length; i++) {
        for (let j = i + 1; j < emptyCells.length; j++) {
          const opts1 = this.candidates.get(emptyCells[i]);
          const opts2 = this.candidates.get(emptyCells[j]);
          if (!opts1 || !opts2 || opts1.size !== 2 || opts2.size !== 2) continue;

          const arr1 = Array.from(opts1);
          const arr2 = Array.from(opts2);
          if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
            for (const cell of emptyCells) {
              if (cell !== emptyCells[i] && cell !== emptyCells[j]) {
                const cellOpts = this.candidates.get(cell);
                if (cellOpts) {
                  for (const opt of arr1) {
                    if (cellOpts.has(opt)) {
                      cellOpts.delete(opt);
                      progress = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return progress;
  }

  private applyNakedPairsBoxes(): boolean {
    let progress = false;
    for (let box = 0; box < 9; box++) {
      const emptyCells: number[] = [];
      const boxRow = Math.floor(box / 3) * 3;
      const boxCol = (box % 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          const i = r * 9 + c;
          if (this.grid[i] === null) emptyCells.push(i);
        }
      }

      for (let i = 0; i < emptyCells.length; i++) {
        for (let j = i + 1; j < emptyCells.length; j++) {
          const opts1 = this.candidates.get(emptyCells[i]);
          const opts2 = this.candidates.get(emptyCells[j]);
          if (!opts1 || !opts2 || opts1.size !== 2 || opts2.size !== 2) continue;

          const arr1 = Array.from(opts1);
          const arr2 = Array.from(opts2);
          if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
            for (const cell of emptyCells) {
              if (cell !== emptyCells[i] && cell !== emptyCells[j]) {
                const cellOpts = this.candidates.get(cell);
                if (cellOpts) {
                  for (const opt of arr1) {
                    if (cellOpts.has(opt)) {
                      cellOpts.delete(opt);
                      progress = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return progress;
  }

  applyHiddenPairs(): boolean {
    let progress = false;

    // Check rows for hidden pairs
    for (let row = 0; row < 9; row++) {
      for (let v1 = 0; v1 < 9; v1++) {
        for (let v2 = v1 + 1; v2 < 9; v2++) {
          const cellsWithBoth: number[] = [];
          for (let col = 0; col < 9; col++) {
            const i = row * 9 + col;
            if (this.grid[i] === null) {
              const opts = this.candidates.get(i);
              if (opts && opts.has(v1) && opts.has(v2)) {
                cellsWithBoth.push(i);
              }
            }
          }
          if (cellsWithBoth.length === 2) {
            // Hidden pair found - remove other candidates from these cells
            for (const cell of cellsWithBoth) {
              const opts = this.candidates.get(cell);
              if (opts) {
                for (const opt of Array.from(opts)) {
                  if (opt !== v1 && opt !== v2) {
                    opts.delete(opt);
                    progress = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    progress = progress || this.applyHiddenPairsCols() || this.applyHiddenPairsBoxes();
    return progress;
  }

  private applyHiddenPairsCols(): boolean {
    let progress = false;
    for (let col = 0; col < 9; col++) {
      for (let v1 = 0; v1 < 9; v1++) {
        for (let v2 = v1 + 1; v2 < 9; v2++) {
          const cellsWithBoth: number[] = [];
          for (let row = 0; row < 9; row++) {
            const i = row * 9 + col;
            if (this.grid[i] === null) {
              const opts = this.candidates.get(i);
              if (opts && opts.has(v1) && opts.has(v2)) {
                cellsWithBoth.push(i);
              }
            }
          }
          if (cellsWithBoth.length === 2) {
            for (const cell of cellsWithBoth) {
              const opts = this.candidates.get(cell);
              if (opts) {
                for (const opt of Array.from(opts)) {
                  if (opt !== v1 && opt !== v2) {
                    opts.delete(opt);
                    progress = true;
                  }
                }
              }
            }
          }
        }
      }
    }
    return progress;
  }

  private applyHiddenPairsBoxes(): boolean {
    let progress = false;
    for (let box = 0; box < 9; box++) {
      for (let v1 = 0; v1 < 9; v1++) {
        for (let v2 = v1 + 1; v2 < 9; v2++) {
          const cellsWithBoth: number[] = [];
          const boxRow = Math.floor(box / 3) * 3;
          const boxCol = (box % 3) * 3;
          for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
              const i = r * 9 + c;
              if (this.grid[i] === null) {
                const opts = this.candidates.get(i);
                if (opts && opts.has(v1) && opts.has(v2)) {
                  cellsWithBoth.push(i);
                }
              }
            }
          }
          if (cellsWithBoth.length === 2) {
            for (const cell of cellsWithBoth) {
              const opts = this.candidates.get(cell);
              if (opts) {
                for (const opt of Array.from(opts)) {
                  if (opt !== v1 && opt !== v2) {
                    opts.delete(opt);
                    progress = true;
                  }
                }
              }
            }
          }
        }
      }
    }
    return progress;
  }

  applyNakedTriples(): boolean {
    let progress = false;

    // Check rows for naked triples
    for (let row = 0; row < 9; row++) {
      const emptyCells: number[] = [];
      for (let col = 0; col < 9; col++) {
        const i = row * 9 + col;
        if (this.grid[i] === null) emptyCells.push(i);
      }

      for (let i = 0; i < emptyCells.length; i++) {
        for (let j = i + 1; j < emptyCells.length; j++) {
          for (let k = j + 1; k < emptyCells.length; k++) {
            const opts1 = this.candidates.get(emptyCells[i]);
            const opts2 = this.candidates.get(emptyCells[j]);
            const opts3 = this.candidates.get(emptyCells[k]);
            if (!opts1 || !opts2 || !opts3) continue;

            const combined = new Set([...opts1, ...opts2, ...opts3]);
            if (combined.size === 3) {
              for (const cell of emptyCells) {
                if (cell !== emptyCells[i] && cell !== emptyCells[j] && cell !== emptyCells[k]) {
                  const cellOpts = this.candidates.get(cell);
                  if (cellOpts) {
                    for (const opt of combined) {
                      if (cellOpts.has(opt)) {
                        cellOpts.delete(opt);
                        progress = true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return progress;
  }

  applyHiddenTriples(): boolean {
    let progress = false;

    // Check rows for hidden triples
    for (let row = 0; row < 9; row++) {
      for (let v1 = 0; v1 < 9; v1++) {
        for (let v2 = v1 + 1; v2 < 9; v2++) {
          for (let v3 = v2 + 1; v3 < 9; v3++) {
            const cellsWithAll: number[] = [];
            for (let col = 0; col < 9; col++) {
              const i = row * 9 + col;
              if (this.grid[i] === null) {
                const opts = this.candidates.get(i);
                if (opts && opts.has(v1) && opts.has(v2) && opts.has(v3)) {
                  cellsWithAll.push(i);
                }
              }
            }
            if (cellsWithAll.length === 3) {
              for (const cell of cellsWithAll) {
                const opts = this.candidates.get(cell);
                if (opts) {
                  for (const opt of Array.from(opts)) {
                    if (opt !== v1 && opt !== v2 && opt !== v3) {
                      opts.delete(opt);
                      progress = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return progress;
  }

  applyXWing(): boolean {
    let progress = false;

    // X-Wing in rows
    for (let value = 0; value < 9; value++) {
      const rowsWithTwo: number[][] = [];
      for (let row = 0; row < 9; row++) {
        const cols: number[] = [];
        for (let col = 0; col < 9; col++) {
          const i = row * 9 + col;
          if (this.grid[i] === null && this.candidates.get(i)?.has(value)) {
            cols.push(col);
          }
        }
        if (cols.length === 2) {
          rowsWithTwo.push([row, cols[0], cols[1]]);
        }
      }

      // Find X-Wing pattern
      for (let i = 0; i < rowsWithTwo.length; i++) {
        for (let j = i + 1; j < rowsWithTwo.length; j++) {
          const [row1, col1a, col1b] = rowsWithTwo[i];
          const [row2, col2a, col2b] = rowsWithTwo[j];
          if ((col1a === col2a && col1b === col2b) || (col1a === col2b && col1b === col2a)) {
            // X-Wing found - remove value from other cells in these columns
            const cols = [col1a, col1b];
            for (const col of cols) {
              for (let r = 0; r < 9; r++) {
                if (r !== row1 && r !== row2) {
                  const i = r * 9 + col;
                  const opts = this.candidates.get(i);
                  if (opts && opts.has(value)) {
                    opts.delete(value);
                    progress = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    return progress;
  }

  applySwordfish(): boolean {
    let progress = false;

    // Swordfish in rows (similar to X-Wing but with 3 rows/cols)
    for (let value = 0; value < 9; value++) {
      const rowsWithCandidates: Map<number, number[]> = new Map();
      for (let row = 0; row < 9; row++) {
        const cols: number[] = [];
        for (let col = 0; col < 9; col++) {
          const i = row * 9 + col;
          if (this.grid[i] === null && this.candidates.get(i)?.has(value)) {
            cols.push(col);
          }
        }
        if (cols.length >= 2 && cols.length <= 3) {
          rowsWithCandidates.set(row, cols);
        }
      }

      const rows = Array.from(rowsWithCandidates.keys());
      if (rows.length < 3) continue;

      // Check all combinations of 3 rows
      for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
          for (let k = j + 1; k < rows.length; k++) {
            const combinedCols = new Set([
              ...rowsWithCandidates.get(rows[i])!,
              ...rowsWithCandidates.get(rows[j])!,
              ...rowsWithCandidates.get(rows[k])!,
            ]);
            if (combinedCols.size === 3) {
              // Swordfish found - remove value from other cells in these columns
              for (const col of combinedCols) {
                for (let r = 0; r < 9; r++) {
                  if (r !== rows[i] && r !== rows[j] && r !== rows[k]) {
                    const cell = r * 9 + col;
                    const opts = this.candidates.get(cell);
                    if (opts && opts.has(value)) {
                      opts.delete(value);
                      progress = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return progress;
  }

  applyXYWing(): boolean {
    let progress = false;

    // Find pivot cell with exactly 2 candidates
    for (let pivot = 0; pivot < 81; pivot++) {
      if (this.grid[pivot] !== null) continue;
      const pivotOpts = this.candidates.get(pivot);
      if (!pivotOpts || pivotOpts.size !== 2) continue;

      const [a, b] = Array.from(pivotOpts);

      // Find two wings
      const row = Math.floor(pivot / 9);
      const col = pivot % 9;

      // Wing 1: shares row with pivot, has {a, c}
      for (let colIdx = 0; colIdx < 9; colIdx++) {
        if (colIdx === col) continue;
        const wing1 = row * 9 + colIdx;
        if (this.grid[wing1] !== null) continue;
        const wing1Opts = this.candidates.get(wing1);
        if (!wing1Opts || wing1Opts.size !== 2) continue;
        if (!wing1Opts.has(a)) continue;

        const c = Array.from(wing1Opts).find((v) => v !== a);
        if (c === undefined) continue;

        // Wing 2: shares column with pivot, has {b, c}
        for (let r = 0; r < 9; r++) {
          if (r === row) continue;
          const wing2 = r * 9 + col;
          if (this.grid[wing2] !== null) continue;
          const wing2Opts = this.candidates.get(wing2);
          if (!wing2Opts || wing2Opts.size !== 2) continue;
          if (!wing2Opts.has(b) || !wing2Opts.has(c)) continue;

          // XY-Wing found - can eliminate c from cells that see both wings
          const wing1Row = Math.floor(wing1 / 9);
          const wing1Col = wing1 % 9;
          const wing2Row = Math.floor(wing2 / 9);
          const wing2Col = wing2 % 9;

          // Check intersection cells
          for (let r = 0; r < 9; r++) {
            for (let cc = 0; cc < 9; cc++) {
              const cell = r * 9 + cc;
              if (this.grid[cell] !== null) continue;
              if (cell === pivot || cell === wing1 || cell === wing2) continue;

              // Cell sees both wings
              const seesWing1 = r === wing1Row || cc === wing1Col;
              const seesWing2 = r === wing2Row || cc === wing2Col;

              if (seesWing1 && seesWing2) {
                const opts = this.candidates.get(cell);
                if (opts && opts.has(c)) {
                  opts.delete(c);
                  progress = true;
                }
              }
            }
          }
        }
      }
    }

    return progress;
  }

  getGrid(): (number | null)[] {
    return this.grid;
  }
}

/** Indices whose value clashes with another value in the same row, column or box. */
export function sudokuConflicts(grid: (number | null)[]): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < 81; i++) {
    const value = grid[i];
    if (value === null || value === undefined) continue;
    if (!isAllowed(grid, i, value)) conflicts.add(i);
  }
  return conflicts;
}

export function isSudokuSolved(grid: (number | null)[]): boolean {
  if (grid.some((v) => v === null || v === undefined)) return false;
  return sudokuConflicts(grid).size === 0;
}

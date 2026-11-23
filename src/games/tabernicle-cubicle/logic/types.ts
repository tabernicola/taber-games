export const GRID_COLS = 21;
export const GRID_ROWS = 14;
export const DEFAULT_LEVEL_TIME_LIMIT_SECONDS = 90;

export type Direction = "up" | "down" | "left" | "right";

export type CellType = "empty" | "wall" | "lava" | "volcano";

export interface DinoEgg {
  id: string;
  x: number; // grid col (0..20)
  y: number; // grid row (0..13)
  collected: boolean;
}

export interface Mound {
  x: number;
  y: number;
}

export interface StoneBlock {
  id: string;
  x: number; // continuous coordinate for smooth rendering
  y: number;
  tileX: number; // target or current grid cell
  tileY: number;
  sliding: boolean;
  slideDir: Direction | null;
  speed: number;
}

export interface Flame {
  id: string;
  x: number;
  y: number;
  dir: Direction;
  speed: number;
  alive: boolean;
}

export interface BlockBreakEffect {
  x: number;
  y: number;
  dir: Direction;
  timeRemaining: number;
  duration: number;
}

export interface LavaCreature {
  id: string;
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  dir: Direction;
  moveCooldown: number;
  alive: boolean;
}

export interface VolcanoSpawner {
  x: number;
  y: number;
  cooldown: number;
  timer: number;
  maxCreatures: number;
}

export interface Player {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  dir: Direction;
  moving: boolean;
  moveProgress: number; // 0..1
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  action: "idle" | "walking" | "shooting" | "smashing" | "hit";
  actionTimer: number;
  lives: number;
  invincibleTimer: number;
  sameDirTime: number; // Time holding same direction
}

export interface LevelDef {
  id: number;
  name: {
    es: string;
    en: string;
    eu: string;
  };
  hint?: {
    es: string;
    en: string;
    eu: string;
  };
  map: string[]; // 14 strings of 21 characters
  maxCreatures: number;
  volcanoCooldown: number;
  timeLimitSeconds?: number;
}

export interface GameState {
  levelIndex: number;
  grid: CellType[][]; // [row][col]
  filledLava: boolean[][]; // tracks filled lava that has become walkable ground
  player: Player;
  startPlayerPos: { x: number; y: number; dir: Direction };
  mounds: Mound[];
  blocks: StoneBlock[];
  flames: Flame[];
  blockBreakEffects: BlockBreakEffect[];
  creatures: LavaCreature[];
  volcanoes: VolcanoSpawner[];
  eggs: DinoEgg[];
  eggsCollected: number;
  totalEggs: number;
  status: "playing" | "level_won" | "game_over" | "game_completed" | "paused";
  score: number;
  levelTimeSeconds: number;
  levelTimeLimitSeconds: number;
}

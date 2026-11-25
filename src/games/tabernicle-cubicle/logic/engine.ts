import {
  type CellType,
  type Direction,
  type DinoEgg,
  type Flame,
  type GameState,
  type LavaCreature,
  type LevelDef,
  type Mound,
  type Player,
  type StoneBlock,
  type VolcanoSpawner,
  GRID_COLS,
  GRID_ROWS,
  DEFAULT_LEVEL_TIME_LIMIT_SECONDS,
} from "./types";
import { LEVELS } from "./levels";
import {
  sounds,
  playFire,
  playClubSmash,
  playEggCollect,
  playStageClear,
  playBlockSlide,
  playCalcine,
  playLavaFill,
  playBlockStop,
  playHurt,
} from "./audio";

const DIRECTION_HOLD_TO_MOVE_SECONDS = 0.08;
const CREATURE_MOVE_INTERVAL_SECONDS = 0.9;
const PETRIFIED_ROCK_LIFETIME_SECONDS = 25;
const PETRIFIED_SMOKE_DURATION_SECONDS = 0.7;
export const TIME_BONUS_SECONDS_PER_TICK = 5;
export const TIME_BONUS_TICK_INTERVAL_SECONDS = 0.1;
const TIME_BONUS_POINTS_PER_SECOND = 100;

export interface InputState {
  direction: Direction | null;
  firePressed: boolean;
  clubPressed: boolean;
  directionChanged?: boolean; // true when direction just changed
}

export function getDirDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case "up":
      return { dx: 0, dy: -1 };
    case "down":
      return { dx: 0, dy: 1 };
    case "left":
      return { dx: -1, dy: 0 };
    case "right":
      return { dx: 1, dy: 0 };
  }
}

export function initLevel(
  levelIndex: number,
  lives = 3,
  score = 0,
  levels: LevelDef[] = LEVELS,
): GameState {
  const activeLevels = levels.length > 0 ? levels : LEVELS;
  const safeIndex = Math.max(0, Math.min(levelIndex, activeLevels.length - 1));
  const levelDef = activeLevels[safeIndex]!;

  const grid: CellType[][] = [];
  const filledLava: boolean[][] = [];
  const mounds: Mound[] = [];
  const blocks: StoneBlock[] = [];
  const creatures: LavaCreature[] = [];
  const volcanoes: VolcanoSpawner[] = [];
  const eggs: DinoEgg[] = [];
  let startPlayerPos = { x: 2, y: 2, dir: "down" as Direction };

  let blockCounter = 0;
  let creatureCounter = 0;
  let eggCounter = 0;

  for (let r = 0; r < GRID_ROWS; r++) {
    const rowCells: CellType[] = [];
    const filledRow: boolean[] = [];
    const rowStr = levelDef.map[r] || ".".repeat(GRID_COLS);

    for (let c = 0; c < GRID_COLS; c++) {
      const char = rowStr[c] || ".";
      filledRow.push(false);

      switch (char) {
        case "#":
          rowCells.push("wall");
          break;
        case "~":
          rowCells.push("lava");
          break;
        case "V":
          rowCells.push("volcano");
          volcanoes.push({
            x: c,
            y: r,
            cooldown: levelDef.volcanoCooldown,
            timer: levelDef.volcanoCooldown,
            maxCreatures: levelDef.maxCreatures,
          });
          break;
        case "P":
          rowCells.push("empty");
          startPlayerPos = { x: c, y: r, dir: "down" };
          break;
        case "E":
          rowCells.push("empty");
          eggs.push({
            id: `egg-${++eggCounter}`,
            x: c,
            y: r,
            collected: false,
          });
          break;
        case "B":
          rowCells.push("empty");
          blocks.push({
            id: `block-${++blockCounter}`,
            x: c,
            y: r,
            tileX: c,
            tileY: r,
            sliding: false,
            slideDir: null,
            speed: 8.5,
          });
          break;
        case "C":
          rowCells.push("empty");
          creatures.push({
            id: `creature-${++creatureCounter}`,
            x: c,
            y: r,
            tileX: c,
            tileY: r,
            dir: (["left", "right", "up", "down"] as Direction[])[Math.floor(Math.random() * 4)],
            moveCooldown: 0.4,
            alive: true,
          });
          break;
        case "M":
          rowCells.push("empty");
          mounds.push({ x: c, y: r });
          break;
        default:
          rowCells.push("empty");
          break;
      }
    }
    grid.push(rowCells);
    filledLava.push(filledRow);
  }

  const player: Player = {
    x: startPlayerPos.x,
    y: startPlayerPos.y,
    tileX: startPlayerPos.x,
    tileY: startPlayerPos.y,
    dir: startPlayerPos.dir,
    moving: false,
    moveProgress: 0,
    startX: startPlayerPos.x,
    startY: startPlayerPos.y,
    targetX: startPlayerPos.x,
    targetY: startPlayerPos.y,
    action: "idle",
    actionTimer: 0,
    lives: lives,
    invincibleTimer: 0,
    sameDirTime: 0,
  };

  return {
    levelIndex: safeIndex,
    grid,
    filledLava,
    player,
    startPlayerPos,
    mounds,
    blocks,
    flames: [],
    blockBreakEffects: [],
    petrifiedSmokeEffects: [],
    creatures,
    volcanoes,
    eggs,
    eggsCollected: 0,
    totalEggs: eggs.length,
    status: "playing",
    score,
    levelTimeSeconds: 0,
    levelTimeLimitSeconds: levelDef.timeLimitSeconds ?? DEFAULT_LEVEL_TIME_LIMIT_SECONDS,
  };
}

export function applyTimeBonusTick(state: GameState): GameState {
  if (state.status !== "level_won") return state;

  const remainingSeconds = Math.max(0, state.levelTimeLimitSeconds - state.levelTimeSeconds);
  const convertedSeconds = Math.min(TIME_BONUS_SECONDS_PER_TICK, remainingSeconds);
  if (convertedSeconds === 0) return state;

  return {
    ...state,
    levelTimeSeconds: Math.min(
      state.levelTimeLimitSeconds,
      state.levelTimeSeconds + convertedSeconds,
    ),
    score: state.score + Math.round(convertedSeconds * TIME_BONUS_POINTS_PER_SECOND),
  };
}

export function isWalkableForPlayer(
  x: number,
  y: number,
  grid: CellType[][],
  filledLava: boolean[][],
  mounds: Mound[],
  blocks: StoneBlock[],
): boolean {
  if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
  const cell = grid[y][x];

  // Wall, Volcano, or unfilled Lava blocks Taber
  if (cell === "wall" || cell === "volcano") return false;
  if (cell === "lava" && !filledLava[y][x]) return false;

  // Mound blocks Taber
  if (mounds.some((m) => m.x === x && m.y === y)) return false;

  // StoneBlock blocks Taber from directly walking onto it (he pushes it instead)
  if (blocks.some((b) => b.tileX === x && b.tileY === y)) return false;

  return true;
}

export function isWalkableForCreature(
  x: number,
  y: number,
  grid: CellType[][],
  filledLava: boolean[][],
  mounds: Mound[],
  blocks: StoneBlock[],
): boolean {
  if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
  const cell = grid[y][x];

  if (cell === "wall" || cell === "volcano") return false;
  if (cell === "lava" && !filledLava[y][x]) return false;
  if (mounds.some((m) => m.x === x && m.y === y)) return false;
  if (blocks.some((b) => b.tileX === x && b.tileY === y)) return false;

  return true;
}

function findDirectionToPlayer(
  creature: LavaCreature,
  player: Player,
  grid: CellType[][],
  filledLava: boolean[][],
  mounds: Mound[],
  blocks: StoneBlock[],
  creatures: LavaCreature[],
): Direction | null {
  const startIndex = creature.tileY * GRID_COLS + creature.tileX;
  const targetIndex = player.tileY * GRID_COLS + player.tileX;
  if (startIndex === targetIndex) return null;
  const occupiedCells = new Set(
    creatures
      .filter((other) => other.alive && other.id !== creature.id)
      .map((other) => other.tileY * GRID_COLS + other.tileX),
  );

  const queue = [startIndex];
  const visited = new Set(queue);
  const firstDirection = new Map<number, Direction>();
  const directions: Direction[] = ["up", "left", "right", "down"];

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const index = queue[cursor];
    const x = index % GRID_COLS;
    const y = Math.floor(index / GRID_COLS);

    for (const direction of directions) {
      const { dx, dy } = getDirDelta(direction);
      const nextX = x + dx;
      const nextY = y + dy;
      if (!isWalkableForCreature(nextX, nextY, grid, filledLava, mounds, blocks)) {
        continue;
      }

      const nextIndex = nextY * GRID_COLS + nextX;
      if (visited.has(nextIndex) || occupiedCells.has(nextIndex)) {
        continue;
      }

      visited.add(nextIndex);
      firstDirection.set(nextIndex, index === startIndex ? direction : firstDirection.get(index)!);
      if (nextIndex === targetIndex) return firstDirection.get(nextIndex)!;
      queue.push(nextIndex);
    }
  }

  return null;
}

export function stepGame(state: GameState, dt: number, input: InputState): GameState {
  if (state.status !== "playing") return state;

  const levelTimeSeconds = Math.min(state.levelTimeSeconds + dt, state.levelTimeLimitSeconds);
  const nextState: GameState = {
    ...state,
    levelTimeSeconds,
    player: { ...state.player },
    mounds: [...state.mounds],
    blocks: state.blocks.map((b) => ({ ...b })),
    flames: state.flames.map((f) => ({ ...f })),
    blockBreakEffects: state.blockBreakEffects
      .map((effect) => ({ ...effect, timeRemaining: effect.timeRemaining - dt }))
      .filter((effect) => effect.timeRemaining > 0),
    petrifiedSmokeEffects: state.petrifiedSmokeEffects
      .map((effect) => ({ ...effect, timeRemaining: effect.timeRemaining - dt }))
      .filter((effect) => effect.timeRemaining > 0),
    creatures: state.creatures.map((c) => ({ ...c })),
    volcanoes: state.volcanoes.map((v) => ({ ...v })),
    eggs: state.eggs.map((e) => ({ ...e })),
    grid: state.grid,
    filledLava: state.filledLava.map((row) => [...row]),
  };

  if (levelTimeSeconds >= state.levelTimeLimitSeconds) {
    nextState.status = "game_over";
    return nextState;
  }

  for (let i = nextState.blocks.length - 1; i >= 0; i--) {
    const block = nextState.blocks[i];
    if (!block.isPetrifiedCreature) continue;

    block.petrifiedAgeSeconds = (block.petrifiedAgeSeconds ?? 0) + dt;
    if (block.petrifiedAgeSeconds >= PETRIFIED_ROCK_LIFETIME_SECONDS) {
      nextState.petrifiedSmokeEffects.push({
        x: block.x,
        y: block.y,
        timeRemaining: PETRIFIED_SMOKE_DURATION_SECONDS,
        duration: PETRIFIED_SMOKE_DURATION_SECONDS,
      });
      nextState.blocks.splice(i, 1);
    }
  }

  const p = nextState.player;

  // Timers
  if (p.invincibleTimer > 0) p.invincibleTimer = Math.max(0, p.invincibleTimer - dt);
  if (p.actionTimer > 0) {
    p.actionTimer = Math.max(0, p.actionTimer - dt);
    if (p.actionTimer === 0 && p.action !== "walking") {
      p.action = "idle";
    }
  }

  // 1. Taber actions: push a block or shoot a flame
  if (input.firePressed && p.action !== "shooting" && p.action !== "hit") {
    const { dx, dy } = getDirDelta(p.dir);
    const targetX = p.tileX + dx;
    const targetY = p.tileY + dy;
    const blockAtTarget = nextState.blocks.find(
      (block) => !block.sliding && block.tileX === targetX && block.tileY === targetY,
    );

    if (blockAtTarget) {
      p.action = "shooting";
      p.actionTimer = 0.18;

      const behindX = targetX + dx;
      const behindY = targetY + dy;
      const isBehindInBounds =
        behindX >= 0 && behindX < GRID_COLS && behindY >= 0 && behindY < GRID_ROWS;
      const hitsWall = !isBehindInBounds || nextState.grid[behindY][behindX] === "wall";

      if (hitsWall) {
        nextState.blocks.splice(nextState.blocks.indexOf(blockAtTarget), 1);
        nextState.blockBreakEffects.push({
          x: blockAtTarget.x,
          y: blockAtTarget.y,
          dir: p.dir,
          timeRemaining: 0.4,
          duration: 0.4,
        });
      } else {
        const isBehindBlocked =
          nextState.grid[behindY][behindX] === "volcano" ||
          nextState.mounds.some((mound) => mound.x === behindX && mound.y === behindY) ||
          nextState.blocks.some((block) => block.tileX === behindX && block.tileY === behindY);

        if (!isBehindBlocked) {
          blockAtTarget.sliding = true;
          blockAtTarget.slideDir = p.dir;
          playBlockSlide();
        }
      }
    } else {
      p.action = "shooting";
      p.actionTimer = 0.18;
      playFire();

      nextState.flames.push({
        id: `flame-${Date.now()}-${Math.random()}`,
        x: p.x + dx * 0.7,
        y: p.y + dy * 0.7,
        dir: p.dir,
        speed: 13.0,
        alive: true,
      });
    }
  }

  // 2. Taber actions: Garrote / Mound Smash
  if (input.clubPressed && p.action !== "smashing" && p.action !== "hit") {
    p.action = "smashing";
    p.actionTimer = 0.22;
    playClubSmash();

    const { dx, dy } = getDirDelta(p.dir);
    const targetX = p.tileX + dx;
    const targetY = p.tileY + dy;

    if (targetX >= 0 && targetX < GRID_COLS && targetY >= 0 && targetY < GRID_ROWS) {
      const existingMoundIdx = nextState.mounds.findIndex(
        (m) => m.x === targetX && m.y === targetY,
      );
      if (existingMoundIdx >= 0) {
        // Remove mound!
        nextState.mounds.splice(existingMoundIdx, 1);
      } else {
        // Can only raise mound on empty walkable cell (not wall, not unfilled lava, not volcano, not block)
        const cell = nextState.grid[targetY][targetX];
        const isGround =
          cell === "empty" || (cell === "lava" && nextState.filledLava[targetY][targetX]);
        const hasBlock = nextState.blocks.some((b) => b.tileX === targetX && b.tileY === targetY);
        const hasEgg = nextState.eggs.some(
          (e) => !e.collected && e.x === targetX && e.y === targetY,
        );

        if (isGround && !hasBlock && !hasEgg) {
          nextState.mounds.push({ x: targetX, y: targetY });
        }
      }
    }
  }

  // 3. Taber Movement
  if (p.moving) {
    const moveSpeed = 4.2; // tiles per second
    p.moveProgress += moveSpeed * dt;
    if (p.moveProgress >= 1) {
      p.tileX = p.targetX;
      p.tileY = p.targetY;
      p.x = p.tileX;
      p.y = p.tileY;
      p.moving = false;
      p.moveProgress = 0;
      if (p.action === "walking") p.action = "idle";

      // Check egg pickup
      const egg = nextState.eggs.find((e) => !e.collected && e.x === p.tileX && e.y === p.tileY);
      if (egg) {
        egg.collected = true;
        nextState.eggsCollected++;
        nextState.score += 150;
        playEggCollect();

        if (nextState.eggsCollected >= nextState.totalEggs) {
          nextState.status = "level_won";
          playStageClear();
          return nextState;
        }
      }
    } else {
      p.x = p.startX + (p.targetX - p.startX) * p.moveProgress;
      p.y = p.startY + (p.targetY - p.startY) * p.moveProgress;
    }
  } else if (input.direction && p.action !== "hit") {
    console.log(
      "Input direction:",
      input.direction,
      "Current dir:",
      p.dir,
      "Direction changed:",
      input.directionChanged,
      "sameDirTime:",
      p.sameDirTime,
    );
    // First press in a new direction: only rotate, don't move
    if (input.directionChanged || input.direction !== p.dir) {
      p.dir = input.direction;
      p.sameDirTime = 0;
    } else {
      // Same direction: track time holding it
      p.sameDirTime += dt;
      // Only move after holding same direction for a brief moment
      if (p.sameDirTime > DIRECTION_HOLD_TO_MOVE_SECONDS) {
        const { dx, dy } = getDirDelta(p.dir);
        const destX = p.tileX + dx;
        const destY = p.tileY + dy;

        if (
          isWalkableForPlayer(
            destX,
            destY,
            nextState.grid,
            nextState.filledLava,
            nextState.mounds,
            nextState.blocks,
          )
        ) {
          p.moving = true;
          p.moveProgress = 0;
          p.startX = p.tileX;
          p.startY = p.tileY;
          p.targetX = destX;
          p.targetY = destY;
          p.action = "walking";
        }
      }
    }
  }

  // 4. Update Flames
  for (let i = nextState.flames.length - 1; i >= 0; i--) {
    const flame = nextState.flames[i];
    const { dx, dy } = getDirDelta(flame.dir);
    flame.x += dx * flame.speed * dt;
    flame.y += dy * flame.speed * dt;

    const curCol = Math.floor(flame.x + 0.5);
    const curRow = Math.floor(flame.y + 0.5);

    // Bounds check
    if (curCol < 0 || curCol >= GRID_COLS || curRow < 0 || curRow >= GRID_ROWS) {
      nextState.flames.splice(i, 1);
      continue;
    }

    // Wall, volcano, or mound collision
    const cell = nextState.grid[curRow][curCol];
    const hitMound = nextState.mounds.some((m) => m.x === curCol && m.y === curRow);
    if (cell === "wall" || cell === "volcano" || hitMound) {
      nextState.flames.splice(i, 1);
      continue;
    }

    const petrifiedBlock = nextState.blocks.find(
      (block) =>
        block.isPetrifiedCreature && Math.hypot(flame.x - block.x, flame.y - block.y) < 0.65,
    );
    if (petrifiedBlock) {
      petrifiedBlock.petrifiedAgeSeconds = 0;
      nextState.flames.splice(i, 1);
      continue;
    }

    // Creature collision -> CALCINATE!
    let creatureHit = false;
    for (let c = nextState.creatures.length - 1; c >= 0; c--) {
      const cr = nextState.creatures[c];
      if (!cr.alive) continue;
      const dist = Math.hypot(flame.x - cr.x, flame.y - cr.y);
      if (dist < 0.65) {
        // Creature turns to stone block!
        cr.alive = false;
        creatureHit = true;
        playCalcine();
        nextState.score += 75;

        // Spawn StoneBlock at creature's tile
        const blockTileX = Math.max(0, Math.min(GRID_COLS - 1, Math.round(cr.x)));
        const blockTileY = Math.max(0, Math.min(GRID_ROWS - 1, Math.round(cr.y)));

        nextState.blocks.push({
          id: `block-${Date.now()}-${Math.random()}`,
          isPetrifiedCreature: true,
          petrifiedAgeSeconds: 0,
          x: blockTileX,
          y: blockTileY,
          tileX: blockTileX,
          tileY: blockTileY,
          sliding: false,
          slideDir: null,
          speed: 8.5,
        });

        nextState.creatures.splice(c, 1);
        break;
      }
    }

    if (creatureHit) {
      nextState.flames.splice(i, 1);
    }
  }

  // 5. Update Stone Blocks (Sliding physics)
  for (let bIdx = nextState.blocks.length - 1; bIdx >= 0; bIdx--) {
    const block = nextState.blocks[bIdx];
    if (!block.sliding || !block.slideDir) continue;

    const { dx, dy } = getDirDelta(block.slideDir);
    block.x += dx * block.speed * dt;
    block.y += dy * block.speed * dt;

    const currentTileX = Math.round(block.x);
    const currentTileY = Math.round(block.y);
    const nextCheckX = currentTileX + dx;
    const nextCheckY = currentTileY + dy;

    // Squash creatures on the way
    for (let c = nextState.creatures.length - 1; c >= 0; c--) {
      const cr = nextState.creatures[c];
      if (cr.alive && Math.hypot(block.x - cr.x, block.y - cr.y) < 0.7) {
        cr.alive = false;
        nextState.creatures.splice(c, 1);
        nextState.score += 50;
      }
    }

    // Check if block reached a lava cell: fill it!
    const cellHere =
      currentTileX >= 0 && currentTileX < GRID_COLS && currentTileY >= 0 && currentTileY < GRID_ROWS
        ? nextState.grid[currentTileY][currentTileX]
        : null;

    if (cellHere === "lava" && !nextState.filledLava[currentTileY][currentTileX]) {
      // Reached lava tile -> fills it!
      nextState.filledLava[currentTileY][currentTileX] = true;
      nextState.score += 100;
      playLavaFill();
      nextState.blocks.splice(bIdx, 1);
      continue;
    }

    // Check obstacle ahead at (nextCheckX, nextCheckY)
    const isOutOfBounds =
      nextCheckX < 0 || nextCheckX >= GRID_COLS || nextCheckY < 0 || nextCheckY >= GRID_ROWS;
    const cellAhead = !isOutOfBounds ? nextState.grid[nextCheckY][nextCheckX] : "wall";
    const moundAhead = nextState.mounds.some((m) => m.x === nextCheckX && m.y === nextCheckY);
    const otherBlockAhead = nextState.blocks.some(
      (o) => o.id !== block.id && o.tileX === nextCheckX && o.tileY === nextCheckY,
    );

    const hitSolidObstacle =
      isOutOfBounds ||
      cellAhead === "wall" ||
      cellAhead === "volcano" ||
      moundAhead ||
      otherBlockAhead;

    if (hitSolidObstacle) {
      // Reached the stopping point immediately before the obstacle!
      // When block arrives within 0.1 of currentTileX, currentTileY, snap and stop
      if (
        (dx > 0 && block.x >= currentTileX) ||
        (dx < 0 && block.x <= currentTileX) ||
        (dy > 0 && block.y >= currentTileY) ||
        (dy < 0 && block.y <= currentTileY)
      ) {
        block.tileX = currentTileX;
        block.tileY = currentTileY;
        block.x = currentTileX;
        block.y = currentTileY;
        block.sliding = false;
        block.slideDir = null;
        playBlockStop();
      }
    } else {
      block.tileX = currentTileX;
      block.tileY = currentTileY;
    }
  }

  // 6. Volcano Spawners
  let activeCreaturesCount =
    nextState.creatures.filter((creature) => creature.alive).length +
    nextState.blocks.filter((block) => block.isPetrifiedCreature).length;
  for (const volcano of nextState.volcanoes) {
    volcano.timer -= dt;
    if (volcano.timer <= 0) {
      volcano.timer = volcano.cooldown;
      if (activeCreaturesCount < volcano.maxCreatures) {
        // Spawn creature in adjacent walkable cell
        const dirs: Direction[] = ["down", "left", "right", "up"];
        for (const dir of dirs) {
          const { dx, dy } = getDirDelta(dir);
          const sx = volcano.x + dx;
          const sy = volcano.y + dy;
          if (
            sx >= 0 &&
            sx < GRID_COLS &&
            sy >= 0 &&
            sy < GRID_ROWS &&
            (nextState.grid[sy][sx] === "empty" || nextState.filledLava[sy][sx]) &&
            !nextState.mounds.some((m) => m.x === sx && m.y === sy) &&
            !nextState.blocks.some((b) => b.tileX === sx && b.tileY === sy) &&
            !nextState.creatures.some((creature) => creature.tileX === sx && creature.tileY === sy)
          ) {
            nextState.creatures.push({
              id: `creature-${Date.now()}-${Math.random()}`,
              x: sx,
              y: sy,
              tileX: sx,
              tileY: sy,
              dir,
              moveCooldown: CREATURE_MOVE_INTERVAL_SECONDS,
              alive: true,
            });
            activeCreaturesCount++;
            break;
          }
        }
      }
    }
  }

  // 7. Lava Creatures AI & Player Damage
  for (const creature of nextState.creatures) {
    if (!creature.alive) continue;

    creature.moveCooldown -= dt;
    if (creature.moveCooldown <= 0) {
      creature.moveCooldown = CREATURE_MOVE_INTERVAL_SECONDS;

      const direction = findDirectionToPlayer(
        creature,
        p,
        nextState.grid,
        nextState.filledLava,
        nextState.mounds,
        nextState.blocks,
        nextState.creatures,
      );
      if (direction) {
        creature.dir = direction;
        const { dx, dy } = getDirDelta(direction);
        creature.tileX += dx;
        creature.tileY += dy;
      }
    }

    // Smooth position interpolation
    creature.x += (creature.tileX - creature.x) * Math.min(1, 10 * dt);
    creature.y += (creature.tileY - creature.y) * Math.min(1, 10 * dt);

    // Collision with Player
    if (p.invincibleTimer === 0 && p.action !== "hit") {
      const distToPlayer = Math.hypot(creature.x - p.x, creature.y - p.y);
      if (distToPlayer < 0.7) {
        p.lives -= 1;
        p.action = "hit";
        p.actionTimer = 0.8;
        p.invincibleTimer = 2.0;
        playHurt();

        if (p.lives <= 0) {
          nextState.status = "game_over";
          return nextState;
        } else {
          // Respawn at starting position
          p.x = nextState.startPlayerPos.x;
          p.y = nextState.startPlayerPos.y;
          p.tileX = nextState.startPlayerPos.x;
          p.tileY = nextState.startPlayerPos.y;
          p.moving = false;
        }
      }
    }
  }

  return nextState;
}

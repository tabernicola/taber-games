import { describe, it, expect, vi } from "vitest";
import { initLevel, stepGame, isWalkableForCreature, isWalkableForPlayer } from "./engine";
import { DEFAULT_LEVEL_TIME_LIMIT_SECONDS, GRID_COLS, GRID_ROWS } from "./types";
import { LEVELS } from "./levels";

describe("Tabernicle Cubicle Engine", () => {
  it("starts walking sooner after turning when direction is held", () => {
    let state = initLevel(0);
    let startX = -1;
    let startY = -1;
    for (let y = 1; y < GRID_ROWS - 1 && startX === -1; y++) {
      for (let x = 1; x < GRID_COLS - 2; x++) {
        const startIsWalkable = isWalkableForPlayer(
          x,
          y,
          state.grid,
          state.filledLava,
          state.mounds,
          state.blocks,
        );
        const targetIsWalkable = isWalkableForPlayer(
          x + 1,
          y,
          state.grid,
          state.filledLava,
          state.mounds,
          state.blocks,
        );
        if (startIsWalkable && targetIsWalkable) {
          startX = x;
          startY = y;
          break;
        }
      }
    }

    expect(startX).toBeGreaterThanOrEqual(1);
    state.player.tileX = startX;
    state.player.tileY = startY;
    state.player.x = startX;
    state.player.y = startY;
    state.player.dir = "down";
    state.player.startX = startX;
    state.player.startY = startY;
    state.player.targetX = startX;
    state.player.targetY = startY;

    const heldRight = {
      direction: "right" as const,
      firePressed: false,
      clubPressed: false,
      directionChanged: false,
    };

    state = stepGame(state, 0.016, { ...heldRight, directionChanged: true });
    expect(state.player.dir).toBe("right");
    expect(state.player.moving).toBe(false);

    state = stepGame(state, 0.04, heldRight);
    state = stepGame(state, 0.04, heldRight);
    expect(state.player.moving).toBe(false);

    state = stepGame(state, 0.04, heldRight);
    expect(state.player.moving).toBe(true);
    expect(state.player.targetX).toBe(startX + 1);
    expect(state.player.targetY).toBe(startY);
  });

  it("initializes Level 1 with 21 cols, 14 rows and valid state", () => {
    const state = initLevel(0);
    expect(state.grid.length).toBe(GRID_ROWS);
    expect(state.grid[0].length).toBe(GRID_COLS);
    expect(state.player.lives).toBe(3);
    expect(state.status).toBe("playing");
    expect(state.totalEggs).toBeGreaterThan(0);
    expect(state.blocks.length).toBeGreaterThan(0);
    expect(state.levelTimeLimitSeconds).toBe(DEFAULT_LEVEL_TIME_LIMIT_SECONDS);
  });

  it("does not allow creatures to enter unfilled lava", () => {
    const state = initLevel(0);
    const lavaY = state.grid.findIndex((row) => row.includes("lava"));
    const lavaX = state.grid[lavaY].indexOf("lava");

    expect(
      isWalkableForCreature(lavaX, lavaY, state.grid, state.filledLava, state.mounds, state.blocks),
    ).toBe(false);

    state.filledLava[lavaY][lavaX] = true;
    expect(
      isWalkableForCreature(lavaX, lavaY, state.grid, state.filledLava, state.mounds, state.blocks),
    ).toBe(true);
  });

  it("chases the player along a walkable route at a slower pace", () => {
    let state = initLevel(1);
    const creature = state.creatures[0];
    expect(creature).toBeDefined();

    state.player.tileX = 3;
    state.player.tileY = 5;
    state.player.x = 3;
    state.player.y = 5;
    state.player.invincibleTimer = 10;
    creature.tileX = 10;
    creature.tileY = 5;
    creature.x = 10;
    creature.y = 5;
    creature.moveCooldown = 0;
    state.grid[5][9] = "wall";

    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: false,
      clubPressed: false,
    });

    expect(state.creatures[0].tileX).toBe(10);
    expect(state.creatures[0].tileY).toBe(4);

    state = stepGame(state, 0.5, {
      direction: null,
      firePressed: false,
      clubPressed: false,
    });
    expect(state.creatures[0].tileX).toBe(10);
    expect(state.creatures[0].tileY).toBe(4);
  });

  it("avoids occupied enemy cells and turns to take another route", () => {
    const state = initLevel(1);
    state.player.tileX = 9;
    state.player.tileY = 5;
    state.player.x = 9;
    state.player.y = 5;
    state.player.invincibleTimer = 10;

    state.creatures = [
      {
        id: "chasing-creature",
        x: 5,
        y: 5,
        tileX: 5,
        tileY: 5,
        dir: "right",
        moveCooldown: 0,
        alive: true,
      },
      {
        id: "blocking-creature",
        x: 6,
        y: 5,
        tileX: 6,
        tileY: 5,
        dir: "left",
        moveCooldown: 10,
        alive: true,
      },
    ];

    const nextState = stepGame(state, 0.016, {
      direction: null,
      firePressed: false,
      clubPressed: false,
    });

    const [chaser, blocker] = nextState.creatures;
    expect(chaser.tileX).toBe(5);
    expect(chaser.tileY).toBe(4);
    expect(chaser.dir).toBe("up");
    expect(blocker.tileX).toBe(6);
    expect(blocker.tileY).toBe(5);
    expect(
      nextState.creatures.map((creature) => `${creature.tileX},${creature.tileY}`),
    ).toHaveLength(new Set(nextState.creatures.map((c) => `${c.tileX},${c.tileY}`)).size);
  });

  it("ends the level when the 90-second time limit expires", () => {
    const state = initLevel(0);
    state.levelTimeSeconds = state.levelTimeLimitSeconds - 0.05;
    const playerX = state.player.x;
    const playerY = state.player.y;

    const nextState = stepGame(state, 0.1, {
      direction: "right",
      firePressed: false,
      clubPressed: false,
      directionChanged: true,
    });

    expect(nextState.status).toBe("game_over");
    expect(nextState.levelTimeSeconds).toBe(state.levelTimeLimitSeconds);
    expect(nextState.player.x).toBe(playerX);
    expect(nextState.player.y).toBe(playerY);
  });

  it("prevents player from walking into walls or lava", () => {
    const state = initLevel(0);
    // Boundary cell (0, 0) is a wall
    expect(
      isWalkableForPlayer(0, 0, state.grid, state.filledLava, state.mounds, state.blocks),
    ).toBe(false);

    // Find a lava tile in level 1
    let lavaX = -1,
      lavaY = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (state.grid[r][c] === "lava") {
          lavaX = c;
          lavaY = r;
          break;
        }
      }
      if (lavaX !== -1) break;
    }

    expect(lavaX).toBeGreaterThanOrEqual(0);
    // Unfilled lava tile must not be walkable for Taber
    expect(
      isWalkableForPlayer(lavaX, lavaY, state.grid, state.filledLava, state.mounds, state.blocks),
    ).toBe(false);
  });

  it("Taber raises a mound with club and removes it when struck again", () => {
    let state = initLevel(0);
    state.player.tileX = 5;
    state.player.tileY = 5;
    state.player.x = 5;
    state.player.y = 5;
    state.player.dir = "right";

    // Strike club to create mound at (6, 5)
    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: false,
      clubPressed: true,
    });

    const hasMound = state.mounds.some((m) => m.x === 6 && m.y === 5);
    expect(hasMound).toBe(true);

    // Wait for the smash animation cooldown to finish
    state = stepGame(state, 0.3, {
      direction: null,
      firePressed: false,
      clubPressed: false,
    });

    // Strike club again in the same direction -> mound must be removed
    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: false,
      clubPressed: true,
    });

    const stillHasMound = state.mounds.some((m) => m.x === 6 && m.y === 5);
    expect(stillHasMound).toBe(false);
  });

  it("shoots flame and calcinates a lava creature into a stone block", () => {
    let state = initLevel(1); // Level 2 has an initial creature
    expect(state.creatures.length).toBeGreaterThan(0);

    const creature = state.creatures[0];
    state.player.tileX = creature.tileX - 2;
    state.player.tileY = creature.tileY;
    state.player.x = state.player.tileX;
    state.player.y = state.player.tileY;
    state.player.dir = "right";

    const initialBlockCount = state.blocks.length;

    // Fire
    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: true,
      clubPressed: false,
    });

    expect(state.flames.length).toBe(1);

    // Step flame forward until it hits creature
    for (let i = 0; i < 20; i++) {
      state = stepGame(state, 0.05, {
        direction: null,
        firePressed: false,
        clubPressed: false,
      });
      if (state.blocks.length > initialBlockCount) break;
    }

    // Creature calcinated into a stone block
    expect(state.blocks.length).toBe(initialBlockCount + 1);
  });

  it("pushes a block with the fire button without shooting a flame", () => {
    let state = initLevel(0);
    state.player.tileX = 5;
    state.player.tileY = 5;
    state.player.x = 5;
    state.player.y = 5;
    state.player.dir = "right";
    state.blocks = [
      {
        id: "push-test",
        x: 6,
        y: 5,
        tileX: 6,
        tileY: 5,
        sliding: false,
        slideDir: null,
        speed: 8,
      },
    ];

    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: true,
      clubPressed: false,
    });

    expect(state.blocks[0].sliding).toBe(true);
    expect(state.blocks[0].slideDir).toBe("right");
    expect(state.flames).toHaveLength(0);
  });

  it("breaks a pushed block against a wall and creates a break effect", () => {
    let state = initLevel(0);
    state.player.tileX = 5;
    state.player.tileY = 5;
    state.player.x = 5;
    state.player.y = 5;
    state.player.dir = "right";
    state.grid[5][7] = "wall";
    state.blocks = [
      {
        id: "break-test",
        x: 6,
        y: 5,
        tileX: 6,
        tileY: 5,
        sliding: false,
        slideDir: null,
        speed: 8,
      },
    ];

    state = stepGame(state, 0.016, {
      direction: null,
      firePressed: true,
      clubPressed: false,
    });

    expect(state.blocks).toHaveLength(0);
    expect(state.blockBreakEffects).toHaveLength(1);
    expect(state.blockBreakEffects[0]).toMatchObject({ x: 6, y: 5, dir: "right" });
    expect(state.flames).toHaveLength(0);
  });

  it("sliding block fills lava and transforms it into walkable ground", () => {
    let state = initLevel(0);
    // Put a stone block directly adjacent to a lava tile and push it
    let lavaX = -1,
      lavaY = -1;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (state.grid[r][c] === "lava") {
          lavaX = c;
          lavaY = r;
          break;
        }
      }
      if (lavaX !== -1) break;
    }

    // Place a block at (lavaX - 1, lavaY) sliding right into lava
    state.blocks = [
      {
        id: "test-block",
        x: lavaX - 1,
        y: lavaY,
        tileX: lavaX - 1,
        tileY: lavaY,
        sliding: true,
        slideDir: "right",
        speed: 10,
      },
    ];

    expect(state.filledLava[lavaY][lavaX]).toBe(false);

    // Step block forward into lava
    for (let i = 0; i < 15; i++) {
      state = stepGame(state, 0.05, {
        direction: null,
        firePressed: false,
        clubPressed: false,
      });
      if (state.filledLava[lavaY][lavaX]) break;
    }

    // Lava is filled, block consumed, now walkable!
    expect(state.filledLava[lavaY][lavaX]).toBe(true);
    expect(state.blocks.length).toBe(0);
    expect(
      isWalkableForPlayer(lavaX, lavaY, state.grid, state.filledLava, state.mounds, state.blocks),
    ).toBe(true);
  });

  it("sliding block stops in the cell immediately before a mound", () => {
    let state = initLevel(0);
    state.mounds = [{ x: 10, y: 5 }];
    state.blocks = [
      {
        id: "slide-test",
        x: 6,
        y: 5,
        tileX: 6,
        tileY: 5,
        sliding: true,
        slideDir: "right",
        speed: 10,
      },
    ];

    for (let i = 0; i < 30; i++) {
      state = stepGame(state, 0.05, {
        direction: null,
        firePressed: false,
        clubPressed: false,
      });
      if (!state.blocks[0].sliding) break;
    }

    // Stopped at cell 9 (immediately before mound at 10)
    expect(state.blocks[0].sliding).toBe(false);
    expect(state.blocks[0].tileX).toBe(9);
    expect(state.blocks[0].tileY).toBe(5);
  });

  it("collecting all eggs triggers level_won", () => {
    let state = initLevel(0);
    // Mark all eggs collected except one
    for (let i = 1; i < state.eggs.length; i++) {
      state.eggs[i].collected = true;
      state.eggsCollected++;
    }

    const lastEgg = state.eggs[0];
    state.player.tileX = lastEgg.x;
    state.player.tileY = lastEgg.y;
    state.player.startX = lastEgg.x;
    state.player.startY = lastEgg.y;
    state.player.targetX = lastEgg.x;
    state.player.targetY = lastEgg.y;
    state.player.moving = true;
    state.player.moveProgress = 0.99;

    state = stepGame(state, 0.05, {
      direction: null,
      firePressed: false,
      clubPressed: false,
    });

    expect(state.status).toBe("level_won");
  });
});

import type { GameState } from "./types";
import { renderGridBase } from "./renderer/grid";
import { renderVolcanoes } from "./renderer/volcanoes";
import { renderMounds } from "./renderer/mounds";
import { renderEggs } from "./renderer/eggs";
import { renderBlocks } from "./renderer/blocks";
import { renderBlockBreakEffects } from "./renderer/block-break-effects";
import { renderCreatures } from "./renderer/creatures";
import { renderFlames } from "./renderer/flames";
import { renderPlayer } from "./renderer/player";

export const SPRITE_COLS = 8;
export const SPRITE_ROWS = 4;

export interface LoadedImages {
  spritesheet: HTMLImageElement | null;
}

export interface RenderEffects {
  playerIntroProgress?: number;
  screenDarkness?: number;
}

/**
 * Loads the Taber spritesheet image.
 * Returns null if running in server-side environment.
 */
export function loadTaberImages(): LoadedImages {
  if (typeof window === "undefined") {
    return { spritesheet: null };
  }

  const spritesheet = new Image();
  spritesheet.src = "/tabernicle-cubicle/sprites/taber.png";

  return { spritesheet };
}

/**
 * Main render function for the game.
 * Clears canvas and renders all game elements in order: grid, volcanoes, mounds, eggs, blocks, creatures, flames, player.
 */
export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  images: LoadedImages,
  width: number,
  height: number,
  timeMs: number,
  effects: RenderEffects = {},
) {
  ctx.fillStyle = "#180d08";
  ctx.fillRect(0, 0, width, height);

  const cellW = width / 21;
  const cellH = height / 14;
  const t = timeMs / 1000;

  renderGridBase(ctx, state, cellW, cellH, t);
  renderVolcanoes(ctx, state, cellW, cellH, t);
  renderMounds(ctx, state, cellW, cellH);
  renderEggs(ctx, state, cellW, cellH, t);
  renderBlocks(ctx, state, cellW, cellH);
  renderBlockBreakEffects(ctx, state, cellW, cellH);
  renderCreatures(ctx, state, cellW, cellH, t);
  renderFlames(ctx, state, cellW, cellH);
  renderPlayer(ctx, state, images, cellW, cellH, t, effects.playerIntroProgress);

  if (effects.screenDarkness && effects.screenDarkness > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, effects.screenDarkness)})`;
    ctx.fillRect(0, 0, width, height);
  }
}

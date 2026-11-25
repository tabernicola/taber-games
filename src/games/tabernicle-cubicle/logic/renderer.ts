import type { GameState } from "./types";
import { renderGridBase } from "./renderer/grid";
import { renderVolcanoes } from "./renderer/volcanoes";
import { renderMounds } from "./renderer/mounds";
import { renderEggs } from "./renderer/eggs";
import { renderBlocks } from "./renderer/blocks";
import { renderBlockBreakEffects } from "./renderer/block-break-effects";
import { renderPetrifiedSmoke } from "./renderer/petrified-smoke";
import { renderCreatures } from "./renderer/creatures";
import { renderFlames } from "./renderer/flames";
import { renderPlayer } from "./renderer/player";

export const SPRITE_COLS = 8;
export const SPRITE_ROWS = 4;

export interface LoadedImages {
  spritesheet: HTMLImageElement | null;
  strikeSpritesheet: HTMLImageElement | null;
  petrifiedCracks5: HTMLImageElement | null;
  petrifiedCracks10: HTMLImageElement | null;
  petrifiedCracks15: HTMLImageElement | null;
  petrifiedCracks20: HTMLImageElement | null;
  petrifiedSmoke: HTMLImageElement | null;
}

export interface RenderEffects {
  playerIntroProgress?: number;
  screenDarkness?: number;
  victoryFlightProgress?: number;
}

/**
 * Loads the Taber spritesheet image.
 * Returns null if running in server-side environment.
 */
export function loadTaberImages(): LoadedImages {
  if (typeof window === "undefined") {
    return {
      spritesheet: null,
      strikeSpritesheet: null,
      petrifiedCracks5: null,
      petrifiedCracks10: null,
      petrifiedCracks15: null,
      petrifiedCracks20: null,
      petrifiedSmoke: null,
    };
  }

  const spritesheet = new Image();
  spritesheet.src = "/tabernicle-cubicle/sprites/taber-128x128.png";
  const strikeSpritesheet = new Image();
  strikeSpritesheet.src = "/tabernicle-cubicle/sprites/taber-strike-128x128.png";
  const petrifiedCracks5 = new Image();
  petrifiedCracks5.src = "/tabernicle-cubicle/sprites/petrified-rock-5.svg";
  const petrifiedCracks10 = new Image();
  petrifiedCracks10.src = "/tabernicle-cubicle/sprites/petrified-rock-10.svg";
  const petrifiedCracks15 = new Image();
  petrifiedCracks15.src = "/tabernicle-cubicle/sprites/petrified-rock-15.svg";
  const petrifiedCracks20 = new Image();
  petrifiedCracks20.src = "/tabernicle-cubicle/sprites/petrified-rock-20.svg";
  const petrifiedSmoke = new Image();
  petrifiedSmoke.src = "/tabernicle-cubicle/sprites/petrified-rock-smoke.svg";

  return {
    spritesheet,
    strikeSpritesheet,
    petrifiedCracks5,
    petrifiedCracks10,
    petrifiedCracks15,
    petrifiedCracks20,
    petrifiedSmoke,
  };
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
  renderBlocks(
    ctx,
    state,
    cellW,
    cellH,
    images.petrifiedCracks5,
    images.petrifiedCracks10,
    images.petrifiedCracks15,
    images.petrifiedCracks20,
  );
  renderBlockBreakEffects(ctx, state, cellW, cellH);
  renderPetrifiedSmoke(ctx, state, cellW, cellH, images.petrifiedSmoke);
  renderCreatures(ctx, state, cellW, cellH, t);
  renderFlames(ctx, state, cellW, cellH);
  renderPlayer(
    ctx,
    state,
    images,
    cellW,
    cellH,
    t,
    effects.playerIntroProgress,
    effects.victoryFlightProgress,
  );

  if (effects.screenDarkness && effects.screenDarkness > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, effects.screenDarkness)})`;
    ctx.fillRect(0, 0, width, height);
  }
}

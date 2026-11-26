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
  enemySpritesheet: HTMLImageElement | null;
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
  paused?: boolean;
  pauseTitle?: string;
  pausePrompt?: string;
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
      enemySpritesheet: null,
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
  const enemySpritesheet = new Image();
  enemySpritesheet.src = "/tabernicle-cubicle/sprites/enemy1-128x128.png";
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
    enemySpritesheet,
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
  renderCreatures(ctx, state, cellW, cellH, t, images.enemySpritesheet);
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

  if (effects.paused) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const title = effects.pauseTitle ?? "PAUSA";
    let titleFontSize = Math.max(32, width * 0.09);
    ctx.font = `${titleFontSize}px Coiny, cursive`;
    while (ctx.measureText(title).width > width * 0.85 && titleFontSize > 20) {
      titleFontSize -= 2;
      ctx.font = `${titleFontSize}px Coiny, cursive`;
    }
    const titleWidth = ctx.measureText(title).width;
    let letterX = (width - titleWidth) / 2;
    const letterColors = [
      "#ff595e",
      "#ffca3a",
      "#8ac926",
      "#52b7d8",
      "#6a4c93",
      "#ff924c",
      "#f15bb5",
      "#00bbf9",
    ];
    for (const [index, letter] of [...title].entries()) {
      const letterWidth = ctx.measureText(letter).width;
      const letterY = height * 0.46 + Math.sin(index * 0.9) * titleFontSize * 0.035;
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineWidth = titleFontSize * 0.18;
      ctx.strokeStyle = "#45220f";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = titleFontSize * 0.18;
      ctx.shadowOffsetY = titleFontSize * 0.15;
      ctx.strokeText(letter, letterX, letterY);
      ctx.shadowColor = "transparent";
      ctx.lineWidth = titleFontSize * 0.08;
      ctx.strokeStyle = "#fff2c2";
      ctx.strokeText(letter, letterX, letterY);
      ctx.fillStyle = letterColors[index % letterColors.length];
      ctx.fillText(letter, letterX, letterY);
      ctx.restore();
      letterX += letterWidth;
    }

    ctx.fillStyle = "#f5f5f4";
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.max(14, width * 0.022)}px sans-serif`;
    ctx.fillText(
      effects.pausePrompt ?? "Pulsa P o el botón para continuar",
      width / 2,
      height * 0.57,
    );
  }
}

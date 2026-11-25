import type { GameState } from "../types";

/**
 * Renders the shadow beneath a stone block.
 * Semi-transparent rectangle offset from the block.
 */
function renderBlockShadow(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(bx + cellW * 0.08, by + cellH * 0.12, cellW * 0.84, cellH * 0.84);
}

/**
 * Renders the main face of a stone block.
 * Gray block with top highlight and bottom dark bevel.
 */
function renderBlockFace(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#636972";
  ctx.fillRect(bx + cellW * 0.05, by + cellH * 0.05, cellW * 0.9, cellH * 0.9);

  ctx.fillStyle = "#8d96a3";
  ctx.fillRect(bx + cellW * 0.05, by + cellH * 0.05, cellW * 0.9, cellH * 0.18);

  ctx.fillStyle = "#3f434a";
  ctx.fillRect(bx + cellW * 0.05, by + cellH * 0.77, cellW * 0.9, cellH * 0.18);

  ctx.strokeStyle = "#1b1d22";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bx + cellW * 0.05, by + cellH * 0.05, cellW * 0.9, cellH * 0.9);
}

/**
 * Renders the rune/glyph carving on the stone block.
 * Circle with vertical line through center.
 */
function renderBlockGlyph(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  cellW: number,
  cellH: number,
) {
  ctx.strokeStyle = "#353940";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bx + cellW * 0.5, by + cellH * 0.5, cellW * 0.18, 0, Math.PI * 2);
  ctx.moveTo(bx + cellW * 0.5, by + cellH * 0.3);
  ctx.lineTo(bx + cellW * 0.5, by + cellH * 0.7);
  ctx.stroke();
}

/**
 * Calculates the direction offset for block sliding animation.
 * Returns dx, dy based on slide direction (opposite to movement).
 */
function getSlideDirectionOffset(slideDir: string): { dx: number; dy: number } {
  if (slideDir === "right") return { dx: -1, dy: 0 };
  if (slideDir === "left") return { dx: 1, dy: 0 };
  if (slideDir === "down") return { dx: 0, dy: -1 };
  return { dx: 0, dy: 1 };
}

/**
 * Renders speed lines when a block is sliding.
 * Two white lines trailing behind the movement direction.
 */
function renderBlockSpeedLines(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  cellW: number,
  cellH: number,
  slideDir: string,
) {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 2;
  const { dx, dy } = getSlideDirectionOffset(slideDir);

  ctx.beginPath();
  ctx.moveTo(bx + cellW * 0.5 + dx * cellW * 0.5, by + cellH * 0.3 + dy * cellH * 0.5);
  ctx.lineTo(bx + cellW * 0.5 + dx * cellW * 0.8, by + cellH * 0.3 + dy * cellH * 0.8);
  ctx.moveTo(bx + cellW * 0.5 + dx * cellW * 0.5, by + cellH * 0.7 + dy * cellH * 0.5);
  ctx.lineTo(bx + cellW * 0.5 + dx * cellW * 0.8, by + cellH * 0.7 + dy * cellH * 0.8);
  ctx.stroke();
}

/**
 * Renders all stone blocks in the game state.
 * Each block has shadow, face, glyph, and optional speed lines when sliding.
 */
export function renderBlocks(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  petrifiedCracks5: HTMLImageElement | null,
  petrifiedCracks10: HTMLImageElement | null,
  petrifiedCracks15: HTMLImageElement | null,
  petrifiedCracks20: HTMLImageElement | null,
) {
  for (const block of state.blocks) {
    const bx = block.x * cellW;
    const by = block.y * cellH;

    renderBlockShadow(ctx, bx, by, cellW, cellH);
    renderBlockFace(ctx, bx, by, cellW, cellH);
    renderBlockGlyph(ctx, bx, by, cellW, cellH);

    if (block.isPetrifiedCreature && block.petrifiedAgeSeconds !== undefined) {
      const agingImage =
        block.petrifiedAgeSeconds >= 20
          ? petrifiedCracks20
          : block.petrifiedAgeSeconds >= 15
            ? petrifiedCracks15
            : block.petrifiedAgeSeconds >= 10
              ? petrifiedCracks10
              : block.petrifiedAgeSeconds >= 5
                ? petrifiedCracks5
                : null;
      if (agingImage?.complete && agingImage.naturalWidth > 0) {
        ctx.drawImage(agingImage, bx, by, cellW, cellH);
      }
    }

    if (block.sliding && block.slideDir) {
      renderBlockSpeedLines(ctx, bx, by, cellW, cellH, block.slideDir);
    }
  }
}

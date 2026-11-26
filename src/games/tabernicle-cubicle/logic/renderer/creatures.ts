import type { GameState } from "../types";

/**
 * Renders the fiery body of a lava creature.
 * Orange circle with red outline and bounce animation.
 */
function renderCreatureBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
  crBounce: number,
) {
  ctx.fillStyle = "#ff4400";
  ctx.beginPath();
  ctx.arc(cx + cellW * 0.5, cy + cellH * 0.5 + crBounce, cellW * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4d1000";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/**
 * Renders the spiky flame tuft on top of the creature.
 * Yellow triangle that follows the bounce animation.
 */
function renderCreatureFlameTuft(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
  crBounce: number,
) {
  ctx.fillStyle = "#ffaa00";
  ctx.beginPath();
  ctx.moveTo(cx + cellW * 0.5, cy + cellH * 0.15 + crBounce);
  ctx.lineTo(cx + cellW * 0.35, cy + cellH * 0.35 + crBounce);
  ctx.lineTo(cx + cellW * 0.65, cy + cellH * 0.35 + crBounce);
  ctx.closePath();
  ctx.fill();
}

/**
 * Renders the glowing eyes of a lava creature.
 * Yellow sclera with black pupils.
 */
function renderCreatureEyes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
  crBounce: number,
) {
  ctx.fillStyle = "#ffff00";
  ctx.beginPath();
  ctx.arc(cx + cellW * 0.4, cy + cellH * 0.48 + crBounce, cellW * 0.08, 0, Math.PI * 2);
  ctx.arc(cx + cellW * 0.6, cy + cellH * 0.48 + crBounce, cellW * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx + cellW * 0.4, cy + cellH * 0.48 + crBounce, cellW * 0.04, 0, Math.PI * 2);
  ctx.arc(cx + cellW * 0.6, cy + cellH * 0.48 + crBounce, cellW * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders all lava creatures in the game state.
 * Skips dead creatures. Each has body, flame tuft, and eyes.
 */
export function renderCreatures(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  t: number,
  spritesheet: HTMLImageElement | null,
) {
  for (const cr of state.creatures) {
    if (!cr.alive) continue;
    const cx = cr.x * cellW;
    const cy = cr.y * cellH;

    if (spritesheet?.complete && spritesheet.naturalWidth > 0) {
      const frameW = spritesheet.naturalWidth / 8;
      const frameH = spritesheet.naturalHeight / 4;
      const frameRow = cr.dir === "down" ? 0 : cr.dir === "up" ? 1 : cr.dir === "left" ? 2 : 3;
      const distanceToTarget = Math.hypot(cr.tileX - cr.x, cr.tileY - cr.y);
      const movementProgress = Math.max(0, Math.min(1, 1 - distanceToTarget));
      const frameCol = distanceToTarget > 0.02 ? Math.min(7, Math.floor(movementProgress * 8)) : 0;
      const drawW = cellW * 1.35;
      const drawH = drawW * (frameH / frameW);
      const drawX = cx + (cellW - drawW) / 2;
      const drawY = cy + (cellH - drawH) / 2 - cellH * 0.12;

      ctx.drawImage(
        spritesheet,
        frameCol * frameW,
        frameRow * frameH,
        frameW,
        frameH,
        drawX,
        drawY,
        drawW,
        drawH,
      );
      continue;
    }

    const crBounce = Math.sin(t * 8 + cr.x) * 3;

    renderCreatureBody(ctx, cx, cy, cellW, cellH, crBounce);
    renderCreatureFlameTuft(ctx, cx, cy, cellW, cellH, crBounce);
    renderCreatureEyes(ctx, cx, cy, cellW, cellH, crBounce);
  }
}

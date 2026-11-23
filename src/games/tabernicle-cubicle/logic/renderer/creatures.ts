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
) {
  for (const cr of state.creatures) {
    if (!cr.alive) continue;
    const cx = cr.x * cellW;
    const cy = cr.y * cellH;

    const crBounce = Math.sin(t * 8 + cr.x) * 3;

    renderCreatureBody(ctx, cx, cy, cellW, cellH, crBounce);
    renderCreatureFlameTuft(ctx, cx, cy, cellW, cellH, crBounce);
    renderCreatureEyes(ctx, cx, cy, cellW, cellH, crBounce);
  }
}

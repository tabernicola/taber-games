import type { GameState } from "../types";

/**
 * Renders the bright inner core of a flame projectile.
 * Yellow circle at the center.
 */
function renderFlameCore(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  cellW: number,
) {
  ctx.fillStyle = "#ffff55";
  ctx.beginPath();
  ctx.arc(fx, fy, cellW * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the outer glow of a flame projectile.
 * Orange circle with yellow outline.
 */
function renderFlameOuter(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  cellW: number,
) {
  ctx.fillStyle = "#ff5500";
  ctx.beginPath();
  ctx.arc(fx, fy, cellW * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffe100";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * Renders all flame projectiles in the game state.
 * Each flame consists of bright core and outer glow.
 */
export function renderFlames(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
) {
  for (const flame of state.flames) {
    const fx = flame.x * cellW;
    const fy = flame.y * cellH;

    renderFlameCore(ctx, fx, fy, cellW);
    renderFlameOuter(ctx, fx, fy, cellW);
  }
}

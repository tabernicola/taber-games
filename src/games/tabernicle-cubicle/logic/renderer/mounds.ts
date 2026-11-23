import type { GameState } from "../types";

/**
 * Renders the base of a dirt mound (pivot point).
 * Semi-circle brown mound with thick outline.
 */
function renderMoundBase(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#8a5829";
  ctx.beginPath();
  ctx.arc(mx + cellW * 0.5, my + cellH * 0.55, cellW * 0.38, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#381c08";
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Renders small rocks embedded in the mound.
 * Two lighter brown circles on the mound surface.
 */
function renderMoundRocks(
  ctx: CanvasRenderingContext2D,
  mx: number,
  my: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#a87542";
  ctx.beginPath();
  ctx.arc(mx + cellW * 0.38, my + cellH * 0.42, cellW * 0.1, 0, Math.PI * 2);
  ctx.arc(mx + cellW * 0.62, my + cellH * 0.48, cellW * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders all dirt mounds in the game state.
 * Each mound consists of base and embedded rocks.
 */
export function renderMounds(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
) {
  for (const mound of state.mounds) {
    const mx = mound.x * cellW;
    const my = mound.y * cellH;

    renderMoundBase(ctx, mx, my, cellW, cellH);
    renderMoundRocks(ctx, mx, my, cellW, cellH);
  }
}

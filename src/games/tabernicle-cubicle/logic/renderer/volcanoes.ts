import type { GameState } from "../types";

/**
 * Renders the base cone of a volcano spawner.
 * Dark brown cone with thick outline.
 */
function renderVolcanoBase(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#382015";
  ctx.beginPath();
  ctx.moveTo(vx + cellW * 0.1, vy + cellH * 0.95);
  ctx.lineTo(vx + cellW * 0.35, vy + cellH * 0.25);
  ctx.lineTo(vx + cellW * 0.65, vy + cellH * 0.25);
  ctx.lineTo(vx + cellW * 0.9, vy + cellH * 0.95);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1b0d07";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/**
 * Renders the glowing lava crater at the volcano top.
 * Pulsating orange/red glow animation.
 */
function renderVolcanoCrater(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  cellW: number,
  cellH: number,
  t: number,
) {
  const glowPulse = Math.sin(t * 5) * 0.2 + 0.8;
  ctx.fillStyle = `rgb(255, ${Math.floor(120 * glowPulse)}, 0)`;
  ctx.beginPath();
  ctx.ellipse(vx + cellW * 0.5, vy + cellH * 0.25, cellW * 0.22, cellH * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the rising smoke puff from the volcano.
 * Semi-transparent gray circle that rises over time.
 */
function renderVolcanoSmoke(
  ctx: CanvasRenderingContext2D,
  vx: number,
  vy: number,
  cellW: number,
  cellH: number,
  t: number,
) {
  const smokeY = vy + cellH * 0.1 - ((t * 20) % 20);
  ctx.fillStyle = "rgba(180, 160, 150, 0.35)";
  ctx.beginPath();
  ctx.arc(vx + cellW * 0.5, smokeY, cellW * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders all volcano spawners in the game state.
 * Each volcano consists of base, crater, and smoke.
 */
export function renderVolcanoes(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  t: number,
) {
  for (const volcano of state.volcanoes) {
    const vx = volcano.x * cellW;
    const vy = volcano.y * cellH;

    renderVolcanoBase(ctx, vx, vy, cellW, cellH);
    renderVolcanoCrater(ctx, vx, vy, cellW, cellH, t);
    renderVolcanoSmoke(ctx, vx, vy, cellW, cellH, t);
  }
}

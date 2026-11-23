import type { GameState } from "../types";

/**
 * Renders the shadow beneath a dinosaur egg.
 * Semi-transparent ellipse on the ground.
 */
function renderEggShadow(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(ex + cellW * 0.5, ey + cellH * 0.78, cellW * 0.25, cellH * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the main body of a dinosaur egg.
 * Cream-colored ellipse with outline and gentle bounce animation.
 */
function renderEggBody(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  cellW: number,
  cellH: number,
  eggBounce: number,
) {
  ctx.fillStyle = "#ffeedd";
  ctx.beginPath();
  ctx.ellipse(
    ex + cellW * 0.5,
    ey + cellH * 0.5 + eggBounce,
    cellW * 0.24,
    cellH * 0.32,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#4d3826";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/**
 * Renders the blue spots on the dinosaur egg.
 * Three cyan circles that follow the bounce animation.
 */
function renderEggSpots(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  cellW: number,
  cellH: number,
  eggBounce: number,
) {
  ctx.fillStyle = "#3bc8ff";
  ctx.beginPath();
  ctx.arc(ex + cellW * 0.45, ey + cellH * 0.42 + eggBounce, cellW * 0.06, 0, Math.PI * 2);
  ctx.arc(ex + cellW * 0.56, ey + cellH * 0.55 + eggBounce, cellW * 0.07, 0, Math.PI * 2);
  ctx.arc(ex + cellW * 0.42, ey + cellH * 0.65 + eggBounce, cellW * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the glossy sheen on the dinosaur egg.
 * Semi-transparent white ellipse for a shiny appearance.
 */
function renderEggSheen(
  ctx: CanvasRenderingContext2D,
  ex: number,
  ey: number,
  cellW: number,
  cellH: number,
  eggBounce: number,
) {
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(
    ex + cellW * 0.43,
    ey + cellH * 0.36 + eggBounce,
    cellW * 0.06,
    cellH * 0.1,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

/**
 * Renders all dinosaur eggs in the game state.
 * Skips collected eggs. Each egg has shadow, body, spots, and sheen.
 */
export function renderEggs(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  t: number,
) {
  for (const egg of state.eggs) {
    if (egg.collected) continue;
    const ex = egg.x * cellW;
    const ey = egg.y * cellH;

    const eggBounce = Math.sin(t * 4 + egg.x * 2) * 2;

    renderEggShadow(ctx, ex, ey, cellW, cellH);
    renderEggBody(ctx, ex, ey, cellW, cellH, eggBounce);
    renderEggSpots(ctx, ex, ey, cellW, cellH, eggBounce);
    renderEggSheen(ctx, ex, ey, cellW, cellH, eggBounce);
  }
}

import type { GameState } from "../types";
import { GRID_COLS, GRID_ROWS } from "../types";

/**
 * Renders a wall cell with chiseled rock appearance.
 * Includes top/bottom rim highlights, inner block, and diagonal crack.
 */
function renderWallCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#2a1e17";
  ctx.fillRect(x, y, cellW, cellH);

  ctx.fillStyle = "#4a3b30";
  ctx.fillRect(x, y, cellW, cellH * 0.15);

  ctx.fillStyle = "#170f0a";
  ctx.fillRect(x, y + cellH * 0.85, cellW, cellH * 0.15);

  ctx.strokeStyle = "#120a06";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);

  ctx.beginPath();
  ctx.moveTo(x + cellW * 0.3, y + cellH * 0.2);
  ctx.lineTo(x + cellW * 0.5, y + cellH * 0.5);
  ctx.lineTo(x + cellW * 0.7, y + cellH * 0.8);
  ctx.strokeStyle = "#1a120c";
  ctx.stroke();
}

/**
 * Renders an active lava cell with bubbling animation.
 * Includes pulsating glow gradient, floating crust islands, and magma bubbles.
 */
function renderLavaCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  t: number,
  c: number,
  r: number,
) {
  const glow = Math.sin(t * 3 + c * 0.7 + r * 0.5) * 0.15 + 0.85;
  const grad = ctx.createLinearGradient(x, y, x, y + cellH);
  grad.addColorStop(0, `rgba(255, ${Math.floor(70 * glow)}, 0, 1)`);
  grad.addColorStop(1, `rgba(200, ${Math.floor(30 * glow)}, 0, 1)`);

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, cellW, cellH);

  ctx.fillStyle = "rgba(80, 20, 5, 0.4)";
  ctx.beginPath();
  ctx.arc(
    x + cellW * 0.5 + Math.sin(t + c) * 3,
    y + cellH * 0.5 + Math.cos(t + r) * 3,
    cellW * 0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const bubbleR = ((t * 2 + c + r * 2) % 3) / 3;
  ctx.fillStyle = "rgba(255, 230, 120, 0.7)";
  ctx.beginPath();
  ctx.arc(x + cellW * 0.7, y + cellH * 0.4, cellW * 0.12 * bubbleR, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders a cooled lava cell (hardened basalt).
 * Includes cracks with warm magma glow underneath.
 */
function renderFilledLavaCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#382921";
  ctx.fillRect(x, y, cellW, cellH);

  ctx.strokeStyle = "#ff7b1a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + cellW * 0.2, y + cellH * 0.5);
  ctx.lineTo(x + cellW * 0.5, y + cellH * 0.2);
  ctx.lineTo(x + cellW * 0.8, y + cellH * 0.7);
  ctx.stroke();

  ctx.strokeStyle = "#1c1410";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, cellW, cellH);
}

/**
 * Renders a standard walkable floor cell.
 * Uses alternating colors for tile pattern with subtle grid outline.
 */
function renderFloorCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  c: number,
  r: number,
) {
  const isAlternate = (c + r) % 2 === 0;
  ctx.fillStyle = isAlternate ? "#5c4333" : "#533c2d";
  ctx.fillRect(x, y, cellW, cellH);

  ctx.strokeStyle = "#412f23";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, cellW, cellH);
}

/**
 * Renders the base grid layer (walls, lava, floors).
 * Iterates through all cells and delegates to specific render functions.
 */
export function renderGridBase(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  t: number,
) {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = state.grid[r][c];
      const isFilledLava = state.filledLava[r][c];
      const x = c * cellW;
      const y = r * cellH;

      if (cell === "wall") {
        renderWallCell(ctx, x, y, cellW, cellH);
      } else if (cell === "lava" && !isFilledLava) {
        renderLavaCell(ctx, x, y, cellW, cellH, t, c, r);
      } else if (cell === "lava" && isFilledLava) {
        renderFilledLavaCell(ctx, x, y, cellW, cellH);
      } else {
        renderFloorCell(ctx, x, y, cellW, cellH, c, r);
      }
    }
  }
}

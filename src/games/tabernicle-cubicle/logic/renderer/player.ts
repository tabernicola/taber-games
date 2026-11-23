import type { Direction, GameState } from "../types";
import type { LoadedImages } from "../renderer";

const SPRITE_COLS = 8;
const SPRITE_ROWS = 4;

/**
 * Maps player direction to sprite sheet row.
 * Row 0: down, Row 1: up, Row 2: left, Row 3: right.
 */
function getPlayerSpriteFrame(dir: Direction): number {
  if (dir === "down") return 0;
  if (dir === "up") return 1;
  if (dir === "left") return 2;
  return 3;
}

/**
 * Calculates the animation frame column based on movement.
 * Returns 0 when idle, otherwise cycles through frames based on moveProgress.
 */
function getPlayerAnimationFrameCol(moving: boolean, moveProgress: number): number {
  if (!moving) return 0;
  return Math.min(SPRITE_COLS - 1, Math.max(0, Math.floor(moveProgress * SPRITE_COLS)));
}

/**
 * Renders the player from the spritesheet.
 * Uses appropriate frame based on direction and animation progress.
 */
function renderPlayerSprite(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  px: number,
  py: number,
  cellW: number,
  cellH: number,
  dir: Direction,
  moving: boolean,
  moveProgress: number,
) {
  const frameW = sheet.naturalWidth / SPRITE_COLS;
  const frameH = sheet.naturalHeight / SPRITE_ROWS;

  const frameRow = getPlayerSpriteFrame(dir);
  const frameCol = getPlayerAnimationFrameCol(moving, moveProgress);

  const sx = frameCol * frameW;
  const sy = frameRow * frameH;

  const drawW = cellW * 1.35;
  const drawH = drawW * (frameH / frameW);
  const drawX = px + (cellW - drawW) / 2;
  const drawY = py + (cellH - drawH) / 2 - cellH * 0.16;

  ctx.drawImage(sheet, sx, sy, frameW, frameH, drawX, drawY, drawW, drawH);
}

/**
 * Renders the shadow beneath the player.
 * Semi-transparent ellipse on the ground.
 */
function renderPlayerShadow(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellW: number,
  cellH: number,
  alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.beginPath();
  ctx.ellipse(px + cellW * 0.5, py + cellH * 0.88, cellW * 0.32, cellH * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Renders the player character (Taber).
 * Handles invincibility blinking, shadow, and spritesheet/fallback rendering.
 */
export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  images: LoadedImages,
  cellW: number,
  cellH: number,
  t: number,
  introProgress = 1,
) {
  const p = state.player;
  const px = p.x * cellW;
  const progress = Math.max(0, Math.min(1, introProgress));
  const easeOut = 1 - (1 - progress) ** 3;
  const flightOffset = cellH * (4 * (1 - easeOut) + Math.sin(progress * Math.PI) * 0.2);
  const py = p.y * cellH - flightOffset;

  const isBlinking = p.invincibleTimer > 0 && Math.floor(t * 12) % 2 === 0;

  if (!isBlinking) {
    renderPlayerShadow(ctx, px, p.y * cellH, cellW, cellH, easeOut);

    const sheet = images.spritesheet;
    if (sheet && sheet.complete && sheet.naturalWidth > 0) {
      renderPlayerSprite(ctx, sheet, px, py, cellW, cellH, p.dir, p.moving, p.moveProgress);
    } else {
      const walkBob = p.moving ? Math.sin(p.moveProgress * Math.PI * 2) * 3 : 0;
      drawFallbackTaber(ctx, px, py, cellW, cellH, p.dir, walkBob);
    }
  }
}

/**
 * Renders the yellow tunic of the fallback Taber character.
 * Diamond shape with brown spots.
 */
function drawFallbackTunic(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#f5d133";
  ctx.beginPath();
  ctx.moveTo(cx - cellW * 0.28, cy + cellH * 0.4);
  ctx.lineTo(cx - cellW * 0.15, cy - cellH * 0.1);
  ctx.lineTo(cx + cellW * 0.15, cy - cellH * 0.1);
  ctx.lineTo(cx + cellW * 0.28, cy + cellH * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

/**
 * Renders the brown spots on the fallback Taber's tunic.
 * Two small circles on the tunic surface.
 */
function drawFallbackTunicSpots(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#734316";
  ctx.beginPath();
  ctx.arc(cx - cellW * 0.08, cy + cellH * 0.15, cellW * 0.04, 0, Math.PI * 2);
  ctx.arc(cx + cellW * 0.12, cy + cellH * 0.25, cellW * 0.05, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Renders the head of the fallback Taber character.
 * Skin-colored circle.
 */
function drawFallbackHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#f7caa1";
  ctx.beginPath();
  ctx.arc(cx, cy - cellH * 0.18, cellW * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Renders the pilot goggles on the fallback Taber's head.
 * Dark frame with cyan lenses.
 */
function drawFallbackGoggles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#3a4352";
  ctx.fillRect(cx - cellW * 0.2, cy - cellH * 0.24, cellW * 0.4, cellH * 0.09);
  ctx.fillStyle = "#7ae2ff";
  ctx.beginPath();
  ctx.arc(cx - cellW * 0.1, cy - cellH * 0.2, cellW * 0.07, 0, Math.PI * 2);
  ctx.arc(cx + cellW * 0.1, cy - cellH * 0.2, cellW * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Renders the propeller hat on the fallback Taber's head.
 * Brown semi-circle dome.
 */
function drawFallbackPropellerHat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#b56c2d";
  ctx.beginPath();
  ctx.arc(cx, cy - cellH * 0.35, cellW * 0.12, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Renders the wooden propeller blades on the hat.
 * Horizontal rectangle on top of the hat.
 */
function drawFallbackPropellerBlades(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellW: number,
  cellH: number,
) {
  ctx.fillStyle = "#e08d41";
  ctx.fillRect(cx - cellW * 0.22, cy - cellH * 0.43, cellW * 0.44, cellH * 0.06);
  ctx.strokeRect(cx - cellW * 0.22, cy - cellH * 0.43, cellW * 0.44, cellH * 0.06);
}

/**
 * Renders the complete fallback Taber character.
 * Used when spritesheet is not loaded. Draws all body parts.
 */
function drawFallbackTaber(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cellW: number,
  cellH: number,
  dir: Direction,
  bob: number,
) {
  const cx = px + cellW * 0.5;
  const cy = py + cellH * 0.5 + bob;

  drawFallbackTunic(ctx, cx, cy, cellW, cellH);
  drawFallbackTunicSpots(ctx, cx, cy, cellW, cellH);
  drawFallbackHead(ctx, cx, cy, cellW, cellH);
  drawFallbackGoggles(ctx, cx, cy, cellW, cellH);
  drawFallbackPropellerHat(ctx, cx, cy, cellW, cellH);
  drawFallbackPropellerBlades(ctx, cx, cy, cellW, cellH);
}

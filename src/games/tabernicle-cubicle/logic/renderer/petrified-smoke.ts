import type { GameState } from "../types";

export function renderPetrifiedSmoke(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
  smokeImage: HTMLImageElement | null,
) {
  if (!smokeImage?.complete || smokeImage.naturalWidth === 0) return;

  for (const effect of state.petrifiedSmokeEffects) {
    const progress = 1 - effect.timeRemaining / effect.duration;
    const size = cellW * (1 + progress * 0.6);
    const x = (effect.x + 0.5) * cellW - size / 2;
    const y = (effect.y + 0.5) * cellH - size / 2 - progress * cellH * 0.35;

    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.drawImage(smokeImage, x, y, size, size);
    ctx.restore();
  }
}

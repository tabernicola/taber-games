import type { GameState } from "../types";

export function renderBlockBreakEffects(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cellW: number,
  cellH: number,
) {
  for (const effect of state.blockBreakEffects) {
    const progress = 1 - effect.timeRemaining / effect.duration;
    const centerX = (effect.x + 0.5) * cellW;
    const centerY = (effect.y + 0.5) * cellH;
    const spread = cellW * (0.18 + progress * 0.55);
    const alpha = 1 - progress;
    const { dx, dy } =
      effect.dir === "up"
        ? { dx: 0, dy: -1 }
        : effect.dir === "down"
          ? { dx: 0, dy: 1 }
          : effect.dir === "left"
            ? { dx: -1, dy: 0 }
            : { dx: 1, dy: 0 };

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#b9c3cf";
    ctx.strokeStyle = "#e7a94b";
    ctx.lineWidth = Math.max(1, cellW * 0.025);

    for (let shard = 0; shard < 6; shard++) {
      const angle = (Math.PI * 2 * shard) / 6 + (dx || dy) * Math.PI * 0.12;
      const x = centerX + Math.cos(angle) * spread;
      const y = centerY + Math.sin(angle) * spread;
      const size = cellW * (0.07 + (shard % 2) * 0.025);

      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y + size * 0.6);
      ctx.lineTo(x - size * 0.7, y + size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}

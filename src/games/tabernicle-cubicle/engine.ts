import * as Phaser from "phaser";
import sprites from "@/assets/taber-cubicle-sprites.png.asset.json";
import {
  createLevel,
  fire,
  move,
  patrol,
  roll,
  strike,
  vectors,
  type Direction,
  type State,
} from "./model";
export type Controls = {
  direction: Direction | null;
  action: "fire" | "strike" | null;
  paused: boolean;
};
export function mountGame(parent: HTMLElement, controls: Controls, publish: (s: State) => void) {
  const css = getComputedStyle(parent);
  const color = (token: string) =>
    Phaser.Display.Color.HexStringToColor(css.getPropertyValue(token).trim()).color;
  const palette = {
    lava: color("--tc-lava"),
    glow: color("--tc-glow"),
    ground: color("--tc-ground"),
    edge: color("--tc-edge"),
    ink: color("--tc-ink"),
    stone: color("--tc-stone"),
    crack: color("--tc-crack"),
    leaf: color("--tc-leaf"),
    egg: color("--tc-egg"),
    white: color("--tc-white"),
  };
  const tile = 64,
    state = createLevel();
  class Volcano extends Phaser.Scene {
    g: Phaser.GameObjects.Graphics | undefined;
    hero: Phaser.GameObjects.Sprite | undefined;
    lastMove = 0;
    lastRoll = 0;
    lastPatrol = 0;
    lastPublish = 0;
    effect = 0;
    effectKind = "fire";
    previousStatus = "playing";
    clock = 0;
    reduced = false;
    preload() {
      this.load.spritesheet("taber", sprites.url, { frameWidth: 256, frameHeight: 256 });
    }
    create() {
      this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.g = this.add.graphics();
      this.hero = this.add
        .sprite((state.hero.x + 0.5) * tile, (state.hero.y + 0.5) * tile, "taber", 3)
        .setDisplaySize(76, 76)
        .setDepth(2);
      this.load.on("loaderror", () => {});
      publish({ ...state });
    }
    update(time: number, delta: number) {
      if (!this.g || !this.hero) return;
      const active = !controls.paused && state.status === "playing";
      if (active) {
        state.elapsed += Math.min(delta, 50) / 1000;
        this.clock += Math.min(delta, 50);
        if (controls.direction && this.clock - this.lastMove > 180) {
          move(state, controls.direction);
          this.lastMove = this.clock;
        }
        if (controls.action) {
          if (controls.action === "fire") fire(state);
          else strike(state);
          this.effect = time + 280;
          this.effectKind = controls.action;
          controls.action = null;
        }
        if (this.clock - this.lastRoll > 105) {
          roll(state);
          this.lastRoll = this.clock;
        }
        if (this.clock - this.lastPatrol > 1600) {
          patrol(state);
          this.lastPatrol = this.clock;
        }
      } else controls.action = null;
      if (time - this.lastPublish > 150 || this.previousStatus !== state.status) {
        publish({ ...state });
        this.lastPublish = time;
        this.previousStatus = state.status;
      }
      const motion = this.reduced ? 0 : time;
      this.draw(motion, time);
      const x = (state.hero.x + 0.5) * tile,
        y = (state.hero.y + 0.5) * tile;
      this.hero.x = Phaser.Math.Linear(this.hero.x, x, Math.min(1, delta / 55));
      this.hero.y = Phaser.Math.Linear(this.hero.y, y, Math.min(1, delta / 55));
      const frames: Record<Direction, number> = { down: 0, up: 1, left: 2, right: 3 };
      this.hero.setFrame(
        frames[state.direction] + (this.effect > time && this.effectKind === "strike" ? 4 : 0),
      );
      this.hero.setAngle(
        active && controls.direction && !this.reduced ? Math.sin(time / 65) * 4 : 0,
      );
    }
    draw(motion: number, time: number) {
      const g = this.g;
      if (!g) return;
      g.clear();
      g.fillStyle(palette.lava);
      g.fillRect(0, 0, 704, 576);
      for (let y = 0; y < 9; y++)
        for (let x = 0; x < 11; x++) {
          const cell = state.tiles[y][x],
            px = x * tile,
            py = y * tile;
          if (cell === "~") {
            g.lineStyle(3, palette.glow, 0.55);
            g.beginPath();
            g.moveTo(px + 7, py + 31 + Math.sin(motion / 650 + x + y) * 10);
            g.lineTo(px + 30, py + 26);
            g.lineTo(px + 56, py + 34 + Math.cos(motion / 800 + x) * 9);
            g.strokePath();
            g.fillStyle(palette.glow, 0.55);
            g.fillCircle(px + 17, py + 15, 2 + Math.sin(motion / 700 + x + y) * 1.5);
          } else {
            g.fillStyle(palette.edge);
            g.fillRoundedRect(px + 1, py + 2, tile - 2, tile - 1, 7);
            g.fillStyle(cell === "=" ? palette.stone : palette.ground);
            g.fillRoundedRect(px + 2, py, tile - 4, tile - 9, 7);
            g.lineStyle(2, palette.crack, 0.5);
            g.beginPath();
            g.moveTo(px + 12, py + 20);
            g.lineTo(px + 23, py + 25);
            g.lineTo(px + 20, py + 36);
            g.strokePath();
            if (cell === "#") {
              g.fillStyle(palette.ink);
              g.fillEllipse(px + 32, py + 44, 45, 24);
              g.fillStyle(palette.stone);
              g.fillTriangle(px + 10, py + 37, px + 28, py + 7, px + 52, py + 38);
              g.fillStyle(palette.crack);
              g.fillTriangle(px + 28, py + 7, px + 35, py + 28, px + 52, py + 38);
            }
          }
        }
      const ex = (state.exit.x + 0.5) * tile,
        ey = (state.exit.y + 0.5) * tile;
      g.lineStyle(8, state.eggs.length ? palette.stone : palette.leaf);
      g.strokeEllipse(ex, ey, 40, 52);
      g.fillStyle(palette.ink, 0.8);
      g.fillEllipse(ex, ey, 26, 40);
      if (!state.eggs.length) {
        g.fillStyle(palette.leaf, 0.4);
        g.fillEllipse(ex, ey, 18 + Math.sin(motion / 200) * 5, 35);
      }
      for (const e of state.eggs) {
        const x = (e.x + 0.5) * tile,
          y = (e.y + 0.5) * tile + Math.sin(motion / 350 + e.y) * 3;
        g.fillStyle(palette.ink, 0.4);
        g.fillEllipse(x, y + 20, 30, 9);
        g.fillStyle(palette.egg);
        g.fillEllipse(x, y, 26, 35);
        g.fillStyle(palette.leaf);
        g.fillCircle(x - 4, y - 5, 4);
        g.fillCircle(x + 5, y + 6, 5);
        g.fillStyle(palette.white, 0.75);
        g.fillEllipse(x - 5, y - 10, 5, 9);
      }
      for (const c of state.creatures) {
        const x = (c.x + 0.5) * tile,
          y = (c.y + 0.5) * tile;
        g.fillStyle(palette.ink, 0.4);
        g.fillEllipse(x, y + 20, 40, 13);
        if (c.kind === "stone") {
          g.fillStyle(palette.stone);
          g.fillCircle(x, y, 22);
          g.lineStyle(3, palette.crack);
          const a = c.rolling ? motion / 90 : 0.6;
          g.beginPath();
          g.moveTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17);
          g.lineTo(x, y - 3);
          g.lineTo(x - 9, y + 14);
          g.strokePath();
          g.fillStyle(palette.white, 0.3);
          g.fillCircle(x - 8, y - 8, 5);
        } else {
          const bounce = Math.sin(motion / 160) * 3;
          g.fillStyle(palette.leaf);
          g.fillEllipse(x, y + bounce, 42, 36);
          g.fillTriangle(x - 20, y, x - 24, y - 26, x - 7, y - 15);
          g.fillTriangle(x + 20, y, x + 24, y - 26, x + 7, y - 15);
          g.fillStyle(palette.white);
          g.fillEllipse(x - 8, y - 6 + bounce, 11, 14);
          g.fillEllipse(x + 8, y - 6 + bounce, 11, 14);
          g.fillStyle(palette.ink);
          g.fillCircle(x - 7, y - 5 + bounce, 3);
          g.fillCircle(x + 7, y - 5 + bounce, 3);
          g.lineStyle(3, palette.ink);
          g.lineBetween(x - 6, y + 9 + bounce, x + 6, y + 9 + bounce);
        }
      }
      if (this.effect > time && this.effectKind === "fire") {
        const [dx, dy] = vectors[state.direction];
        const x = (state.hero.x + 0.5) * tile,
          y = (state.hero.y + 0.5) * tile;
        for (let i = 1; i <= 7; i++) {
          const dist = i * 22;
          g.fillStyle(i % 2 ? palette.glow : palette.egg, (this.effect - time) / 280);
          g.fillCircle(x + dx * dist, y + dy * dist, 18 - i * 1.4);
        }
      }
    }
  }
  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 704,
    height: 576,
    transparent: true,
    scene: Volcano,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true },
    fps: { target: 60 },
    audio: { noAudio: true },
  });
  return () => game.destroy(true);
}

export type Direction = "up" | "down" | "left" | "right";
export const vectors: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};
export type Point = { x: number; y: number };
export type Creature = Point & {
  kind: "enemy" | "stone";
  rolling: Direction | null;
  patrol: number;
};
export type State = {
  tiles: string[][];
  hero: Point;
  direction: Direction;
  creatures: Creature[];
  eggs: Point[];
  exit: Point;
  status: "playing" | "won" | "lost";
  elapsed: number;
  bridges: number;
};
export function createLevel(): State {
  return {
    tiles: [
      "~~~~~~~~~~~",
      "~.....~...~",
      "~.#...~...~",
      "~.....~...~",
      "~.....~...~",
      "~.....~...~",
      "~...#.~.#.~",
      "~.....~...~",
      "~~~~~~~~~~~",
    ].map((row) => row.split("")),
    hero: { x: 2, y: 4 },
    direction: "right",
    creatures: [{ x: 4, y: 4, kind: "enemy", rolling: null, patrol: 1 }],
    eggs: [
      { x: 8, y: 3 },
      { x: 8, y: 5 },
    ],
    exit: { x: 9, y: 4 },
    status: "playing",
    elapsed: 0,
    bridges: 0,
  };
}
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
export function tileAt(s: State, p: Point) {
  return s.tiles[p.y]?.[p.x] ?? "#";
}
export function move(s: State, d: Direction) {
  if (s.status !== "playing") return;
  s.direction = d;
  const [dx, dy] = vectors[d];
  const p = { x: s.hero.x + dx, y: s.hero.y + dy };
  if (tileAt(s, p) === "#" || s.creatures.some((c) => c.kind === "stone" && same(c, p))) return;
  if (tileAt(s, p) === "~" || s.creatures.some((c) => c.kind === "enemy" && same(c, p))) {
    s.status = "lost";
    return;
  }
  s.hero = p;
  s.eggs = s.eggs.filter((egg) => !same(egg, p));
  if (!s.eggs.length && same(p, s.exit)) s.status = "won";
}
export function fire(s: State) {
  if (s.status !== "playing") return;
  const [dx, dy] = vectors[s.direction];
  for (let i = 1; i <= 3; i++) {
    const p = { x: s.hero.x + dx * i, y: s.hero.y + dy * i };
    if (tileAt(s, p) === "#" || tileAt(s, p) === "~") break;
    const c = s.creatures.find((c) => same(c, p));
    if (c) {
      if (c.kind === "enemy") {
        c.kind = "stone";
        c.rolling = null;
      }
      break;
    }
  }
}
export function strike(s: State) {
  if (s.status !== "playing") return;
  const [dx, dy] = vectors[s.direction];
  const c = s.creatures.find(
    (c) => c.kind === "stone" && same(c, { x: s.hero.x + dx, y: s.hero.y + dy }),
  );
  if (c) c.rolling = s.direction;
}
export function roll(s: State) {
  if (s.status !== "playing") return;
  for (const c of [...s.creatures]) {
    if (!c.rolling) continue;
    const [dx, dy] = vectors[c.rolling];
    const p = { x: c.x + dx, y: c.y + dy };
    if (tileAt(s, p) === "#" || s.creatures.some((other) => other !== c && same(other, p))) {
      c.rolling = null;
      continue;
    }
    if (tileAt(s, p) === "~") {
      s.tiles[p.y][p.x] = "=";
      s.bridges++;
      s.creatures = s.creatures.filter((other) => other !== c);
      continue;
    }
    c.x = p.x;
    c.y = p.y;
    if (same(c, s.hero)) s.status = "lost";
  }
}
export function patrol(s: State) {
  if (s.status !== "playing") return;
  for (const c of s.creatures) {
    if (c.kind !== "enemy") continue;
    if (c.y >= 5) c.patrol = -1;
    if (c.y <= 3) c.patrol = 1;
    c.y += c.patrol;
    if (same(c, s.hero)) s.status = "lost";
  }
}

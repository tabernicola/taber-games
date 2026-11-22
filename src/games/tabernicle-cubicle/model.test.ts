import { describe, expect, it } from "vitest";
import { createLevel, fire, move, strike, roll, patrol } from "./model";
describe("Tabernicle Cubicle", () => {
  it("fire turns a creature into a stone ball", () => {
    const s = createLevel();
    fire(s);
    expect(s.creatures[0].kind).toBe("stone");
  });
  it("a club hit rolls the stone into lava and creates walkable ground", () => {
    const s = createLevel();
    fire(s);
    move(s, "right");
    strike(s);
    roll(s);
    roll(s);
    expect(s.tiles[4][6]).toBe("=");
    expect(s.creatures).toHaveLength(0);
    move(s, "right");
    move(s, "right");
    move(s, "right");
    expect(s.hero).toEqual({ x: 6, y: 4 });
    expect(s.status).toBe("playing");
  });
  it("lava kills the hero", () => {
    const s = createLevel();
    s.hero = { x: 5, y: 3 };
    move(s, "right");
    expect(s.status).toBe("lost");
  });
  it("walls stop movement", () => {
    const s = createLevel();
    s.hero = { x: 1, y: 2 };
    move(s, "right");
    expect(s.hero).toEqual({ x: 1, y: 2 });
  });
  it("the portal requires both eggs", () => {
    const s = createLevel();
    s.hero = { x: 8, y: 4 };
    move(s, "right");
    expect(s.status).toBe("playing");
  });
  it("the whole first level is solvable", () => {
    const s = createLevel();
    fire(s);
    move(s, "right");
    strike(s);
    roll(s);
    roll(s);
    for (let i = 0; i < 5; i++) move(s, "right");
    move(s, "up");
    move(s, "down");
    move(s, "down");
    move(s, "up");
    move(s, "right");
    expect(s.eggs).toHaveLength(0);
    expect(s.status).toBe("won");
  });
  it("petrified creatures no longer patrol", () => {
    const s = createLevel();
    fire(s);
    patrol(s);
    expect(s.creatures[0].y).toBe(4);
  });
});

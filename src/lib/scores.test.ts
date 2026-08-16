import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchTopScores, formatTime, submitScore } from "./scores";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockFrom.mockReset();
});

describe("formatTime", () => {
  it("formats seconds under a minute", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(59)).toBe("0:59");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(75)).toBe("1:15");
    expect(formatTime(600)).toBe("10:00");
  });

  it("formats hours with zero-padded minutes", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    expect(formatTime(7325)).toBe("2:02:05");
  });
});

function selectChain(result: { data: unknown; error: unknown }) {
  const limit = vi.fn().mockResolvedValue(result);
  const orderSeconds = vi.fn().mockReturnValue({ limit });
  const orderLevel = vi.fn().mockReturnValue({ order: orderSeconds });
  const eqLevel = vi.fn().mockReturnValue({ order: orderLevel });
  const eqGame = vi.fn().mockReturnValue({ eq: eqLevel, order: orderLevel });
  const select = vi.fn().mockReturnValue({ eq: eqGame, order: orderLevel });
  return { select, eqGame, eqLevel, orderLevel, orderSeconds, limit };
}

describe("fetchTopScores", () => {
  it("queries the scores table filtered by game and level", async () => {
    const scores = [{ id: "1", player_name: "Ana", seconds: 42, level: 2, created_at: "now" }];
    const chain = selectChain({ data: scores, error: null });
    mockFrom.mockReturnValue({ select: chain.select } as never);

    const result = await fetchTopScores("taber-square", 2);

    expect(mockFrom).toHaveBeenCalledWith("scores");
    expect(chain.eqGame).toHaveBeenCalledWith("game", "taber-square");
    expect(chain.eqLevel).toHaveBeenCalledWith("level", 2);
    expect(chain.orderLevel).toHaveBeenCalledWith("level", { ascending: false });
    expect(chain.orderSeconds).toHaveBeenCalledWith("seconds", { ascending: true });
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual(scores);
  });

  it("returns an empty list when there is no data", async () => {
    const chain = selectChain({ data: null, error: null });
    mockFrom.mockReturnValue({ select: chain.select } as never);
    expect(await fetchTopScores("eternity-ii")).toEqual([]);
  });

  it("throws when supabase returns an error", async () => {
    const chain = selectChain({ data: null, error: new Error("boom") });
    mockFrom.mockReturnValue({ select: chain.select } as never);
    await expect(fetchTopScores("eternity-ii")).rejects.toThrow("boom");
  });
});

describe("submitScore", () => {
  function insertChain(result: { error: unknown }) {
    const insert = vi.fn().mockResolvedValue(result);
    mockFrom.mockReturnValue({ insert } as never);
    return insert;
  }

  it("inserts the trimmed player name", async () => {
    const insert = insertChain({ error: null });
    await submitScore("taber-square", 2, "  Ana  ", 42);
    expect(insert).toHaveBeenCalledWith({
      game: "taber-square",
      level: 2,
      player_name: "Ana",
      seconds: 42,
    });
  });

  it("truncates names longer than 24 characters", async () => {
    const insert = insertChain({ error: null });
    await submitScore("taber-square", 1, "a".repeat(30), 10);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ player_name: "a".repeat(24) }));
  });

  it("falls back to Anon for a blank name", async () => {
    const insert = insertChain({ error: null });
    await submitScore("eternity-ii", 4, "   ", 5);
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ player_name: "Anon" }));
  });

  it("throws when the insert fails", async () => {
    insertChain({ error: new Error("nope") });
    await expect(submitScore("eternity-ii", 4, "Ana", 5)).rejects.toThrow("nope");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScoresService } from "./createScoresService";
import { formatTime } from "./formatTime";
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
  const select = vi.fn().mockReturnValue({ eq: eqLevel, order: orderLevel });
  return { select, eqLevel, orderLevel, orderSeconds, limit };
}

describe("createScoresService", () => {
  const service = createScoresService("scores_taber_square");

  it("exposes its table", () => {
    expect(service.table).toBe("scores_taber_square");
  });

  describe("fetchTop", () => {
    it("queries the game table filtered by level", async () => {
      const scores = [{ id: "1", player_name: "Ana", seconds: 42, level: 2, created_at: "now" }];
      const chain = selectChain({ data: scores, error: null });
      mockFrom.mockReturnValue({ select: chain.select } as never);

      const result = await service.fetchTop(2);

      expect(mockFrom).toHaveBeenCalledWith("scores_taber_square");
      expect(chain.eqLevel).toHaveBeenCalledWith("level", 2);
      expect(chain.orderLevel).toHaveBeenCalledWith("level", { ascending: false });
      expect(chain.orderSeconds).toHaveBeenCalledWith("seconds", { ascending: true });
      expect(chain.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(scores);
    });

    it("queries without level filter when omitted", async () => {
      const chain = selectChain({ data: null, error: null });
      mockFrom.mockReturnValue({ select: chain.select } as never);

      expect(await service.fetchTop()).toEqual([]);
      expect(mockFrom).toHaveBeenCalledWith("scores_taber_square");
      expect(chain.eqLevel).not.toHaveBeenCalled();
    });

    it("throws when supabase returns an error", async () => {
      const chain = selectChain({ data: null, error: new Error("boom") });
      mockFrom.mockReturnValue({ select: chain.select } as never);
      await expect(service.fetchTop()).rejects.toThrow("boom");
    });
  });

  describe("submit", () => {
    /** Mock where the session has no row yet, so submit falls through to insert. */
    function insertChain(result: { error: unknown }) {
      const insert = vi.fn().mockResolvedValue(result);
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqLevel = vi.fn().mockReturnValue({ maybeSingle });
      const eqSession = vi.fn().mockReturnValue({ eq: eqLevel });
      const select = vi.fn().mockReturnValue({ eq: eqSession, maybeSingle });
      mockFrom.mockReturnValue({ insert, select } as never);
      return insert;
    }

    it("inserts into the game table with the trimmed player name", async () => {
      const insert = insertChain({ error: null });
      await service.submit(2, "  Ana  ", 42);
      expect(insert).toHaveBeenCalledWith({
        level: 2,
        player_name: "Ana",
        seconds: 42,
      });
    });

    it("truncates names longer than 24 characters", async () => {
      const insert = insertChain({ error: null });
      await service.submit(1, "a".repeat(30), 10);
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({ player_name: "a".repeat(24) }));
    });

    it("falls back to Anon for a blank name", async () => {
      const insert = insertChain({ error: null });
      await service.submit(4, "   ", 5);
      expect(insert).toHaveBeenCalledWith(expect.objectContaining({ player_name: "Anon" }));
    });

    it("throws when the insert fails", async () => {
      insertChain({ error: new Error("nope") });
      await expect(service.submit(4, "Ana", 5)).rejects.toThrow("nope");
    });

    it("persists the level, its progress and the session data", async () => {
      const insert = insertChain({ error: null });
      await service.submit(3, "Ana", 95, "sess1", 95, 3, 40);
      expect(insert).toHaveBeenCalledWith({
        level: 3,
        player_name: "Ana",
        seconds: 95,
        session_id: "sess1",
        last_completion_time: 95,
        max_level: 3,
        level_progress: 40,
      });
    });

    it("omits level progress when the game does not track it", async () => {
      const insert = insertChain({ error: null });
      await service.submit(3, "Ana", 95, "sess1");
      expect(insert).toHaveBeenCalledWith(
        expect.not.objectContaining({ level_progress: expect.anything() }),
      );
    });
  });

  describe("submit with an existing session", () => {
    function updateChain(existing: unknown) {
      const eqLevel = vi.fn().mockResolvedValue({ error: null });
      const eqSession = vi.fn().mockReturnValue({ eq: eqLevel });
      const update = vi.fn().mockReturnValue({ eq: eqSession });
      const maybeSingle = vi
        .fn()
        .mockResolvedValue(
          existing ? { data: existing, error: null } : { data: null, error: null },
        );
      const eqLevelSelect = vi.fn().mockReturnValue({ maybeSingle });
      const eqSessionSelect = vi.fn().mockReturnValue({ eq: eqLevelSelect });
      const select = vi.fn().mockReturnValue({ eq: eqSessionSelect, maybeSingle });
      mockFrom.mockReturnValue({ select, update } as never);
      return { select, maybeSingle, update, eqSession, eqLevel };
    }

    it("updates the session+level row with the new time and progress", async () => {
      const chain = updateChain({ id: "1", level: 2 });
      await service.submit(2, "Ana", 95, "sess1", 95, 2, 30);
      expect(chain.update).toHaveBeenCalledWith({
        player_name: "Ana",
        seconds: 95,
        last_completion_time: 95,
        level_progress: 30,
      });
      expect(chain.eqSession).toHaveBeenCalledWith("session_id", "sess1");
      expect(chain.eqLevel).toHaveBeenCalledWith("level", 2);
    });

    it("inserts a new row when the level differs from the existing session row", async () => {
      const insert = vi.fn().mockResolvedValue({ error: null });
      const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqLevel = vi.fn().mockReturnValue({ maybeSingle });
      const eqSession = vi.fn().mockReturnValue({ eq: eqLevel });
      const select = vi.fn().mockReturnValue({ eq: eqSession, maybeSingle });
      mockFrom.mockReturnValue({ insert, select } as never);
      await service.submit(3, "Ana", 95, "sess1", 95, 3, 40);
      expect(insert).toHaveBeenCalledWith({
        level: 3,
        player_name: "Ana",
        seconds: 95,
        session_id: "sess1",
        last_completion_time: 95,
        max_level: 3,
        level_progress: 40,
      });
    });
  });

  describe("rename", () => {
    function renameChain(result: { error: unknown }) {
      const eq = vi.fn().mockResolvedValue(result);
      const update = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ update } as never);
      return { update, eq };
    }

    it("rewrites only the player name of the session row", async () => {
      const chain = renameChain({ error: null });
      await service.rename("sess1", "  Ana  ");
      expect(chain.update).toHaveBeenCalledWith({ player_name: "Ana" });
      expect(chain.eq).toHaveBeenCalledWith("session_id", "sess1");
    });

    it("truncates names longer than 24 characters", async () => {
      const chain = renameChain({ error: null });
      await service.rename("sess1", "a".repeat(30));
      expect(chain.update).toHaveBeenCalledWith({ player_name: "a".repeat(24) });
    });

    it("falls back to Anon for a blank name", async () => {
      const chain = renameChain({ error: null });
      await service.rename("sess1", "   ");
      expect(chain.update).toHaveBeenCalledWith({ player_name: "Anon" });
    });

    it("throws when supabase returns an error", async () => {
      renameChain({ error: new Error("nope") });
      await expect(service.rename("sess1", "Ana")).rejects.toThrow("nope");
    });
  });
});

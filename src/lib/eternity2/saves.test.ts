import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteSave, loadSave, storeSave } from "./saves";
import { supabase } from "@/integrations/supabase/client";
import type { Placement } from "./game";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockFrom = vi.mocked(supabase.from);

beforeEach(() => {
  mockFrom.mockReset();
});

const board: Placement[] = [{ tileId: 0, rotation: 1, locked: false }, null];
const tiles = [[1, 2, 3, 4] as const];

describe("loadSave", () => {
  function selectChain(result: { data: unknown; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result);
    const select = vi.fn().mockReturnValue({ maybeSingle });
    mockFrom.mockReturnValue({ select } as never);
    return { select, maybeSingle };
  }

  it("returns null when there is no save", async () => {
    selectChain({ data: null, error: null });
    expect(await loadSave()).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith("eternity_saves");
  });

  it("unpacks the stored state", async () => {
    const solution = [{ tileId: 0, rotation: 3 as const }];
    selectChain({
      data: {
        level: 6,
        seconds: 120,
        state: { board, tiles, solution },
        updated_at: "2026-01-01",
      },
      error: null,
    });
    expect(await loadSave()).toEqual({
      level: 6,
      seconds: 120,
      board,
      tiles,
      solution,
      updated_at: "2026-01-01",
    });
  });

  it("throws on a supabase error", async () => {
    selectChain({ data: null, error: new Error("db down") });
    await expect(loadSave()).rejects.toThrow("db down");
  });
});

describe("storeSave", () => {
  it("upserts the save keyed by user", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert } as never);

    await storeSave("user-1", 8, 300, board, tiles as never);

    expect(mockFrom).toHaveBeenCalledWith("eternity_saves");
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        level: 8,
        seconds: 300,
        state: { board, tiles, solution: undefined },
      },
      { onConflict: "user_id" },
    );
  });

  it("throws when the upsert fails", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: new Error("nope") });
    mockFrom.mockReturnValue({ upsert } as never);
    await expect(storeSave("user-1", 4, 10, [], [] as never)).rejects.toThrow("nope");
  });
});

describe("deleteSave", () => {
  it("deletes the row for the user", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ delete: del } as never);

    await deleteSave("user-1");

    expect(mockFrom).toHaveBeenCalledWith("eternity_saves");
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("throws when the delete fails", async () => {
    const eq = vi.fn().mockResolvedValue({ error: new Error("denied") });
    mockFrom.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq }) } as never);
    await expect(deleteSave("user-1")).rejects.toThrow("denied");
  });
});

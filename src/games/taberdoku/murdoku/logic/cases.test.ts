import { beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_CASE } from "../data/gameSchema";

const { from, result } = vi.hoisted(() => {
  const result = { data: null as unknown, error: null as unknown };
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn(async () => result),
    single: vi.fn(async () => result),
  };
  return { from: vi.fn(() => chain), result };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from } }));
import { fetchApprovedCases, fetchCase } from "./cases";

describe("stored reusable Murdoku cases", () => {
  beforeEach(() => { vi.clearAllMocks(); result.error = null; });
  const saved = {
    ...SAMPLE_CASE,
    id: "02402400-0000-4000-8000-000000000002",
    board_id: "02402400-0000-4000-8000-000000000001",
    title_i18n: SAMPLE_CASE.titleI18n,
  };

  it("loads the reconstructed board, elements, cast and clues from the view", async () => {
    result.data = saved;
    const loaded = await fetchCase(saved.id);
    expect(from).toHaveBeenCalledWith("murdoku_playable_cases");
    expect(loaded?.content).toEqual(SAMPLE_CASE.content);
    expect(loaded?.titleI18n).toEqual(SAMPLE_CASE.titleI18n);
    expect(loaded?.content.rooms.flatMap(r => r.elements ?? [])).toHaveLength(81);
    expect(loaded?.content.characters).toHaveLength(9);
  });

  it("uses reconstructed content for the approved case list too", async () => {
    result.data = [saved];
    expect(await fetchApprovedCases()).toEqual([expect.objectContaining({ id: saved.id, content: SAMPLE_CASE.content })]);
    expect(from).toHaveBeenCalledWith("murdoku_playable_cases");
  });

  it("preserves legacy embedded cases without a board relation", async () => {
    result.data = { ...saved, board_id: null };
    expect((await fetchCase(saved.id))?.content).toEqual(SAMPLE_CASE.content);
  });

  it("returns null when a case does not exist or is not visible", async () => {
    result.data = null;
    result.error = { code: "PGRST116" };
    expect(await fetchCase(saved.id)).toBeNull();
  });

  it("safely handles cases with missing characters or rooms and maps image", async () => {
    result.data = {
      id: "test-case-id",
      title: "Test Case",
      image: "/taberdoku/murdoku/cases/pintada.png",
      content: {
        clues: [],
        solution: { killerId: "killer1", placements: [] },
      },
    };
    const loaded = await fetchCase("test-case-id");
    expect(loaded).not.toBeNull();
    expect(loaded?.image).toBe("/taberdoku/murdoku/cases/pintada.png");
    expect(loaded?.content.characters).toEqual([]);
    expect(loaded?.content.rooms).toEqual([]);
  });
});
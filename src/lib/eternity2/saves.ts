import { supabase } from "@/integrations/supabase/client";
import type { Edges, Placement, Rotation } from "./game";

export type SavedGame = {
  level: number;
  seconds: number;
  board: Placement[];
  tiles: Edges[];
  solution?: { tileId: number; rotation: Rotation }[];
  helped?: boolean;
  updated_at: string;
};

export async function loadSave(): Promise<SavedGame | null> {
  const { data, error } = await supabase
    .from("eternity_saves")
    .select("level, seconds, state, updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const state = data.state as unknown as {
    board: Placement[];
    tiles: Edges[];
    solution?: { tileId: number; rotation: Rotation }[];
    helped?: boolean;
  };
  return {
    level: data.level,
    seconds: data.seconds,
    board: state.board,
    tiles: state.tiles,
    solution: state.solution,
    helped: state.helped,
    updated_at: data.updated_at,
  };
}

export async function storeSave(
  userId: string,
  level: number,
  seconds: number,
  board: Placement[],
  tiles: Edges[],
  solution?: { tileId: number; rotation: Rotation }[],
  helped?: boolean,
): Promise<void> {
  const { error } = await supabase.from("eternity_saves").upsert(
    {
      user_id: userId,
      level,
      seconds,
      state: { board, tiles, solution, helped } as unknown as never,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function deleteSave(userId: string): Promise<void> {
  const { error } = await supabase.from("eternity_saves").delete().eq("user_id", userId);
  if (error) throw error;
}

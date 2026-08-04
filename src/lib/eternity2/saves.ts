import { supabase } from "@/integrations/supabase/client";
import type { Placement } from "./game";

export type SavedGame = {
  level: number;
  seconds: number;
  board: Placement[];
  updated_at: string;
};

export async function loadSave(): Promise<SavedGame | null> {
  const { data, error } = await supabase
    .from("eternity_saves")
    .select("level, seconds, state, updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    level: data.level,
    seconds: data.seconds,
    board: (data.state as { board: Placement[] }).board,
    updated_at: data.updated_at,
  };
}

export async function storeSave(
  userId: string,
  level: number,
  seconds: number,
  board: Placement[],
): Promise<void> {
  const { error } = await supabase
    .from("eternity_saves")
    .upsert(
      { user_id: userId, level, seconds, state: { board } },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function deleteSave(userId: string): Promise<void> {
  const { error } = await supabase.from("eternity_saves").delete().eq("user_id", userId);
  if (error) throw error;
}

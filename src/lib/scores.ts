import { supabase } from "@/integrations/supabase/client";

export type GameId = "taber-square" | "eternity-ii";

export type Score = {
  id: string;
  player_name: string;
  seconds: number;
  created_at: string;
};

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function fetchTopScores(game: GameId, level = ""): Promise<Score[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("id, player_name, seconds, created_at")
    .eq("game", game)
    .eq("level", level)
    .order("seconds", { ascending: true })
    .limit(5);
  if (error) throw error;
  return data ?? [];
}

export async function submitScore(
  game: GameId,
  level: string,
  playerName: string,
  seconds: number,
): Promise<void> {
  const name = playerName.trim().slice(0, 24) || "Anon";
  const { error } = await supabase
    .from("scores")
    .insert({ game, level, player_name: name, seconds });
  if (error) throw error;
}

import { supabase } from "@/integrations/supabase/client";

export type Score = {
  id: string;
  player_name: string;
  seconds: number;
  level: number;
  created_at: string;
};

export type ScoreTable = "scores_taber_square" | "scores_tabers_star" | "scores_eternity_ii";

export type ScoresService = {
  /** Supabase table backing this service (one per game). */
  table: ScoreTable;
  fetchTop(level?: number): Promise<Score[]>;
  submit(level: number, playerName: string, seconds: number): Promise<void>;
};

/** Data access for a game's score table. One instance per game slice. */
export function createScoresService(table: ScoreTable): ScoresService {
  const fromScores = () => supabase.from(table as "scores_taber_square");

  return {
    table,
    async fetchTop(level?: number): Promise<Score[]> {
      let query = fromScores().select("id, player_name, seconds, level, created_at");
      if (level !== undefined) {
        query = query.eq("level", level);
      }
      query = query.order("level", { ascending: false }).order("seconds", { ascending: true });
      const { data, error } = await query.limit(5);
      if (error) throw error;
      return data ?? [];
    },

    async submit(level, playerName, seconds): Promise<void> {
      const name = playerName.trim().slice(0, 24) || "Anon";
      const { error } = await fromScores().insert({ level, player_name: name, seconds });
      if (error) throw error;
    },
  };
}

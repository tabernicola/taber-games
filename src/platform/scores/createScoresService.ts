import { supabase } from "@/integrations/supabase/client";

export type Score = {
  id: string;
  player_name: string;
  seconds: number;
  level: number;
  session_id?: string;
  last_completion_time?: number;
  max_level?: number;
  created_at: string;
};

export type ScoreTable =
  | "scores_taber_square"
  | "scores_tabers_star"
  | "scores_eternity_ii"
  | "scores_murdoku"
  | "scores_tabers_sudoku"
  | "scores_taberdoku";

export type ScoresService = {
  /** Supabase table backing this service (one per game). */
  table: ScoreTable;
  fetchTop(level?: number): Promise<Score[]>;
  submit(
    level: number,
    playerName: string,
    seconds: number,
    sessionId?: string,
    lastCompletionTime?: number,
    maxLevel?: number,
  ): Promise<void>;
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

    async submit(
      level,
      playerName,
      seconds,
      sessionId,
      lastCompletionTime,
      maxLevel,
    ): Promise<void> {
      const name = playerName.trim().slice(0, 24) || "Anon";

      if (sessionId) {
        // Check if session already exists
        const { data: existing } = await fromScores()
          .select("id")
          .eq("session_id", sessionId)
          .single();

        if (existing) {
          // Update existing record
          const { error } = await fromScores()
            .update({
              player_name: name,
              seconds,
              last_completion_time: lastCompletionTime,
              max_level: maxLevel,
            })
            .eq("session_id", sessionId);
          if (error) throw error;
          return;
        }
      }

      // Insert new record
      const { error } = await fromScores().insert({
        level,
        player_name: name,
        seconds,
        session_id: sessionId,
        last_completion_time: lastCompletionTime,
        max_level: maxLevel,
      });
      if (error) throw error;
    },
  };
}

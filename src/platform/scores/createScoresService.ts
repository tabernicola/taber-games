import { supabase } from "@/integrations/supabase/client";

export type Score = {
  id: string;
  player_name: string;
  seconds: number;
  level: number;
  session_id?: string;
  last_completion_time?: number;
  max_level?: number;
  /** Percentage (0-100) of boards solved in `level`, when the game tracks it. */
  level_progress?: number | null;
  created_at: string;
};

export type ScoreTable =
  | "scores_taber_square"
  | "scores_tabers_star"
  | "scores_eternity_ii"
  | "scores_murdoku"
  | "scores_tabers_sudoku"
  | "scores_star_battle";

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
    levelProgress?: number,
  ): Promise<void>;
  /**
   * Rewrites the player name of an already submitted session, so a rename shows
   * up in the ranking right away instead of on the next solved board.
   */
  rename(sessionId: string, playerName: string): Promise<void>;
};

/** Data access for a game's score table. One instance per game slice. */
export function createScoresService(table: ScoreTable): ScoresService {
  const fromScores = () => supabase.from(table as "scores_taberdoku");

  return {
    table,
    async fetchTop(level?: number): Promise<Score[]> {
      let query = fromScores().select(
        "id, player_name, seconds, level, created_at, max_level, level_progress",
      );
      if (level !== undefined) {
        query = query.eq("level", level);
      }
      query = query.order("level", { ascending: false }).order("seconds", { ascending: true });
      const { data, error } = await query.limit(5);
      if (error) throw error;
      return (data ?? []) as unknown as Score[];
    },

    async submit(
      level,
      playerName,
      seconds,
      sessionId,
      lastCompletionTime,
      maxLevel,
      levelProgress,
    ): Promise<void> {
      const name = playerName.trim().slice(0, 24) || "Anon";
      const optional = {
        ...(sessionId === undefined ? {} : { session_id: sessionId }),
        ...(lastCompletionTime === undefined ? {} : { last_completion_time: lastCompletionTime }),
        ...(maxLevel === undefined ? {} : { max_level: maxLevel }),
        ...(levelProgress === undefined ? {} : { level_progress: levelProgress }),
      };

      if (sessionId) {
        // Check if session already exists
        const { data: existing } = await fromScores()
          .select("id, level")
          .eq("session_id", sessionId)
          .single();

        if (existing) {
          // Update existing record. The stored level is the furthest one reached,
          // so replaying an earlier level never lowers it.
          const storedLevel = Number(existing.level) || 0;
          const reachedFurthest = level >= storedLevel;
          const { error } = await fromScores()
            .update({
              player_name: name,
              level: reachedFurthest ? level : storedLevel,
              seconds,
              max_level: Math.max(storedLevel, maxLevel ?? 0),
              ...(lastCompletionTime === undefined
                ? {}
                : { last_completion_time: lastCompletionTime }),
              ...(reachedFurthest && levelProgress !== undefined
                ? { level_progress: levelProgress }
                : {}),
            } as never)
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
        ...optional,
      } as never);
      if (error) throw error;
    },

    async rename(sessionId: string, playerName: string): Promise<void> {
      const name = playerName.trim().slice(0, 24) || "Anon";
      const { error } = await fromScores()
        .update({ player_name: name } as never)
        .eq("session_id", sessionId);
      if (error) throw error;
    },
  };
}

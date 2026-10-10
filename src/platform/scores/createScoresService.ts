import { supabase } from "@/integrations/supabase/client";

/** A level is a number (most games) or a text id (e.g. sudoku difficulties). */
export type ScoreLevel = number | string;

export type Score = {
  id: string;
  player_name: string;
  seconds: number;
  level: ScoreLevel;
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
  | "scores_taberdoku"
  | "scores_tabers_sudoku"
  | "scores_star_battle";

export type ScoresService = {
  /** Supabase table backing this service (one per game). */
  table: ScoreTable;
  fetchTop(level?: ScoreLevel): Promise<Score[]>;
  /**
   * Fetch the score for a specific session and level (if any).
   * Returns null if no score exists for that session+level.
   */
  fetchBySession(sessionId: string, level: ScoreLevel): Promise<Score | null>;
  submit(
    level: ScoreLevel,
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
  const fromScores = () => supabase.from(table as "scores_tabers_sudoku");

  return {
    table,
    async fetchTop(level?: ScoreLevel): Promise<Score[]> {
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

    async fetchBySession(sessionId: string, level: ScoreLevel): Promise<Score | null> {
      const { data, error } = await fromScores()
        .select(
          "id, player_name, seconds, level, created_at, max_level, level_progress, session_id",
        )
        .eq("session_id", sessionId)
        .eq("level", level)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Score | null;
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
        // Check if session+level already exists (one row per session+level)
        const { data: existing } = await fromScores()
          .select("id, level")
          .eq("session_id", sessionId)
          .eq("level", level)
          .maybeSingle();

        if (existing) {
          // Update the specific session+level row with the new time.
          // For text levels (sudoku difficulties) each level is independent.
          // For numeric levels, they are also independent per level.
          const { error } = await fromScores()
            .update({
              player_name: name,
              seconds,
              ...(lastCompletionTime === undefined
                ? {}
                : { last_completion_time: lastCompletionTime }),
              ...(levelProgress !== undefined ? { level_progress: levelProgress } : {}),
            } as never)
            .eq("session_id", sessionId)
            .eq("level", level);
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

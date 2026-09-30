import { supabase } from "@/integrations/supabase/client";

export type TaberdokuHistoryEntry = {
  id: string;
  session_id: string;
  player_name: string;
  board: number;
  level: number;
  time_seconds: number;
  score: number;
  completed_at: string;
};

export type TaberdokuHistoryService = {
  table: "taberdoku_history";
  fetchBySession(sessionId: string): Promise<TaberdokuHistoryEntry[]>;
  fetchByPlayer(playerName: string, limit?: number): Promise<TaberdokuHistoryEntry[]>;
  fetchByBoard(board: number, limit?: number): Promise<TaberdokuHistoryEntry[]>;
  submit(
    sessionId: string,
    playerName: string,
    board: number,
    level: number,
    timeSeconds: number,
    score: number,
  ): Promise<void>;
};

export function createTaberdokuHistoryService(): TaberdokuHistoryService {
  const fromHistory = () => supabase.from("taberdoku_history" as const);

  return {
    table: "taberdoku_history",
    async fetchBySession(sessionId: string): Promise<TaberdokuHistoryEntry[]> {
      const { data, error } = await fromHistory()
        .select("id, session_id, player_name, board, level, time_seconds, score, completed_at")
        .eq("session_id", sessionId)
        .order("completed_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },

    async fetchByPlayer(playerName: string, limit = 50): Promise<TaberdokuHistoryEntry[]> {
      const { data, error } = await fromHistory()
        .select("id, session_id, player_name, board, level, time_seconds, score, completed_at")
        .eq("player_name", playerName)
        .order("completed_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },

    async fetchByBoard(board: number, limit = 10): Promise<TaberdokuHistoryEntry[]> {
      const { data, error } = await fromHistory()
        .select("id, session_id, player_name, board, level, time_seconds, score, completed_at")
        .eq("board", board)
        .order("time_seconds", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },

    async submit(
      sessionId: string,
      playerName: string,
      board: number,
      level: number,
      timeSeconds: number,
      score: number,
    ): Promise<void> {
      const name = playerName.trim().slice(0, 24) || "Anon";

      const { error } = await fromHistory().insert({
        session_id: sessionId,
        player_name: name,
        board,
        level,
        time_seconds: timeSeconds,
        score,
      });
      if (error) throw error;
    },
  };
}

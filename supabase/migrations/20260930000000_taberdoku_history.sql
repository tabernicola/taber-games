-- Taberdoku game history table
-- Stores each board completion with timing and score details per session

CREATE TABLE public.taberdoku_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  player_name text NOT NULL,
  board integer NOT NULL,
  level integer NOT NULL,
  time_seconds integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX taberdoku_history_session_idx
  ON public.taberdoku_history (session_id);

CREATE INDEX taberdoku_history_player_idx
  ON public.taberdoku_history (player_name, completed_at DESC);

CREATE INDEX taberdoku_history_board_idx
  ON public.taberdoku_history (board, time_seconds);

GRANT SELECT, INSERT ON public.taberdoku_history TO anon;
GRANT SELECT, INSERT ON public.taberdoku_history TO authenticated;
GRANT ALL ON public.taberdoku_history TO service_role;

ALTER TABLE public.taberdoku_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read history" ON public.taberdoku_history FOR SELECT USING (true);
CREATE POLICY "Anyone can add history" ON public.taberdoku_history FOR INSERT
  WITH CHECK (
    length(player_name) BETWEEN 1 AND 24
    AND board > 0 AND board <= 100
    AND level > 0 AND level <= 20
    AND time_seconds >= 0
    AND score >= 0
  );
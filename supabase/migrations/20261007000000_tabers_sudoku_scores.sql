-- Taber's Sudoku ranking: one row per session, bucketed by
-- difficulty level and ordered by resolution time. The table
-- already exists in some environments, so every statement is
-- idempotent.

CREATE TABLE IF NOT EXISTS public.scores_tabers_sudoku (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  seconds integer NOT NULL DEFAULT 0,
  session_id text,
  last_completion_time integer,
  max_level integer,
  level_progress integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scores_tabers_sudoku_session_idx
  ON public.scores_tabers_sudoku (session_id);

CREATE INDEX IF NOT EXISTS scores_tabers_sudoku_level_idx
  ON public.scores_tabers_sudoku (level, seconds ASC);

GRANT SELECT, INSERT, UPDATE ON public.scores_tabers_sudoku TO anon;
GRANT SELECT, INSERT, UPDATE ON public.scores_tabers_sudoku TO authenticated;
GRANT ALL ON public.scores_tabers_sudoku TO service_role;

ALTER TABLE public.scores_tabers_sudoku ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_tabers_sudoku' AND policyname = 'Anyone can read scores'
  ) THEN
    CREATE POLICY "Anyone can read scores" ON public.scores_tabers_sudoku
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_tabers_sudoku' AND policyname = 'Anyone can add a score'
  ) THEN
    CREATE POLICY "Anyone can add a score" ON public.scores_tabers_sudoku
      FOR INSERT
      WITH CHECK (length(player_name) BETWEEN 1 AND 24 AND seconds >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_tabers_sudoku' AND policyname = 'Anyone can update a score'
  ) THEN
    CREATE POLICY "Anyone can update a score" ON public.scores_tabers_sudoku
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Sudoku difficulties are text levels.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scores_tabers_sudoku_level_domain'
  ) THEN
    ALTER TABLE public.scores_tabers_sudoku
      ADD CONSTRAINT scores_tabers_sudoku_level_domain
      CHECK (level IN ('easy', 'medium', 'hard', 'expert')) NOT VALID;
  END IF;
END $$;

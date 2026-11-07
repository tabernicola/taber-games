-- Murdoku ranking: one row per session, bucketed by case ID
-- and ordered by resolution time.

CREATE TABLE IF NOT EXISTS public.scores_murdoku (
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

CREATE INDEX IF NOT EXISTS scores_murdoku_session_idx
  ON public.scores_murdoku (session_id);

CREATE INDEX IF NOT EXISTS scores_murdoku_level_idx
  ON public.scores_murdoku (level, seconds ASC);

GRANT SELECT, INSERT, UPDATE ON public.scores_murdoku TO anon;
GRANT SELECT, INSERT, UPDATE ON public.scores_murdoku TO authenticated;
GRANT ALL ON public.scores_murdoku TO service_role;

ALTER TABLE public.scores_murdoku ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_murdoku' AND policyname = 'Anyone can read scores'
  ) THEN
    CREATE POLICY "Anyone can read scores" ON public.scores_murdoku
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_murdoku' AND policyname = 'Anyone can add a score'
  ) THEN
    CREATE POLICY "Anyone can add a score" ON public.scores_murdoku
      FOR INSERT
      WITH CHECK (length(player_name) BETWEEN 1 AND 24 AND seconds >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_murdoku' AND policyname = 'Anyone can update a score'
  ) THEN
    CREATE POLICY "Anyone can update a score" ON public.scores_murdoku
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;
-- Taberdoku ranking table: keeps one row per session with the level reached
-- and the percentage of boards solved inside that level.
-- The table already exists in some environments, so every statement is
-- idempotent.

CREATE TABLE IF NOT EXISTS public.scores_taberdoku (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL DEFAULT 0,
  player_name text NOT NULL,
  seconds integer NOT NULL DEFAULT 0,
  session_id text,
  last_completion_time integer,
  max_level integer,
  level_progress integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scores_taberdoku ADD COLUMN IF NOT EXISTS level integer;
ALTER TABLE public.scores_taberdoku ADD COLUMN IF NOT EXISTS session_id text;
ALTER TABLE public.scores_taberdoku ADD COLUMN IF NOT EXISTS last_completion_time integer;
ALTER TABLE public.scores_taberdoku ADD COLUMN IF NOT EXISTS max_level integer;
ALTER TABLE public.scores_taberdoku ADD COLUMN IF NOT EXISTS level_progress integer;

-- Rows written before the level fix always stored level 0; recover it from
-- max_level, which was already being saved.
UPDATE public.scores_taberdoku
SET level = max_level
WHERE (level IS NULL OR level = 0)
  AND max_level IS NOT NULL
  AND max_level > 0;

CREATE INDEX IF NOT EXISTS scores_taberdoku_session_idx
  ON public.scores_taberdoku (session_id);

CREATE INDEX IF NOT EXISTS scores_taberdoku_level_idx
  ON public.scores_taberdoku (level DESC, seconds ASC);

GRANT SELECT, INSERT, UPDATE ON public.scores_taberdoku TO anon;
GRANT SELECT, INSERT, UPDATE ON public.scores_taberdoku TO authenticated;
GRANT ALL ON public.scores_taberdoku TO service_role;

ALTER TABLE public.scores_taberdoku ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_taberdoku' AND policyname = 'Anyone can read scores'
  ) THEN
    CREATE POLICY "Anyone can read scores" ON public.scores_taberdoku
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_taberdoku' AND policyname = 'Anyone can add a score'
  ) THEN
    CREATE POLICY "Anyone can add a score" ON public.scores_taberdoku
      FOR INSERT
      WITH CHECK (length(player_name) BETWEEN 1 AND 24 AND seconds >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scores_taberdoku' AND policyname = 'Anyone can update a score'
  ) THEN
    CREATE POLICY "Anyone can update a score" ON public.scores_taberdoku
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Percentage of boards solved in the level, 0-100.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scores_taberdoku_level_progress_domain'
  ) THEN
    ALTER TABLE public.scores_taberdoku
      ADD CONSTRAINT scores_taberdoku_level_progress_domain
      CHECK (level_progress IS NULL OR (level_progress >= 0 AND level_progress <= 100)) NOT VALID;
  END IF;
END $$;

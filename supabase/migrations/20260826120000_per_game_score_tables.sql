-- One score table per game. Each game slice owns its table; the legacy
-- public.scores table is kept untouched as a backup.

CREATE TABLE public.scores_taber_square (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scores_tabers_star (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scores_eternity_ii (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate existing rows (the old INSERT policy never allowed 'taber-star',
-- so that table is expected to be empty here).
INSERT INTO public.scores_taber_square (id, level, player_name, seconds, created_at)
SELECT id, level, player_name, seconds, created_at
FROM public.scores
WHERE game = 'taber-square';

INSERT INTO public.scores_tabers_star (id, level, player_name, seconds, created_at)
SELECT id, level, player_name, seconds, created_at
FROM public.scores
WHERE game = 'taber-star';

INSERT INTO public.scores_eternity_ii (id, level, player_name, seconds, created_at)
SELECT id, level, player_name, seconds, created_at
FROM public.scores
WHERE game = 'eternity-ii';

CREATE INDEX scores_taber_square_level_idx
  ON public.scores_taber_square (level, seconds);
CREATE INDEX scores_tabers_star_level_idx
  ON public.scores_tabers_star (level, seconds);
CREATE INDEX scores_eternity_ii_level_idx
  ON public.scores_eternity_ii (level, seconds);

GRANT SELECT, INSERT ON public.scores_taber_square TO anon;
GRANT SELECT, INSERT ON public.scores_taber_square TO authenticated;
GRANT ALL ON public.scores_taber_square TO service_role;

GRANT SELECT, INSERT ON public.scores_tabers_star TO anon;
GRANT SELECT, INSERT ON public.scores_tabers_star TO authenticated;
GRANT ALL ON public.scores_tabers_star TO service_role;

GRANT SELECT, INSERT ON public.scores_eternity_ii TO anon;
GRANT SELECT, INSERT ON public.scores_eternity_ii TO authenticated;
GRANT ALL ON public.scores_eternity_ii TO service_role;

ALTER TABLE public.scores_taber_square ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores_tabers_star ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores_eternity_ii ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scores" ON public.scores_taber_square FOR SELECT USING (true);
CREATE POLICY "Anyone can add a score" ON public.scores_taber_square FOR INSERT
  WITH CHECK (
    length(player_name) BETWEEN 1 AND 24
    AND seconds > 0 AND seconds < 1000000
  );

CREATE POLICY "Anyone can read scores" ON public.scores_tabers_star FOR SELECT USING (true);
CREATE POLICY "Anyone can add a score" ON public.scores_tabers_star FOR INSERT
  WITH CHECK (
    length(player_name) BETWEEN 1 AND 24
    AND seconds > 0 AND seconds < 1000000
  );

CREATE POLICY "Anyone can read scores" ON public.scores_eternity_ii FOR SELECT USING (true);
CREATE POLICY "Anyone can add a score" ON public.scores_eternity_ii FOR INSERT
  WITH CHECK (
    length(player_name) BETWEEN 1 AND 24
    AND seconds > 0 AND seconds < 1000000
  );

-- Valid domains for new writes per game. NOT VALID keeps any historical row
-- that does not match; every future INSERT is checked.
ALTER TABLE public.scores_taber_square
  ADD CONSTRAINT scores_taber_square_level_domain
  CHECK (level IN ('1', '2', '3', '4', '5')) NOT VALID;

ALTER TABLE public.scores_tabers_star
  ADD CONSTRAINT scores_tabers_star_level_domain
  CHECK (level = '1') NOT VALID;

ALTER TABLE public.scores_eternity_ii
  ADD CONSTRAINT scores_eternity_ii_level_domain
  CHECK (level IN ('4', '6', '8', '12', '16')) NOT VALID;

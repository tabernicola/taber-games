CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game text NOT NULL,
  level text NOT NULL DEFAULT '',
  player_name text NOT NULL,
  seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX scores_board_idx ON public.scores (game, level, seconds);

GRANT SELECT, INSERT ON public.scores TO anon;
GRANT SELECT, INSERT ON public.scores TO authenticated;
GRANT ALL ON public.scores TO service_role;

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Anyone can add a score" ON public.scores FOR INSERT
  WITH CHECK (
    length(player_name) BETWEEN 1 AND 24
    AND seconds > 0 AND seconds < 1000000
    AND game IN ('taber-square', 'eternity-ii')
    AND length(level) <= 8
  );

CREATE TABLE public.eternity_saves (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level integer NOT NULL,
  state jsonb NOT NULL,
  seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.eternity_saves TO authenticated;
GRANT ALL ON public.eternity_saves TO service_role;

ALTER TABLE public.eternity_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own save" ON public.eternity_saves FOR ALL
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_eternity_saves_updated_at BEFORE UPDATE ON public.eternity_saves
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
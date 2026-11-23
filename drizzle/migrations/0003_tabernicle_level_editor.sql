CREATE TABLE public.tabernicle_levels (
 level_id integer PRIMARY KEY,
 definition jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT tabernicle_level_id_positive CHECK (level_id > 0),
 CONSTRAINT tabernicle_definition_object CHECK (jsonb_typeof(definition) = 'object')
);
GRANT SELECT ON public.tabernicle_levels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tabernicle_levels TO authenticated;
GRANT ALL ON public.tabernicle_levels TO service_role;
ALTER TABLE public.tabernicle_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read Tabernicle levels" ON public.tabernicle_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage Tabernicle levels" ON public.tabernicle_levels FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
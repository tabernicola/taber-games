CREATE TABLE public.murdoku_elements (id text PRIMARY KEY, name text NOT NULL DEFAULT '', name_i18n jsonb NOT NULL DEFAULT '{}', icon text NOT NULL DEFAULT '', image text, walkable boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.murdoku_elements TO anon, authenticated;
GRANT ALL ON public.murdoku_elements TO service_role;
ALTER TABLE public.murdoku_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read reusable elements" ON public.murdoku_elements FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.murdoku_boards (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name text NOT NULL, name_i18n jsonb NOT NULL DEFAULT '{}', grid_rows integer NOT NULL DEFAULT 9 CHECK (grid_rows > 0), grid_cols integer NOT NULL DEFAULT 9 CHECK (grid_cols > 0), rooms jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.murdoku_boards TO anon, authenticated;
GRANT ALL ON public.murdoku_boards TO service_role;
ALTER TABLE public.murdoku_boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read reusable boards" ON public.murdoku_boards FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.murdoku_board_elements (board_id uuid NOT NULL REFERENCES public.murdoku_boards(id), element_id text NOT NULL REFERENCES public.murdoku_elements(id), room_id text NOT NULL, row_index integer NOT NULL CHECK (row_index >= 0), col_index integer NOT NULL CHECK (col_index >= 0), sort_order integer NOT NULL DEFAULT 0, instance_id text, PRIMARY KEY (board_id, row_index, col_index));
GRANT SELECT ON public.murdoku_board_elements TO anon, authenticated;
GRANT ALL ON public.murdoku_board_elements TO service_role;
ALTER TABLE public.murdoku_board_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read board element placements" ON public.murdoku_board_elements FOR SELECT TO anon, authenticated USING (true);
ALTER TABLE public.murdoku_cases ADD COLUMN board_id uuid REFERENCES public.murdoku_boards(id);
ALTER TABLE public.murdoku_cases ADD COLUMN title_i18n jsonb NOT NULL DEFAULT '{}';
CREATE INDEX murdoku_cases_board_idx ON public.murdoku_cases(board_id);
GRANT SELECT ON public.murdoku_cases TO anon;
GRANT SELECT, INSERT ON public.murdoku_cases TO authenticated;
GRANT ALL ON public.murdoku_cases TO service_role;
ALTER TABLE public.murdoku_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read approved or own cases" ON public.murdoku_cases FOR SELECT TO anon, authenticated USING (status = 'approved' OR creator_id = auth.uid());
CREATE POLICY "Submit own cases for review" ON public.murdoku_cases FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid() AND status IN ('draft', 'pending_review') AND rejection_note IS NULL);
CREATE TABLE public.murdoku_case_characters (case_id uuid NOT NULL REFERENCES public.murdoku_cases(id), character_id text NOT NULL REFERENCES public.murdoku_characters(id), sort_order integer NOT NULL DEFAULT 0, PRIMARY KEY (case_id, character_id));
GRANT SELECT ON public.murdoku_case_characters TO anon, authenticated;
GRANT ALL ON public.murdoku_case_characters TO service_role;
ALTER TABLE public.murdoku_case_characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read visible case characters" ON public.murdoku_case_characters FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.murdoku_cases c WHERE c.id = case_id));
CREATE VIEW public.murdoku_playable_cases WITH (security_invoker = true) AS
SELECT c.id, c.title, c.title_i18n, c.creator_id, c.status, c.rejection_note, c.created_at, c.updated_at, c.board_id,
CASE WHEN b.id IS NULL THEN c.content ELSE c.content || jsonb_build_object(
'gridRows', b.grid_rows, 'gridCols', b.grid_cols,
'rooms', (SELECT COALESCE(jsonb_agg(r.room || jsonb_build_object('elements', el.items) ORDER BY r.ordinality), '[]'::jsonb)
 FROM jsonb_array_elements(b.rooms) WITH ORDINALITY r(room, ordinality)
 CROSS JOIN LATERAL (SELECT COALESCE(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', be.instance_id, 'name', e.name, 'nameI18n', e.name_i18n, 'icon', e.icon, 'image', e.image, 'walkable', e.walkable, 'position', jsonb_build_object('row', be.row_index, 'col', be.col_index))) ORDER BY be.sort_order), '[]'::jsonb) AS items
 FROM public.murdoku_board_elements be JOIN public.murdoku_elements e ON e.id = be.element_id WHERE be.board_id = b.id AND be.room_id = r.room->>'id') el),
'characters', (SELECT COALESCE(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', ch.id, 'name', ch.name, 'image', ch.image, 'description', ch.description)) ORDER BY cc.sort_order), '[]'::jsonb) FROM public.murdoku_case_characters cc JOIN public.murdoku_characters ch ON ch.id = cc.character_id WHERE cc.case_id = c.id)
) END AS content
FROM public.murdoku_cases c LEFT JOIN public.murdoku_boards b ON b.id = c.board_id;
GRANT SELECT ON public.murdoku_playable_cases TO anon, authenticated, service_role;
COMMENT ON COLUMN public.murdoku_cases.content IS 'Case-specific clues, solution and optional future rules. Legacy cases without board_id retain their complete embedded board.';
COMMENT ON TABLE public.murdoku_board_elements IS 'Reusable element instances: room, cell and ordering belong to the board, not the catalog element.';
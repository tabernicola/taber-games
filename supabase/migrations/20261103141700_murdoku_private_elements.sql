ALTER TABLE public.murdoku_elements
  ADD COLUMN IF NOT EXISTS private boolean NOT NULL DEFAULT true;

INSERT INTO public.murdoku_elements (id, name, name_i18n, icon, walkable, private)
VALUES
  ('murdoku-house', 'House', '{"es":"Casa","eu":"Etxea","en":"House"}', '🏠', false, true),
  ('murdoku-castle', 'Castle', '{"es":"Castillo","eu":"Gaztelua","en":"Castle"}', '🏰', false, true),
  ('murdoku-tree', 'Tree', '{"es":"Árbol","eu":"Zuhaitza","en":"Tree"}', '🌳', false, true),
  ('murdoku-water', 'Water', '{"es":"Agua","eu":"Ura","en":"Water"}', '🌊', false, true),
  ('murdoku-rock', 'Rock', '{"es":"Roca","eu":"Haitza","en":"Rock"}', '🪨', false, true),
  ('murdoku-fire', 'Fire', '{"es":"Fuego","eu":"Sua","en":"Fire"}', '🔥', false, true),
  ('murdoku-fountain', 'Fountain', '{"es":"Fuente","eu":"Iturria","en":"Fountain"}', '⛲', false, true),
  ('murdoku-bridge', 'Bridge', '{"es":"Puente","eu":"Zubia","en":"Bridge"}', '🌉', true, true)
ON CONFLICT (id) DO NOTHING;

UPDATE public.murdoku_elements
SET private = false
WHERE id LIKE 'murdoku%';

ALTER TABLE public.murdoku_cases
  ADD COLUMN IF NOT EXISTS difficulty integer NOT NULL DEFAULT 3;

DROP VIEW IF EXISTS public.murdoku_playable_cases;
DROP FUNCTION IF EXISTS public.create_murdoku_board(
  text, text, integer, integer, jsonb, jsonb, jsonb
);
DROP TABLE IF EXISTS public.murdoku_board_custom_elements;

CREATE OR REPLACE FUNCTION public.create_murdoku_board(
  p_name text,
  p_slug text,
  p_grid_rows integer,
  p_grid_cols integer,
  p_rooms jsonb,
  p_elements jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_board_id uuid;
BEGIN
  INSERT INTO public.murdoku_boards (slug, name, name_i18n, grid_rows, grid_cols, rooms)
  VALUES (p_slug, p_name, jsonb_build_object('es', p_name, 'en', p_name, 'eu', p_name),
          p_grid_rows, p_grid_cols, p_rooms)
  RETURNING id INTO new_board_id;

  INSERT INTO public.murdoku_board_elements
    (board_id, element_id, room_id, row_index, col_index, sort_order, instance_id)
  SELECT new_board_id, element_id, room_id, row_index, col_index, sort_order, instance_id
  FROM jsonb_to_recordset(p_elements) AS item(
    element_id text, room_id text, row_index integer, col_index integer,
    sort_order integer, instance_id text
  );

  RETURN new_board_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_murdoku_board(text, text, integer, integer, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_murdoku_board(text, text, integer, integer, jsonb, jsonb)
  TO service_role;

CREATE VIEW public.murdoku_playable_cases
WITH (security_invoker = true) AS
SELECT
  c.id,
  c.title,
  c.title_i18n,
  c.creator_id,
  c.status,
  c.rejection_note,
  c.created_at,
  c.updated_at,
  c.board_id,
  c.image,
  c.difficulty,
  CASE
    WHEN b.id IS NULL THEN c.content
    ELSE c.content || jsonb_build_object(
      'gridRows', b.grid_rows,
      'gridCols', b.grid_cols,
      'rooms', (
        SELECT COALESCE(
          jsonb_agg(r.room || jsonb_build_object('elements', el.items) ORDER BY r.ordinality),
          '[]'::jsonb
        )
        FROM jsonb_array_elements(b.rooms) WITH ORDINALITY r(room, ordinality)
        CROSS JOIN LATERAL (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_strip_nulls(jsonb_build_object(
                'id', be.instance_id,
                'name', e.name,
                'nameI18n', e.name_i18n,
                'icon', e.icon,
                'image', e.image,
                'walkable', e.walkable,
                'position', jsonb_build_object('row', be.row_index, 'col', be.col_index)
              ))
              ORDER BY be.sort_order
            ),
            '[]'::jsonb
          ) AS items
          FROM public.murdoku_board_elements be
          JOIN public.murdoku_elements e ON e.id = be.element_id
          WHERE be.board_id = b.id AND be.room_id = r.room->>'id'
        ) el
      ),
      'characters', COALESCE(
        c.content->'characters',
        (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_strip_nulls(jsonb_build_object(
                'id', ch.id,
                'name', ch.name,
                'image', ch.image,
                'description', ch.description
              ))
              ORDER BY cc.sort_order
            ),
            '[]'::jsonb
          )
          FROM public.murdoku_case_characters cc
          JOIN public.murdoku_characters ch ON ch.id = cc.character_id
          WHERE cc.case_id = c.id
        )
      )
    )
  END AS content
FROM public.murdoku_cases c
LEFT JOIN public.murdoku_boards b ON b.id = c.board_id;

GRANT SELECT ON public.murdoku_playable_cases TO anon, authenticated, service_role;

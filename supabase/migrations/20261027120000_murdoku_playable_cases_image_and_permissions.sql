-- Recreate murdoku_playable_cases view with image column, board and character reconstruction, and full permissions.

-- 1. Ensure image column exists on base murdoku_cases table
ALTER TABLE public.murdoku_cases
ADD COLUMN IF NOT EXISTS image text;

-- 2. Drop existing view to avoid any column type/order conflicts
DROP VIEW IF EXISTS public.murdoku_playable_cases CASCADE;

-- 3. Recreate view with security_invoker = true
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
  CASE
    WHEN b.id IS NULL THEN c.content
    ELSE c.content || jsonb_build_object(
      'gridRows', b.grid_rows,
      'gridCols', b.grid_cols,
      'rooms', (
        SELECT COALESCE(
          jsonb_agg(
            r.room || jsonb_build_object('elements', el.items)
            ORDER BY r.ordinality
          ),
          '[]'::jsonb
        )
        FROM jsonb_array_elements(b.rooms) WITH ORDINALITY r(room, ordinality)
        CROSS JOIN LATERAL (
          SELECT COALESCE(
            jsonb_agg(
              jsonb_strip_nulls(
                jsonb_build_object(
                  'id', be.instance_id,
                  'name', e.name,
                  'nameI18n', e.name_i18n,
                  'icon', e.icon,
                  'image', e.image,
                  'walkable', e.walkable,
                  'position', jsonb_build_object('row', be.row_index, 'col', be.col_index)
                )
              )
              ORDER BY be.sort_order
            ),
            '[]'::jsonb
          ) AS items
          FROM public.murdoku_board_elements be
          JOIN public.murdoku_elements e ON e.id = be.element_id
          WHERE be.board_id = b.id AND be.room_id = r.room->>'id'
        ) el
      ),
      'characters', (
        SELECT COALESCE(
          jsonb_agg(
            jsonb_strip_nulls(
              jsonb_build_object(
                'id', ch.id,
                'name', ch.name,
                'image', ch.image,
                'description', ch.description
              )
            )
            ORDER BY cc.sort_order
          ),
          '[]'::jsonb
        )
        FROM public.murdoku_case_characters cc
        JOIN public.murdoku_characters ch ON ch.id = cc.character_id
        WHERE cc.case_id = c.id
      )
    )
  END AS content
FROM public.murdoku_cases c
LEFT JOIN public.murdoku_boards b ON b.id = c.board_id;

-- 4. Restore SELECT permissions on view
GRANT SELECT ON public.murdoku_playable_cases TO anon, authenticated, service_role;

-- 5. Ensure underlying table SELECT permissions for security_invoker = true
GRANT SELECT ON public.murdoku_cases TO anon, authenticated, service_role;
GRANT SELECT ON public.murdoku_boards TO anon, authenticated, service_role;
GRANT SELECT ON public.murdoku_elements TO anon, authenticated, service_role;
GRANT SELECT ON public.murdoku_board_elements TO anon, authenticated, service_role;
GRANT SELECT ON public.murdoku_characters TO anon, authenticated, service_role;
GRANT SELECT ON public.murdoku_case_characters TO anon, authenticated, service_role;


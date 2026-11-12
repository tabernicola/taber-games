CREATE OR REPLACE FUNCTION public.assert_murdoku_board_payload(
  p_grid_rows integer,
  p_grid_cols integer,
  p_rooms jsonb,
  p_elements jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cell_count integer;
  unique_cell_count integer;
  element_count integer;
  unique_element_cell_count integer;
BEGIN
  IF p_grid_rows IS NULL OR p_grid_cols IS NULL
    OR p_grid_rows NOT BETWEEN 6 AND 9 OR p_grid_cols NOT BETWEEN 6 AND 9 THEN
    RAISE EXCEPTION 'Board dimensions must be between 6 and 9';
  END IF;
  IF jsonb_typeof(p_rooms) IS DISTINCT FROM 'array'
    OR jsonb_typeof(p_elements) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Board rooms and elements must be arrays';
  END IF;
  IF jsonb_array_length(p_rooms) = 0 THEN
    RAISE EXCEPTION 'A board must contain at least one room';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_rooms) AS room(value)
    WHERE nullif(btrim(room.value->>'id'), '') IS NULL
      OR nullif(btrim(room.value->>'name'), '') IS NULL
      OR CASE
        WHEN jsonb_typeof(room.value->'cells') = 'array'
          THEN jsonb_array_length(room.value->'cells') = 0
        ELSE true
      END
  ) THEN
    RAISE EXCEPTION 'Every board room must have an ID, a name and at least one cell';
  END IF;

  IF (
    SELECT count(*) <> count(DISTINCT room.value->>'id')
    FROM jsonb_array_elements(p_rooms) AS room(value)
  ) THEN
    RAISE EXCEPTION 'Room IDs must be unique';
  END IF;

  SELECT count(*), count(DISTINCT (cell.row, cell.col))
  INTO cell_count, unique_cell_count
  FROM jsonb_array_elements(p_rooms) AS room(value)
  CROSS JOIN LATERAL jsonb_to_recordset(room.value->'cells')
    AS cell(row integer, col integer);

  IF cell_count <> p_grid_rows * p_grid_cols OR unique_cell_count <> cell_count OR EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_rooms) AS room(value)
    CROSS JOIN LATERAL jsonb_to_recordset(room.value->'cells')
      AS cell(row integer, col integer)
    WHERE cell.row IS NULL OR cell.col IS NULL
      OR cell.row < 0 OR cell.row >= p_grid_rows
      OR cell.col < 0 OR cell.col >= p_grid_cols
  ) THEN
    RAISE EXCEPTION 'Every board cell must belong to exactly one room';
  END IF;

  SELECT count(*), count(DISTINCT (element.row_index, element.col_index))
  INTO element_count, unique_element_cell_count
  FROM jsonb_to_recordset(p_elements) AS element(
    element_id text, room_id text, row_index integer, col_index integer,
    sort_order integer, instance_id text
  );

  IF element_count <> unique_element_cell_count OR EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_elements) AS element(
      element_id text, room_id text, row_index integer, col_index integer,
      sort_order integer, instance_id text
    )
    WHERE nullif(element.element_id, '') IS NULL
      OR nullif(element.room_id, '') IS NULL
      OR element.row_index IS NULL OR element.col_index IS NULL
      OR element.row_index < 0 OR element.row_index >= p_grid_rows
      OR element.col_index < 0 OR element.col_index >= p_grid_cols
      OR element.sort_order IS NULL OR element.sort_order < 0
      OR nullif(element.instance_id, '') IS NULL
      OR NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_rooms) AS room(value)
        CROSS JOIN LATERAL jsonb_to_recordset(room.value->'cells')
          AS cell(row integer, col integer)
        WHERE room.value->>'id' = element.room_id
          AND cell.row = element.row_index
          AND cell.col = element.col_index
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public.murdoku_elements catalog_element
        WHERE catalog_element.id = element.element_id
      )
  ) THEN
    RAISE EXCEPTION 'Board elements must reference existing elements and valid room cells';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_murdoku_board_payload(integer, integer, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated, service_role;

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
SET search_path = public, pg_temp
AS $$
DECLARE
  new_board_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_name IS NULL OR p_slug IS NULL
    OR nullif(btrim(p_name), '') IS NULL OR nullif(btrim(p_slug), '') IS NULL THEN
    RAISE EXCEPTION 'Board name and slug are required';
  END IF;

  PERFORM public.assert_murdoku_board_payload(
    p_grid_rows, p_grid_cols, p_rooms, p_elements
  );

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_elements) AS element(element_id text)
    JOIN public.murdoku_elements catalog_element ON catalog_element.id = element.element_id
    WHERE catalog_element.private
  ) THEN
    RAISE EXCEPTION 'Private Murdoku elements cannot be used when creating boards';
  END IF;

  INSERT INTO public.murdoku_boards (slug, name, name_i18n, grid_rows, grid_cols, rooms)
  VALUES (
    p_slug,
    btrim(p_name),
    jsonb_build_object('es', btrim(p_name), 'en', btrim(p_name), 'eu', btrim(p_name)),
    p_grid_rows,
    p_grid_cols,
    p_rooms
  )
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

CREATE OR REPLACE FUNCTION public.update_murdoku_board(
  p_board_id uuid,
  p_name text,
  p_grid_rows integer,
  p_grid_cols integer,
  p_rooms jsonb,
  p_elements jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;
  IF p_name IS NULL OR nullif(btrim(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'Board name is required';
  END IF;

  PERFORM 1
  FROM public.murdoku_boards
  WHERE id = p_board_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Murdoku board not found';
  END IF;

  PERFORM public.assert_murdoku_board_payload(
    p_grid_rows, p_grid_cols, p_rooms, p_elements
  );

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_elements) AS item(
      element_id text, row_index integer, col_index integer
    )
    JOIN public.murdoku_elements catalog_element ON catalog_element.id = item.element_id
    WHERE catalog_element.private
      AND NOT EXISTS (
        SELECT 1
        FROM public.murdoku_board_elements existing
        WHERE existing.board_id = p_board_id
          AND existing.element_id = item.element_id
          AND existing.row_index = item.row_index
          AND existing.col_index = item.col_index
      )
  ) THEN
    RAISE EXCEPTION 'Private Murdoku elements cannot be added or moved while editing boards';
  END IF;

  UPDATE public.murdoku_boards
  SET name = btrim(p_name),
      name_i18n = jsonb_build_object('es', btrim(p_name), 'en', btrim(p_name), 'eu', btrim(p_name)),
      grid_rows = p_grid_rows,
      grid_cols = p_grid_cols,
      rooms = p_rooms
  WHERE id = p_board_id;

  DELETE FROM public.murdoku_board_elements
  WHERE board_id = p_board_id;

  INSERT INTO public.murdoku_board_elements
    (board_id, element_id, room_id, row_index, col_index, sort_order, instance_id)
  SELECT p_board_id, element_id, room_id, row_index, col_index, sort_order, instance_id
  FROM jsonb_to_recordset(p_elements) AS item(
    element_id text, room_id text, row_index integer, col_index integer,
    sort_order integer, instance_id text
  );

  RETURN p_board_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_murdoku_board(text, text, integer, integer, jsonb, jsonb)
  FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_murdoku_board(text, text, integer, integer, jsonb, jsonb)
  TO authenticated;

REVOKE ALL ON FUNCTION public.update_murdoku_board(uuid, text, integer, integer, jsonb, jsonb)
  FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.update_murdoku_board(uuid, text, integer, integer, jsonb, jsonb)
  TO authenticated;

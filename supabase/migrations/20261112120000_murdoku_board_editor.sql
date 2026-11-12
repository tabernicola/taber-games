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
SET search_path = public
AS $$
BEGIN
  UPDATE public.murdoku_boards
  SET name = p_name,
      name_i18n = jsonb_build_object('es', p_name, 'en', p_name, 'eu', p_name),
      grid_rows = p_grid_rows,
      grid_cols = p_grid_cols,
      rooms = p_rooms
  WHERE id = p_board_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Murdoku board not found';
  END IF;

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

REVOKE ALL ON FUNCTION public.update_murdoku_board(uuid, text, integer, integer, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_murdoku_board(uuid, text, integer, integer, jsonb, jsonb)
  TO service_role;

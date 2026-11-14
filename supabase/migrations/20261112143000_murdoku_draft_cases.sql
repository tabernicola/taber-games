DROP TABLE IF EXISTS pg_temp.murdoku_draft_case_seeds;

CREATE TEMP TABLE murdoku_draft_case_seeds (
  id uuid PRIMARY KEY,
  board_id uuid NOT NULL,
  title text NOT NULL,
  title_i18n jsonb NOT NULL,
  difficulty integer NOT NULL,
  killer_id text NOT NULL,
  victim_id text NOT NULL,
  story_i18n jsonb NOT NULL,
  placements jsonb NOT NULL
);

INSERT INTO murdoku_draft_case_seeds
  (id, board_id, title, title_i18n, difficulty, killer_id, victim_id, story_i18n, placements)
VALUES
  (
    '02402400-0000-4000-8000-000000000101',
    '02402400-0000-4000-8000-000000000006',
    'El secreto de la plaza',
    '{"es":"El secreto de la plaza","eu":"Plazako sekretua","en":"The Square''s Secret"}',
    2, 'dna-noelia', 'cameraman',
    '{"es":"Durante la celebración en la Plaza Central, El padre del rapero apareció sin vida. Una nota encontrada allí apunta a Doña Noelia, pero todos los asistentes ocultan algo.","eu":"Erdiko Plazako ospakizunean, El padre del rapero hilik aurkitu zuten. Bertan aurkitutako ohar batek Doña Noelia seinalatzen du, baina bertaratutako guztiek zerbait ezkutatzen dute.","en":"During a celebration in Central Square, El padre del rapero was found dead. A note discovered there points to Doña Noelia, but every attendee is hiding something."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":2},{"characterId":"lord-shadow","row":3,"col":3},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":5}]'
  ),
  (
    '02402400-0000-4000-8000-000000000102',
    '02402400-0000-4000-8000-000000000006',
    'La última cuenta del mercado',
    '{"es":"La última cuenta del mercado","eu":"Azokako azken kontua","en":"The Market''s Last Account"}',
    3, 'cameraman', 'icequeen',
    '{"es":"Al cerrar el Mercado Viejo, Ice Queen fue hallada sin vida entre los puestos. Las últimas imágenes de la zona sitúan a El padre del rapero cerca de ella.","eu":"Azoka Zaharra ixtean, Ice Queen hilik aurkitu zuten postuen artean. Inguruko azken irudiek El padre del rapero haren ondoan kokatzen dute.","en":"At closing time in the Old Market, Ice Queen was found dead among the stalls. The last images from the area place El padre del rapero near her."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":3},{"characterId":"icequeen","row":2,"col":2},{"characterId":"lord-shadow","row":3,"col":1},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":5}]'
  ),
  (
    '02402400-0000-4000-8000-000000000103',
    '02402400-0000-4000-8000-000000000006',
    'Sombras en el parque',
    '{"es":"Sombras en el parque","eu":"Itzalak parkean","en":"Shadows in the Park"}',
    3, 'luigi', 'icequeen',
    '{"es":"Una reunión nocturna en el Parque Verde terminó en tragedia: Ice Queen fue encontrada sin vida junto al sendero. Luigi fue visto en el parque poco antes del incidente.","eu":"Parke Berdeko gaueko bilera tragediaz amaitu zen: Ice Queen hilik aurkitu zuten bidearen ondoan. Luigi parkean ikusi zuten gertakaria baino lehenago.","en":"A nighttime gathering in Green Park ended in tragedy: Ice Queen was found dead beside the path. Luigi was seen in the park shortly before the incident."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":3},{"characterId":"lord-shadow","row":3,"col":4},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":5}]'
  ),
  (
    '02402400-0000-4000-8000-000000000104',
    '02402400-0000-4000-8000-000000000006',
    'Silencio en el muelle',
    '{"es":"Silencio en el muelle","eu":"Isiltasuna kaian","en":"Silence at the Pier"}',
    3, 'lord-shadow', 'icequeen',
    '{"es":"El Muelle Viejo quedó en silencio cuando Ice Queen fue encontrada sin vida al terminar la última ronda. Las declaraciones sitúan a Lord shadow en el muelle durante ese momento.","eu":"Kaia Zaharra isildu egin zen azken txanda amaitzean Ice Queen hilik aurkitu zutenean. Adierazpenek Lord shadow kaian kokatzen dute une hartan.","en":"The Old Pier fell silent when Ice Queen was found dead after the last round. Witness statements place Lord shadow at the pier at that time."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":5},{"characterId":"lord-shadow","row":3,"col":4},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":3}]'
  ),
  (
    '02402400-0000-4000-8000-000000000105',
    '02402400-0000-4000-8000-000000000006',
    'El último silbato',
    '{"es":"El último silbato","eu":"Azken txistua","en":"The Last Whistle"}',
    2, 'luigi', 'stylist',
    '{"es":"El último tren no llegó a salir de la Estación de Tren. Moon scissors fue encontrada sin vida en el andén y Luigi, que conocía bien los horarios, estaba allí esa noche.","eu":"Azken trena ez zen Tren Geltokitik atera. Moon scissors hilik aurkitu zuten nasan, eta ordutegiak ondo ezagutzen zituen Luigi bertan zegoen gau hartan.","en":"The last train never left the Train Station. Moon scissors was found dead on the platform, and Luigi, who knew the timetables well, was there that night."}',
    '[{"characterId":"dna-noelia","row":0,"col":2},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":5},{"characterId":"lord-shadow","row":3,"col":4},{"characterId":"luigi","row":4,"col":0},{"characterId":"stylist","row":5,"col":3}]'
  ),
  (
    '02402400-0000-4000-8000-000000000106',
    '02402400-0000-4000-8000-000000000007',
    'Niebla en el puerto',
    '{"es":"Niebla en el puerto","eu":"Lainoa portuan","en":"Fog at the Harbor"}',
    2, 'dna-noelia', 'cameraman',
    '{"es":"La niebla cubría el Puerto Pesquero cuando El padre del rapero fue encontrado sin vida. Doña Noelia había sido vista en el puerto poco antes de que se perdiera la luz del faro.","eu":"Lainoak Arrantza Portua estaltzen zuen El padre del rapero hilik aurkitu zutenean. Doña Noelia portuan ikusi zuten itsasargiko argia itzali baino lehen.","en":"Fog covered the Fishing Harbor when El padre del rapero was found dead. Doña Noelia had been seen at the harbor shortly before the lighthouse went dark."}',
    '[{"characterId":"dna-noelia","row":0,"col":1},{"characterId":"cameraman","row":1,"col":0},{"characterId":"icequeen","row":2,"col":3},{"characterId":"lord-shadow","row":3,"col":2},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":5},{"characterId":"postman","row":6,"col":6}]'
  ),
  (
    '02402400-0000-4000-8000-000000000107',
    '02402400-0000-4000-8000-000000000007',
    'La última luz del faro',
    '{"es":"La última luz del faro","eu":"Itsasargiko azken argia","en":"The Lighthouse''s Last Light"}',
    3, 'cameraman', 'dna-noelia',
    '{"es":"Una tormenta apagó el faro y, al amanecer, Doña Noelia apareció sin vida. El padre del rapero había subido a la zona del faro para grabar la tormenta.","eu":"Ekaitzak itsasargia itzali zuen eta, egunsentian, Doña Noelia hilik agertu zen. El padre del rapero itsasargiaren ingurura igo zen ekaitza grabatzera.","en":"A storm extinguished the lighthouse, and at dawn Doña Noelia was found dead. El padre del rapero had gone up to the lighthouse area to film the storm."}',
    '[{"characterId":"dna-noelia","row":0,"col":4},{"characterId":"cameraman","row":1,"col":3},{"characterId":"icequeen","row":2,"col":0},{"characterId":"lord-shadow","row":3,"col":1},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":5},{"characterId":"postman","row":6,"col":6}]'
  ),
  (
    '02402400-0000-4000-8000-000000000108',
    '02402400-0000-4000-8000-000000000007',
    'Huellas en el bosque',
    '{"es":"Huellas en el bosque","eu":"Oinatzak basoan","en":"Footprints in the Forest"}',
    3, 'lord-shadow', 'icequeen',
    '{"es":"Al amanecer, Ice Queen fue hallada sin vida en el Bosque Sombrío. Las huellas sobre la tierra húmeda indicaban que Lord shadow había pasado por allí durante la noche.","eu":"Egunsentian, Ice Queen hilik aurkitu zuten Baso Ilunean. Lur bustiko oinatzek Lord shadow gauean handik igaro zela adierazten zuten.","en":"At dawn, Ice Queen was found dead in the Shadow Forest. Footprints in the wet earth showed that Lord shadow had passed through during the night."}',
    '[{"characterId":"dna-noelia","row":0,"col":1},{"characterId":"cameraman","row":1,"col":3},{"characterId":"icequeen","row":2,"col":4},{"characterId":"lord-shadow","row":3,"col":0},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":5},{"characterId":"postman","row":6,"col":6}]'
  ),
  (
    '02402400-0000-4000-8000-000000000109',
    '02402400-0000-4000-8000-000000000007',
    'Noche en el campamento',
    '{"es":"Noche en el campamento","eu":"Gaua kanpamentuan","en":"Night at the Camp"}',
    3, 'icequeen', 'lord-shadow',
    '{"es":"El Campamento Costero quedó vacío tras un apagón. Lord shadow fue encontrado sin vida al amanecer y varias personas aseguraron haber visto allí a Ice Queen.","eu":"Kostaldeko Kanpamentua hutsik geratu zen argindarra joan ondoren. Lord shadow hilik aurkitu zuten egunsentian, eta hainbat lagunek Ice Queen han ikusi zutela esan zuten.","en":"The Coastal Camp was deserted after a power outage. Lord shadow was found dead at dawn, and several people said they had seen Ice Queen there."}',
    '[{"characterId":"dna-noelia","row":0,"col":1},{"characterId":"cameraman","row":1,"col":0},{"characterId":"icequeen","row":2,"col":5},{"characterId":"lord-shadow","row":3,"col":2},{"characterId":"luigi","row":4,"col":3},{"characterId":"stylist","row":5,"col":4},{"characterId":"postman","row":6,"col":6}]'
  ),
  (
    '02402400-0000-4000-8000-000000000110',
    '02402400-0000-4000-8000-000000000007',
    'El secreto de la cantera',
    '{"es":"El secreto de la cantera","eu":"Harrobiko sekretua","en":"The Quarry''s Secret"}',
    2, 'stylist', 'luigi',
    '{"es":"Una piedra antigua desapareció de La Cantera y Luigi fue encontrado sin vida junto a las marcas de extracción. Moon scissors había estado trabajando en la zona durante la tarde.","eu":"Antzinako harri bat desagertu zen Harrobian, eta Luigi hilik aurkitu zuten erauzketa-marken ondoan. Moon scissors arratsaldean inguruan lanean aritu zen.","en":"An ancient stone vanished from the Quarry, and Luigi was found dead beside the excavation marks. Moon scissors had been working in the area that afternoon."}',
    '[{"characterId":"dna-noelia","row":0,"col":1},{"characterId":"cameraman","row":1,"col":0},{"characterId":"icequeen","row":2,"col":4},{"characterId":"lord-shadow","row":3,"col":5},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":3},{"characterId":"postman","row":6,"col":6}]'
  ),
  (
    '02402400-0000-4000-8000-000000000111',
    '02402400-0000-4000-8000-000000000008',
    'Pétalos bajo la escarcha',
    '{"es":"Pétalos bajo la escarcha","eu":"Petaloak izotzaren azpian","en":"Petals Beneath the Frost"}',
    2, 'dna-noelia', 'cameraman',
    '{"es":"El jardín amaneció cubierto de escarcha y El padre del rapero fue encontrado sin vida entre las flores. Doña Noelia había recorrido los Jardines del Norte antes de que cerraran sus puertas.","eu":"Lorategia izotzez estalita esnatu zen, eta El padre del rapero hilik aurkitu zuten loreen artean. Doña Noelia Iparraldeko Lorategietan ibili zen ateak itxi aurretik.","en":"The garden woke under a layer of frost, and El padre del rapero was found dead among the flowers. Doña Noelia had walked through the North Gardens before the gates closed."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":3},{"characterId":"lord-shadow","row":3,"col":2},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":5},{"characterId":"postman","row":6,"col":6},{"characterId":"taber","row":7,"col":7}]'
  ),
  (
    '02402400-0000-4000-8000-000000000112',
    '02402400-0000-4000-8000-000000000008',
    'El reflejo roto',
    '{"es":"El reflejo roto","eu":"Isla hautsia","en":"The Broken Reflection"}',
    3, 'cameraman', 'dna-noelia',
    '{"es":"Durante una recepción en el Palacio de Cristal, Doña Noelia fue encontrada sin vida. Una cámara del palacio registró a El padre del rapero entrando en el edificio poco antes.","eu":"Kristalezko Jauregiko harreran, Doña Noelia hilik aurkitu zuten. Jauregiko kamera batek El padre del rapero eraikinera sartzen grabatu zuen handik gutxira.","en":"During a reception at the Crystal Palace, Doña Noelia was found dead. A palace camera recorded El padre del rapero entering the building shortly beforehand."}',
    '[{"characterId":"dna-noelia","row":0,"col":5},{"characterId":"cameraman","row":1,"col":3},{"characterId":"icequeen","row":2,"col":1},{"characterId":"lord-shadow","row":3,"col":0},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":4},{"characterId":"postman","row":6,"col":6},{"characterId":"taber","row":7,"col":7}]'
  ),
  (
    '02402400-0000-4000-8000-000000000113',
    '02402400-0000-4000-8000-000000000008',
    'El libro de las sombras',
    '{"es":"El libro de las sombras","eu":"Itzalen liburua","en":"The Book of Shadows"}',
    3, 'lord-shadow', 'icequeen',
    '{"es":"Un manuscrito desapareció de la Biblioteca Antigua. Ice Queen fue encontrada sin vida entre los estantes y Lord shadow conocía un pasadizo oculto hasta la sala de lectura.","eu":"Eskuizkribu bat desagertu zen Liburutegi Zaharretik. Ice Queen hilik aurkitu zuten apalen artean, eta Lord shadowk irakurketa-gelarako pasabide ezkutu bat ezagutzen zuen.","en":"A manuscript disappeared from the Ancient Library. Ice Queen was found dead among the shelves, and Lord shadow knew a hidden passage into the reading room."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":3},{"characterId":"lord-shadow","row":3,"col":2},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":5},{"characterId":"postman","row":6,"col":6},{"characterId":"taber","row":7,"col":7}]'
  ),
  (
    '02402400-0000-4000-8000-000000000114',
    '02402400-0000-4000-8000-000000000008',
    'La fórmula perdida',
    '{"es":"La fórmula perdida","eu":"Galdutako formula","en":"The Missing Formula"}',
    3, 'luigi', 'stylist',
    '{"es":"Una fórmula desapareció del Laboratorio de Alquimia y Moon scissors fue encontrada sin vida junto a la mesa de trabajo. Luigi había preguntado por el experimento esa misma tarde.","eu":"Formula bat desagertu zen Alkimia Laborategitik, eta Moon scissors hilik aurkitu zuten lan-mahaiaren ondoan. Luigi esperimentuaz galdetzen aritu zen arratsalde hartan.","en":"A formula vanished from the Alchemy Laboratory, and Moon scissors was found dead beside the workbench. Luigi had asked about the experiment earlier that afternoon."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":4},{"characterId":"lord-shadow","row":3,"col":5},{"characterId":"luigi","row":4,"col":2},{"characterId":"stylist","row":5,"col":3},{"characterId":"postman","row":6,"col":6},{"characterId":"taber","row":7,"col":7}]'
  ),
  (
    '02402400-0000-4000-8000-000000000115',
    '02402400-0000-4000-8000-000000000008',
    'Niebla en el invernadero',
    '{"es":"Niebla en el invernadero","eu":"Lainoa negutegian","en":"Fog in the Greenhouse"}',
    2, 'stylist', 'luigi',
    '{"es":"Una niebla extraña cubrió el Gran Invernadero y Luigi fue encontrado sin vida entre las plantas. Moon scissors había permanecido en el edificio cuando el resto del grupo salió.","eu":"Laino bitxi batek Berotegi Handia estali zuen, eta Luigi hilik aurkitu zuten landareen artean. Moon scissors eraikinean geratu zen gainerako taldea atera zenean.","en":"A strange fog filled the Grand Greenhouse, and Luigi was found dead among the plants. Moon scissors had remained inside after the rest of the group left."}',
    '[{"characterId":"dna-noelia","row":0,"col":0},{"characterId":"cameraman","row":1,"col":1},{"characterId":"icequeen","row":2,"col":3},{"characterId":"lord-shadow","row":3,"col":2},{"characterId":"luigi","row":4,"col":4},{"characterId":"stylist","row":5,"col":7},{"characterId":"postman","row":6,"col":5},{"characterId":"taber","row":7,"col":6}]'
  );

DO $$
BEGIN
  IF (SELECT count(*) FROM murdoku_draft_case_seeds) <> 15 THEN
    RAISE EXCEPTION 'Expected 15 Murdoku draft cases';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM murdoku_draft_case_seeds seed
    LEFT JOIN public.murdoku_boards board ON board.id = seed.board_id
    WHERE board.id IS NULL
      OR board.grid_rows <> jsonb_array_length(seed.placements)
      OR board.grid_cols <> jsonb_array_length(seed.placements)
  ) THEN
    RAISE EXCEPTION 'A target Murdoku board is missing or has changed dimensions';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM murdoku_draft_case_seeds seed
    CROSS JOIN LATERAL jsonb_to_recordset(seed.placements)
      AS placement("characterId" text, row integer, col integer)
    LEFT JOIN public.murdoku_characters cast_member
      ON cast_member.id = placement."characterId"
    WHERE cast_member.id IS NULL
  ) THEN
    RAISE EXCEPTION 'A Murdoku draft case references an unknown character';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM murdoku_draft_case_seeds seed
    JOIN public.murdoku_boards board ON board.id = seed.board_id
    CROSS JOIN LATERAL jsonb_to_recordset(seed.placements)
      AS placement("characterId" text, row integer, col integer)
    WHERE NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(board.rooms) AS room(value)
      CROSS JOIN LATERAL jsonb_to_recordset(room.value->'cells')
        AS cell(row integer, col integer)
      WHERE cell.row = placement.row
        AND cell.col = placement.col
    )
    OR EXISTS (
      SELECT 1
      FROM public.murdoku_board_elements element
      JOIN public.murdoku_elements catalog_element ON catalog_element.id = element.element_id
      WHERE element.board_id = seed.board_id
        AND element.row_index = placement.row
        AND element.col_index = placement.col
        AND NOT catalog_element.walkable
    )
  ) THEN
    RAISE EXCEPTION 'A Murdoku draft placement is outside its board or on an unwalkable element';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM murdoku_draft_case_seeds seed
    WHERE (
      SELECT count(DISTINCT placement.row)
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
    ) <> jsonb_array_length(seed.placements)
    OR (
      SELECT count(DISTINCT placement.col)
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
    ) <> jsonb_array_length(seed.placements)
    OR (
      SELECT count(DISTINCT placement."characterId")
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
    ) <> jsonb_array_length(seed.placements)
    OR (
      SELECT room.value->>'id'
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
      JOIN public.murdoku_boards board ON board.id = seed.board_id
      CROSS JOIN LATERAL (
        SELECT room_data.value
        FROM jsonb_array_elements(board.rooms) AS room_data(value)
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_to_recordset(room_data.value->'cells')
            AS cell(row integer, col integer)
          WHERE cell.row = placement.row AND cell.col = placement.col
        )
        LIMIT 1
      ) room
      WHERE placement."characterId" = seed.killer_id
    ) IS NULL
    OR (
      SELECT room.value->>'id'
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
      JOIN public.murdoku_boards board ON board.id = seed.board_id
      CROSS JOIN LATERAL (
        SELECT room_data.value
        FROM jsonb_array_elements(board.rooms) AS room_data(value)
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_to_recordset(room_data.value->'cells')
            AS cell(row integer, col integer)
          WHERE cell.row = placement.row AND cell.col = placement.col
        )
        LIMIT 1
      ) room
      WHERE placement."characterId" = seed.victim_id
    ) IS NULL
    OR (
      SELECT room.value->>'id'
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
      JOIN public.murdoku_boards board ON board.id = seed.board_id
      CROSS JOIN LATERAL (
        SELECT room_data.value
        FROM jsonb_array_elements(board.rooms) AS room_data(value)
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_to_recordset(room_data.value->'cells')
            AS cell(row integer, col integer)
          WHERE cell.row = placement.row AND cell.col = placement.col
        )
        LIMIT 1
      ) room
      WHERE placement."characterId" = seed.killer_id
    ) IS DISTINCT FROM (
      SELECT room.value->>'id'
      FROM jsonb_to_recordset(seed.placements)
        AS placement("characterId" text, row integer, col integer)
      JOIN public.murdoku_boards board ON board.id = seed.board_id
      CROSS JOIN LATERAL (
        SELECT room_data.value
        FROM jsonb_array_elements(board.rooms) AS room_data(value)
        WHERE EXISTS (
          SELECT 1
          FROM jsonb_to_recordset(room_data.value->'cells')
            AS cell(row integer, col integer)
          WHERE cell.row = placement.row AND cell.col = placement.col
        )
        LIMIT 1
      ) room
      WHERE placement."characterId" = seed.victim_id
    )
  ) THEN
    RAISE EXCEPTION 'A Murdoku draft solution violates row, column or murder-scene constraints';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Cannot create Murdoku draft cases: no admin user is registered in public.user_roles';
  END IF;
END;
$$;

INSERT INTO public.murdoku_cases
  (id, title, title_i18n, creator_id, status, board_id, image, content, difficulty)
SELECT
  seed.id,
  seed.title,
  seed.title_i18n,
  (
    SELECT admin_assignment.user_id
    FROM public.user_roles admin_assignment
    WHERE admin_assignment.role = 'admin'
    ORDER BY admin_assignment.user_id
    LIMIT 1
  ),
  'draft',
  seed.board_id,
  NULL,
  jsonb_build_object(
    'gridRows', board.grid_rows,
    'gridCols', board.grid_cols,
    'solution', jsonb_build_object(
      'killerId', seed.killer_id,
      'victimId', seed.victim_id,
      'placements', seed.placements
    ),
    'clues',
    jsonb_build_array(
      jsonb_build_object(
        'id', 'incident',
        'type', 'fact',
        'text', jsonb_build_object(
          'es', seed.story_i18n->>'es',
          'eu', seed.story_i18n->>'eu',
          'en', seed.story_i18n->>'en'
        )
      )
    ) ||
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', 'location-' || placement."characterId",
            'type', 'clue',
            'characterId', placement."characterId",
            'roomId', room.value->>'id',
            'text', jsonb_build_object(
              'es', cast_member.name || ' estaba en la fila ' || (placement.row + 1)
                || ', columna ' || (placement.col + 1) || ', en '
                || COALESCE(room.value->'nameI18n'->>'es', room.value->>'name') || '.',
              'eu', cast_member.name || ' ' || (placement.row + 1)
                || '. errenkadan eta ' || (placement.col + 1) || '. zutabean zegoen, '
                || COALESCE(room.value->'nameI18n'->>'eu', room.value->>'name') || ' eremuan.',
              'en', cast_member.name || ' was in row ' || (placement.row + 1)
                || ', column ' || (placement.col + 1) || ', in '
                || COALESCE(room.value->'nameI18n'->>'en', room.value->>'name') || '.'
            )
          )
          ORDER BY position.ordinality
        )
        FROM jsonb_array_elements(seed.placements) WITH ORDINALITY
          AS position(value, ordinality)
        CROSS JOIN LATERAL jsonb_to_record(position.value)
          AS placement("characterId" text, row integer, col integer)
        JOIN public.murdoku_characters cast_member
          ON cast_member.id = placement."characterId"
        CROSS JOIN LATERAL (
          SELECT room_data.value
          FROM jsonb_array_elements(board.rooms) AS room_data(value)
          WHERE EXISTS (
            SELECT 1
            FROM jsonb_to_recordset(room_data.value->'cells')
              AS cell(row integer, col integer)
            WHERE cell.row = placement.row AND cell.col = placement.col
          )
          LIMIT 1
        ) room
      ),
      '[]'::jsonb
    )
  ),
  seed.difficulty
FROM murdoku_draft_case_seeds seed
JOIN public.murdoku_boards board ON board.id = seed.board_id
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  title_i18n = EXCLUDED.title_i18n,
  status = 'draft',
  board_id = EXCLUDED.board_id,
  content = EXCLUDED.content,
  difficulty = EXCLUDED.difficulty,
  updated_at = now();

DELETE FROM public.murdoku_case_characters
WHERE case_id IN (SELECT id FROM murdoku_draft_case_seeds);

INSERT INTO public.murdoku_case_characters (case_id, character_id, sort_order)
SELECT seed.id, placement."characterId", (position.ordinality - 1)::integer
FROM murdoku_draft_case_seeds seed
CROSS JOIN LATERAL jsonb_array_elements(seed.placements) WITH ORDINALITY
  AS position(value, ordinality)
CROSS JOIN LATERAL jsonb_to_record(position.value)
  AS placement("characterId" text)
ON CONFLICT (case_id, character_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order;

DROP TABLE murdoku_draft_case_seeds;

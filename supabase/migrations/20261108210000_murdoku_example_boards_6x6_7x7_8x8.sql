-- Migration: Add new public elements and 3 example boards (6x6, 7x7, 8x8)
-- All elements are public (private = false), not using any private elements (antxo-*)

-- 1. Insert new reusable public elements
INSERT INTO public.murdoku_elements (id, name, name_i18n, icon, walkable, private)
VALUES
  ('murdoku-statue', 'Estatua', '{"es":"Estatua","eu":"Estatua","en":"Statue"}', '🗿', false, false),
  ('murdoku-bench', 'Banco', '{"es":"Banco","eu":"Bankua","en":"Bench"}', '🪑', true, false),
  ('murdoku-flower', 'Flores', '{"es":"Flores","eu":"Loreak","en":"Flowers"}', '🌸', true, false),
  ('murdoku-lantern', 'Farol', '{"es":"Farol","eu":"Farola","en":"Lantern"}', '🏮', false, false),
  ('murdoku-anchor', 'Ancla', '{"es":"Ancla","eu":"Aingura","en":"Anchor"}', '⚓', false, false),
  ('murdoku-tent', 'Tienda de campaña', '{"es":"Tienda de campaña","eu":"Kanpadenda","en":"Tent"}', '⛺', false, false),
  ('murdoku-bookshelf', 'Estantería de libros', '{"es":"Estantería","eu":"Apalategia","en":"Bookshelf"}', '📚', false, false),
  ('murdoku-telescope', 'Telescopio', '{"es":"Telescopio","eu":"Teleskopioa","en":"Telescope"}', '🔭', false, false),
  ('murdoku-cauldron', 'Caldero', '{"es":"Caldero","eu":"Galdara","en":"Cauldron"}', '⚗️', false, false),
  ('murdoku-chest', 'Cofre', '{"es":"Cofre","eu":"Kofrea","en":"Chest"}', '🗝️', false, false),
  ('murdoku-portal', 'Portal Mágico', '{"es":"Portal","eu":"Ataria","en":"Portal"}', '🌀', true, false),
  ('murdoku-clock', 'Reloj de Torre', '{"es":"Reloj de Torre","eu":"Dorreko Erlojua","en":"Clock Tower"}', '🕰️', false, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_i18n = EXCLUDED.name_i18n,
  icon = EXCLUDED.icon,
  walkable = EXCLUDED.walkable,
  private = false;

-- 2. Board 1: 6x6 ("Plaza Mayor 6x6")
-- ID: 02402400-0000-4000-8000-000000000006
INSERT INTO public.murdoku_boards (
  id,
  slug,
  name,
  name_i18n,
  grid_rows,
  grid_cols,
  rooms
) VALUES (
  '02402400-0000-4000-8000-000000000006',
  'plaza-mayor-6x6',
  'Plaza Mayor 6x6',
  '{"es":"Plaza Mayor 6x6","eu":"Plaza Nagusia 6x6","en":"Main Square 6x6"}'::jsonb,
  6,
  6,
  '[
    {
      "id": "plaza-central",
      "name": "Plaza Central",
      "emoji": "🏛️",
      "nameI18n": {"es":"Plaza Central","eu":"Erdiko Plaza","en":"Central Square"},
      "cells": [{"row":0,"col":0},{"row":0,"col":1},{"row":0,"col":2},{"row":1,"col":0},{"row":1,"col":1},{"row":1,"col":2}],
      "namePosition": {"row":0,"col":0}
    },
    {
      "id": "mercado-viejo",
      "name": "Mercado Viejo",
      "emoji": "🏪",
      "nameI18n": {"es":"Mercado Viejo","eu":"Azoka Zaharra","en":"Old Market"},
      "cells": [{"row":0,"col":3},{"row":0,"col":4},{"row":0,"col":5},{"row":1,"col":3},{"row":1,"col":4},{"row":1,"col":5}],
      "namePosition": {"row":0,"col":3}
    },
    {
      "id": "parque-verde",
      "name": "Parque Verde",
      "emoji": "🌳",
      "nameI18n": {"es":"Parque Verde","eu":"Parke Berdea","en":"Green Park"},
      "cells": [{"row":2,"col":0},{"row":2,"col":1},{"row":2,"col":2},{"row":3,"col":0},{"row":3,"col":1},{"row":3,"col":2}],
      "namePosition": {"row":2,"col":0}
    },
    {
      "id": "muelle-viejo",
      "name": "Muelle Viejo",
      "emoji": "⛵",
      "nameI18n": {"es":"Muelle Viejo","eu":"Kaia Zaharra","en":"Old Pier"},
      "cells": [{"row":2,"col":3},{"row":2,"col":4},{"row":2,"col":5},{"row":3,"col":3},{"row":3,"col":4},{"row":3,"col":5}],
      "namePosition": {"row":2,"col":3}
    },
    {
      "id": "estacion-tren",
      "name": "Estación de Tren",
      "emoji": "🚂",
      "nameI18n": {"es":"Estación de Tren","eu":"Tren Geltokia","en":"Train Station"},
      "cells": [{"row":4,"col":0},{"row":4,"col":1},{"row":4,"col":2},{"row":5,"col":0},{"row":5,"col":1},{"row":5,"col":2}],
      "namePosition": {"row":4,"col":0}
    },
    {
      "id": "la-posada",
      "name": "La Posada",
      "emoji": "🍺",
      "nameI18n": {"es":"La Posada","eu":"Ostatua","en":"The Inn"},
      "cells": [{"row":4,"col":3},{"row":4,"col":4},{"row":4,"col":5},{"row":5,"col":3},{"row":5,"col":4},{"row":5,"col":5}],
      "namePosition": {"row":4,"col":3}
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  name_i18n = EXCLUDED.name_i18n,
  grid_rows = EXCLUDED.grid_rows,
  grid_cols = EXCLUDED.grid_cols,
  rooms = EXCLUDED.rooms;

-- Elements for Board 6x6
INSERT INTO public.murdoku_board_elements (
  board_id, element_id, room_id, row_index, col_index, sort_order, instance_id
) VALUES
  ('02402400-0000-4000-8000-000000000006', 'murdoku-statue',   'plaza-central', 0, 1, 0, 'b6-el-1'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-bench',    'plaza-central', 1, 0, 1, 'b6-el-2'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-house',    'mercado-viejo', 0, 4, 0, 'b6-el-3'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-tree',     'parque-verde',  2, 1, 0, 'b6-el-4'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-fountain', 'parque-verde',  3, 2, 1, 'b6-el-5'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-water',    'muelle-viejo',  2, 4, 0, 'b6-el-6'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-bridge',   'muelle-viejo',  3, 3, 1, 'b6-el-7'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-clock',    'estacion-tren', 4, 1, 0, 'b6-el-8'),
  ('02402400-0000-4000-8000-000000000006', 'murdoku-lantern',  'la-posada',     5, 4, 0, 'b6-el-9')
ON CONFLICT (board_id, row_index, col_index) DO UPDATE SET
  element_id = EXCLUDED.element_id,
  room_id = EXCLUDED.room_id,
  sort_order = EXCLUDED.sort_order,
  instance_id = EXCLUDED.instance_id;


-- 3. Board 2: 7x7 ("Costa Rocosa 7x7")
-- ID: 02402400-0000-4000-8000-000000000007
INSERT INTO public.murdoku_boards (
  id,
  slug,
  name,
  name_i18n,
  grid_rows,
  grid_cols,
  rooms
) VALUES (
  '02402400-0000-4000-8000-000000000007',
  'costa-rocosa-7x7',
  'Costa Rocosa 7x7',
  '{"es":"Costa Rocosa 7x7","eu":"Harkaitz Kosta 7x7","en":"Rocky Coast 7x7"}'::jsonb,
  7,
  7,
  '[
    {
      "id": "puerto-pesquero",
      "name": "Puerto Pesquero",
      "emoji": "⚓",
      "nameI18n": {"es":"Puerto Pesquero","eu":"Arrantza Portua","en":"Fishing Harbor"},
      "cells": [{"row":0,"col":0},{"row":0,"col":1},{"row":0,"col":2},{"row":0,"col":3},{"row":1,"col":0},{"row":1,"col":1},{"row":1,"col":2}],
      "namePosition": {"row":0,"col":0}
    },
    {
      "id": "el-faro",
      "name": "El Faro",
      "emoji": "🏮",
      "nameI18n": {"es":"El Faro","eu":"Itsasargia","en":"The Lighthouse"},
      "cells": [{"row":0,"col":4},{"row":0,"col":5},{"row":0,"col":6},{"row":1,"col":3},{"row":1,"col":4},{"row":1,"col":5},{"row":1,"col":6}],
      "namePosition": {"row":0,"col":4}
    },
    {
      "id": "bosque-sombrio",
      "name": "Bosque Sombrío",
      "emoji": "🌲",
      "nameI18n": {"es":"Bosque Sombrío","eu":"Baso Iluna","en":"Shadow Forest"},
      "cells": [{"row":2,"col":0},{"row":2,"col":1},{"row":2,"col":2},{"row":2,"col":3},{"row":2,"col":4},{"row":3,"col":0},{"row":3,"col":1}],
      "namePosition": {"row":2,"col":0}
    },
    {
      "id": "campamento-costero",
      "name": "Campamento Costero",
      "emoji": "⛺",
      "nameI18n": {"es":"Campamento Costero","eu":"Kostaldeko Kanpamentua","en":"Coastal Camp"},
      "cells": [{"row":2,"col":5},{"row":2,"col":6},{"row":3,"col":2},{"row":3,"col":3},{"row":3,"col":4},{"row":3,"col":5},{"row":3,"col":6}],
      "namePosition": {"row":2,"col":5}
    },
    {
      "id": "la-cantera",
      "name": "La Cantera",
      "emoji": "⛏️",
      "nameI18n": {"es":"La Cantera","eu":"Harrobia","en":"The Quarry"},
      "cells": [{"row":4,"col":0},{"row":4,"col":1},{"row":4,"col":2},{"row":5,"col":0},{"row":5,"col":1},{"row":5,"col":2},{"row":5,"col":3}],
      "namePosition": {"row":4,"col":0}
    },
    {
      "id": "castillo-alto",
      "name": "Castillo Alto",
      "emoji": "🏰",
      "nameI18n": {"es":"Castillo Alto","eu":"Gaztelu Garaia","en":"High Castle"},
      "cells": [{"row":4,"col":3},{"row":4,"col":4},{"row":4,"col":5},{"row":4,"col":6},{"row":5,"col":4},{"row":5,"col":5},{"row":5,"col":6}],
      "namePosition": {"row":4,"col":3}
    },
    {
      "id": "camino-acantilado",
      "name": "Camino del Acantilado",
      "emoji": "🛣️",
      "nameI18n": {"es":"Camino del Acantilado","eu":"Labar Bidea","en":"Cliff Path"},
      "cells": [{"row":6,"col":0},{"row":6,"col":1},{"row":6,"col":2},{"row":6,"col":3},{"row":6,"col":4},{"row":6,"col":5},{"row":6,"col":6}],
      "namePosition": {"row":6,"col":0}
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  name_i18n = EXCLUDED.name_i18n,
  grid_rows = EXCLUDED.grid_rows,
  grid_cols = EXCLUDED.grid_cols,
  rooms = EXCLUDED.rooms;

-- Elements for Board 7x7
INSERT INTO public.murdoku_board_elements (
  board_id, element_id, room_id, row_index, col_index, sort_order, instance_id
) VALUES
  ('02402400-0000-4000-8000-000000000007', 'murdoku-anchor',   'puerto-pesquero',   0, 0, 0, 'b7-el-1'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-water',    'puerto-pesquero',   1, 2, 1, 'b7-el-2'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-lantern',  'el-faro',           0, 6, 0, 'b7-el-3'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-tree',     'bosque-sombrio',    2, 2, 0, 'b7-el-4'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-tent',     'campamento-costero',3, 4, 0, 'b7-el-5'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-fire',     'campamento-costero',3, 6, 1, 'b7-el-6'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-rock',     'la-cantera',        5, 1, 0, 'b7-el-7'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-castle',   'castillo-alto',     4, 5, 0, 'b7-el-8'),
  ('02402400-0000-4000-8000-000000000007', 'murdoku-bench',    'camino-acantilado', 6, 3, 0, 'b7-el-9')
ON CONFLICT (board_id, row_index, col_index) DO UPDATE SET
  element_id = EXCLUDED.element_id,
  room_id = EXCLUDED.room_id,
  sort_order = EXCLUDED.sort_order,
  instance_id = EXCLUDED.instance_id;


-- 4. Board 3: 8x8 ("Mansión de la Niebla 8x8")
-- ID: 02402400-0000-4000-8000-000000000008
INSERT INTO public.murdoku_boards (
  id,
  slug,
  name,
  name_i18n,
  grid_rows,
  grid_cols,
  rooms
) VALUES (
  '02402400-0000-4000-8000-000000000008',
  'mansion-niebla-8x8',
  'Mansión de la Niebla 8x8',
  '{"es":"Mansión de la Niebla 8x8","eu":"Laino Jauregia 8x8","en":"Foggy Manor 8x8"}'::jsonb,
  8,
  8,
  '[
    {
      "id": "jardines-norte",
      "name": "Jardines del Norte",
      "emoji": "🌷",
      "nameI18n": {"es":"Jardines del Norte","eu":"Iparraldeko Lorategiak","en":"North Gardens"},
      "cells": [{"row":0,"col":0},{"row":0,"col":1},{"row":0,"col":2},{"row":0,"col":3},{"row":1,"col":0},{"row":1,"col":1},{"row":1,"col":2},{"row":1,"col":3}],
      "namePosition": {"row":0,"col":0}
    },
    {
      "id": "palacio-cristal",
      "name": "Palacio de Cristal",
      "emoji": "🏛️",
      "nameI18n": {"es":"Palacio de Cristal","eu":"Kristalezko Jauregia","en":"Crystal Palace"},
      "cells": [{"row":0,"col":4},{"row":0,"col":5},{"row":0,"col":6},{"row":0,"col":7},{"row":1,"col":4},{"row":1,"col":5},{"row":1,"col":6},{"row":1,"col":7}],
      "namePosition": {"row":0,"col":4}
    },
    {
      "id": "biblioteca",
      "name": "Biblioteca Antigua",
      "emoji": "📚",
      "nameI18n": {"es":"Biblioteca Antigua","eu":"Liburutegi Zaharra","en":"Ancient Library"},
      "cells": [{"row":2,"col":0},{"row":2,"col":1},{"row":2,"col":2},{"row":2,"col":3},{"row":3,"col":0},{"row":3,"col":1},{"row":3,"col":2},{"row":3,"col":3}],
      "namePosition": {"row":2,"col":0}
    },
    {
      "id": "observatorio",
      "name": "Observatorio Astral",
      "emoji": "🔭",
      "nameI18n": {"es":"Observatorio Astral","eu":"Izarren Behatokia","en":"Astral Observatory"},
      "cells": [{"row":2,"col":4},{"row":2,"col":5},{"row":2,"col":6},{"row":2,"col":7},{"row":3,"col":4},{"row":3,"col":5},{"row":3,"col":6},{"row":3,"col":7}],
      "namePosition": {"row":2,"col":4}
    },
    {
      "id": "laboratorio",
      "name": "Laboratorio Alquimia",
      "emoji": "⚗️",
      "nameI18n": {"es":"Laboratorio Alquimia","eu":"Alkimia Laborategia","en":"Alchemy Lab"},
      "cells": [{"row":4,"col":0},{"row":4,"col":1},{"row":4,"col":2},{"row":4,"col":3},{"row":5,"col":0},{"row":5,"col":1},{"row":5,"col":2},{"row":5,"col":3}],
      "namePosition": {"row":4,"col":0}
    },
    {
      "id": "invernadero",
      "name": "Gran Invernadero",
      "emoji": "🌿",
      "nameI18n": {"es":"Gran Invernadero","eu":"Negutegi Handia","en":"Grand Greenhouse"},
      "cells": [{"row":4,"col":4},{"row":4,"col":5},{"row":4,"col":6},{"row":4,"col":7},{"row":5,"col":4},{"row":5,"col":5},{"row":5,"col":6},{"row":5,"col":7}],
      "namePosition": {"row":4,"col":4}
    },
    {
      "id": "cripta",
      "name": "Cripta Misteriosa",
      "emoji": "🗝️",
      "nameI18n": {"es":"Cripta Misteriosa","eu":"Kripta Misteriotsua","en":"Mysterious Crypt"},
      "cells": [{"row":6,"col":0},{"row":6,"col":1},{"row":6,"col":2},{"row":6,"col":3},{"row":7,"col":0},{"row":7,"col":1},{"row":7,"col":2},{"row":7,"col":3}],
      "namePosition": {"row":6,"col":0}
    },
    {
      "id": "laberinto-setos",
      "name": "Laberinto de Setos",
      "emoji": "🌀",
      "nameI18n": {"es":"Laberinto de Setos","eu":"Hesi Labirintoa","en":"Hedge Maze"},
      "cells": [{"row":6,"col":4},{"row":6,"col":5},{"row":6,"col":6},{"row":6,"col":7},{"row":7,"col":4},{"row":7,"col":5},{"row":7,"col":6},{"row":7,"col":7}],
      "namePosition": {"row":6,"col":4}
    }
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  name_i18n = EXCLUDED.name_i18n,
  grid_rows = EXCLUDED.grid_rows,
  grid_cols = EXCLUDED.grid_cols,
  rooms = EXCLUDED.rooms;

-- Elements for Board 8x8
INSERT INTO public.murdoku_board_elements (
  board_id, element_id, room_id, row_index, col_index, sort_order, instance_id
) VALUES
  ('02402400-0000-4000-8000-000000000008', 'murdoku-flower',    'jardines-norte',  0, 1, 0, 'b8-el-1'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-statue',    'palacio-cristal', 0, 6, 0, 'b8-el-2'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-bookshelf', 'biblioteca',      2, 0, 0, 'b8-el-3'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-telescope', 'observatorio',    2, 7, 0, 'b8-el-4'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-cauldron',  'laboratorio',     5, 1, 0, 'b8-el-5'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-tree',      'invernadero',     4, 5, 0, 'b8-el-6'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-fountain',  'invernadero',     5, 6, 1, 'b8-el-7'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-chest',     'cripta',          7, 0, 0, 'b8-el-8'),
  ('02402400-0000-4000-8000-000000000008', 'murdoku-portal',    'laberinto-setos', 6, 6, 0, 'b8-el-9')
ON CONFLICT (board_id, row_index, col_index) DO UPDATE SET
  element_id = EXCLUDED.element_id,
  room_id = EXCLUDED.room_id,
  sort_order = EXCLUDED.sort_order,
  instance_id = EXCLUDED.instance_id;


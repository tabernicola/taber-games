-- Insert new Murdoku case: "La moto acuática"
-- Board: 02402400-0000-4000-8000-000000000001 (same board as "La pintada")
-- Difficulty: Medium-Hard (unique solution requires combining multiple indirect clues)
-- Culprit: Luigi (in the ría, Ibaiondo room, col 4 = even column)
-- Witness: El padre del rapero / cameraman (Skatepark, odd row 1)

INSERT INTO public.murdoku_cases (
  id,
  title,
  title_i18n,
  creator_id,
  status,
  board_id,
  image,
  content
) VALUES (
  '02402400-0000-4000-8000-000000000003',
  'La moto acuática',
  '{"es": "La moto acuática", "eu": "Ur-motoa", "en": "The jet ski"}'::jsonb,
  '00000000-0000-0000-0000-000000000000',
  'approved',
  '02402400-0000-4000-8000-000000000001',
  NULL,
  '{
    "clues": [
      {
        "id": "clue-scene",
        "text": {
          "es": "Alguien pilotó una moto acuática a toda velocidad por la ría. El caos quedó grabado en las cámaras del pueblo.",
          "eu": "Norbaitek ur-motoa abiadura bizian eraman zuen itsasadarretik. Kaosa herriaren kameretan grabatu zen.",
          "en": "Someone rode a jet ski at full speed through the river. The chaos was caught on the town''s cameras."
        },
        "type": "fact"
      },
      {
        "id": "clue-witness",
        "text": {
          "es": "El testigo vio pasar la moto acuática desde una rampa del Skate park, en una fila impar.",
          "eu": "Lekukoak ur-motoa ikusi zuen Skate parkeko rampa batetik, errenkada bakoiti batean.",
          "en": "The witness spotted the jet ski from a ramp in the Skate park, in an odd-numbered row."
        },
        "type": "fact"
      },
      {
        "id": "clue-killer",
        "text": {
          "es": "El culpable pilotaba la moto acuática en la ría de Ibaiondo, en una columna de número par.",
          "eu": "Erruduna ur-motoa gidatzen ari zen Ibaiondoko itsasadarrean, zenbaki bikoitiko zutabe batean.",
          "en": "The culprit was riding the jet ski in the Ibaiondo river, in an even-numbered column."
        },
        "type": "fact"
      },
      {
        "id": "clue-taber",
        "text": {
          "es": "Taber estaba desayunando tranquilamente en la única mesa del Parque de los gatos.",
          "eu": "Taber lasai gosaltzen ari zen Katuen parkeko mahai bakarrean.",
          "en": "Taber was peacefully having breakfast at the only table in the Cats park."
        },
        "type": "clue",
        "characterId": "taber",
        "roomId": "parque-gatos",
        "elementId": "Mesa"
      },
      {
        "id": "clue-cameraman",
        "text": {
          "es": "El padre del rapero era el testigo: grababa desde el Skate park en una fila impar, con vistas a la ría.",
          "eu": "Raperoaren aita zen lekukoa: Skate parketik grabatzen ari zen errenkada bakoiti batean, itsasadarrera begira.",
          "en": "The rapper''s dad was the witness: he was filming from the Skate park in an odd row, overlooking the river."
        },
        "type": "clue",
        "characterId": "cameraman",
        "roomId": "skatepark",
        "elementId": "Skate park"
      },
      {
        "id": "clue-luigi",
        "text": {
          "es": "Luigi no supo resistirse y cogió la moto acuática. Fue visto en la ría de Ibaiondo, en la columna central del tablero.",
          "eu": "Luigik ezin izan zion eutsi eta ur-motoa hartu zuen. Ibaiondoko itsasadarrean ikusi zuten, tauleraren erdiko zutabean.",
          "en": "Luigi could not resist and took the jet ski. He was seen in the Ibaiondo river, in the board''s central column."
        },
        "type": "clue",
        "characterId": "luigi",
        "roomId": "ibaiondo",
        "elementId": "Ría"
      },
      {
        "id": "clue-lord-shadow",
        "text": {
          "es": "Lord shadow merodeaba por la Estación vieja, en una casilla con estación (no en el viaducto), en las filas más al norte de ese edificio.",
          "eu": "Lord shadow Geltoki zaharraren inguruan zebilen, geltokia duen lauki batean (ez zubibidean), eraikin horretako iparraldeko errenkadetan.",
          "en": "Lord shadow was lurking around the Old Station, in a station cell (not the viaduct), in the northernmost rows of that building."
        },
        "type": "clue",
        "characterId": "lord-shadow",
        "roomId": "renfe",
        "elementId": "Estación"
      },
      {
        "id": "clue-tabletgirl",
        "text": {
          "es": "Tablet girl se refrescaba junto a la única fuente del pueblo, en Axular.",
          "eu": "Tablet girl herriko iturri bakarraren ondoan freskatzen ari zen, Axularren.",
          "en": "Tablet girl was cooling off next to the only fountain in the town, in Axular."
        },
        "type": "clue",
        "characterId": "tabletgirl",
        "roomId": "axular",
        "elementId": "Fuente"
      },
      {
        "id": "clue-stylist",
        "text": {
          "es": "Moon scissors cortaba el pelo en una terraza del Azoka, en una fila de número impar.",
          "eu": "Moon scissors ilea mozten ari zen Azokako terraza batean, zenbaki bakoitiko errenkadan.",
          "en": "Moon scissors was cutting hair on an Azoka terrace, in an odd-numbered row."
        },
        "type": "clue",
        "characterId": "stylist",
        "roomId": "azoka",
        "elementId": "Terraza"
      },
      {
        "id": "clue-icequeen",
        "text": {
          "es": "Ice Queen rezaba dentro de una iglesia de Alameda; no era la fila más al sur del pueblo.",
          "eu": "Ice Queen Alamedako eliza baten barruan otoitz egiten ari zen; ez zen herriko hegoaldeko errenkada.",
          "en": "Ice Queen was praying inside a church in Alameda; it was not the southernmost row of the town."
        },
        "type": "clue",
        "characterId": "icequeen",
        "roomId": "alameda",
        "elementId": "Iglesia"
      },
      {
        "id": "clue-dna-noelia",
        "text": {
          "es": "Doña Noelia esperaba en un edificio de La campa, en una fila más al sur que Ice Queen.",
          "eu": "Doña Noelia La campako eraikin batean itxaroten ari zen, Ice Queen baino hegoalderago dagoen errenkadan.",
          "en": "Doña Noelia was waiting in a building in La campa, in a row further south than Ice Queen."
        },
        "type": "clue",
        "characterId": "dna-noelia",
        "roomId": "la-campa",
        "elementId": "Edificio"
      },
      {
        "id": "clue-postman",
        "text": {
          "es": "El Sr. Barquillero vendía sus dulces en la fila más al sur de todo el pueblo, en una terraza de Alameda.",
          "eu": "Barquillero jauna bere gozokiak saltzen ari zen herriko hegoaldeko errenkadan, Alamedako terraza batean.",
          "en": "Mr. Barquillero was selling his sweets in the southernmost row of the entire town, on an Alameda terrace."
        },
        "type": "clue",
        "characterId": "postman",
        "roomId": "alameda",
        "elementId": "Terraza"
      }
    ],
    "solution": {
      "killerId": "luigi",
      "witnessId": "cameraman",
      "placements": [
        { "characterId": "taber",       "row": 0, "col": 0 },
        { "characterId": "cameraman",   "row": 1, "col": 7 },
        { "characterId": "luigi",       "row": 2, "col": 4 },
        { "characterId": "lord-shadow", "row": 3, "col": 1 },
        { "characterId": "tabletgirl",  "row": 4, "col": 8 },
        { "characterId": "stylist",     "row": 5, "col": 3 },
        { "characterId": "icequeen",    "row": 6, "col": 2 },
        { "characterId": "dna-noelia",  "row": 7, "col": 6 },
        { "characterId": "postman",     "row": 8, "col": 5 }
      ]
    }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  title_i18n  = EXCLUDED.title_i18n,
  status      = EXCLUDED.status,
  board_id    = EXCLUDED.board_id,
  image       = EXCLUDED.image,
  content     = EXCLUDED.content,
  updated_at  = now();

-- Link all 9 characters to this case (same cast as "La pintada")
INSERT INTO public.murdoku_case_characters (case_id, character_id, sort_order) VALUES
  ('02402400-0000-4000-8000-000000000003', 'taber',       0),
  ('02402400-0000-4000-8000-000000000003', 'stylist',     1),
  ('02402400-0000-4000-8000-000000000003', 'cameraman',   2),
  ('02402400-0000-4000-8000-000000000003', 'icequeen',    3),
  ('02402400-0000-4000-8000-000000000003', 'tabletgirl',  4),
  ('02402400-0000-4000-8000-000000000003', 'dna-noelia',  5),
  ('02402400-0000-4000-8000-000000000003', 'luigi',       6),
  ('02402400-0000-4000-8000-000000000003', 'lord-shadow', 7),
  ('02402400-0000-4000-8000-000000000003', 'postman',     8)
ON CONFLICT (case_id, character_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;


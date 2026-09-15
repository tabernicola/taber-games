import type {
  CaseContent,
  CaseStatus,
  Character,
  Clue,
  ClueType,
  Guess,
  GuessResult,
  MurdokuCase,
  Placement,
  Position,
  Room,
  RoomElement,
  Solution,
  ValidationResult,
  SolvabilityResult,
} from "../logic/game";

export type {
  CaseContent,
  CaseStatus,
  Character,
  Clue,
  ClueType,
  Guess,
  GuessResult,
  MurdokuCase,
  Placement,
  Position,
  Room,
  RoomElement,
  Solution,
  ValidationResult,
  SolvabilityResult,
};

export {
  validateSolution,
  checkGuess,
  isCaseSolvable,
  checkSudokuConstraints,
  getRoomForCell,
  getPlacement,
  characterAtPosition,
  buildEmptyGrid,
  createDefaultRooms,
  createEmptyCase,
  DEFAULT_CASE_CONTENT,
} from "../logic/game";

export const SAMPLE_CASE_CONTENT: CaseContent = {
  gridRows: 6,
  gridCols: 6,
  rooms: [
    {
      id: "plaza-gatos",
      name: "Plaza de los gatos",
      elements: [
        { name: "plaza", icon: "🏛️", position: { row: 0, col: 0 }, walkable: true },
        { name: "fuente", icon: "💧", position: { row: 0, col: 1 }, walkable: false },
        { name: "bancos", icon: "🪑", position: { row: 1, col: 1 }, walkable: true },
      ],
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 1, col: 1 },
      ],
    },
    {
      id: "ibaiondo",
      name: "Ibaiondo",
      elements: [
        { name: "calle", icon: "🛤️", position: { row: 0, col: 3 }, walkable: true },
        { name: "farola", icon: "💡", position: { row: 0, col: 4 }, walkable: false },
        { name: "acera", icon: "🚶", position: { row: 1, col: 2 }, walkable: true },
      ],
      cells: [
        { row: 0, col: 3 },
        { row: 0, col: 4 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 2, col: 2 },
      ],
    },
    {
      id: "skate-park",
      name: "Skate park",
      elements: [
        { name: "rampa", icon: "🛹", position: { row: 0, col: 5 }, walkable: true },
        { name: "barandilla", icon: "🛑", position: { row: 1, col: 4 }, walkable: false },
        { name: "asfalto", icon: "🪨", position: { row: 1, col: 5 }, walkable: true },
      ],
      cells: [
        { row: 0, col: 5 },
        { row: 1, col: 4 },
        { row: 1, col: 5 },
        { row: 2, col: 4 },
      ],
    },
    {
      id: "la-axular",
      name: "La Axular",
      elements: [
        { name: "esquina", icon: "🔲", position: { row: 1, col: 0 }, walkable: true },
        { name: "pared", icon: "🧱", position: { row: 2, col: 0 }, walkable: false },
        { name: "bordillo", icon: "🪨", position: { row: 2, col: 1 }, walkable: false },
      ],
      cells: [
        { row: 1, col: 0 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 3, col: 0 },
      ],
    },
    {
      id: "azoka",
      name: "Azoka",
      elements: [
        { name: "mesa", icon: "🪑", position: { row: 2, col: 3 }, walkable: false },
        { name: "silla", icon: "💺", position: { row: 3, col: 2 }, walkable: true },
        { name: "asfalto", icon: "🪨", position: { row: 3, col: 3 }, walkable: true },
      ],
      cells: [
        { row: 2, col: 3 },
        { row: 3, col: 2 },
        { row: 3, col: 3 },
        { row: 4, col: 2 },
      ],
    },
    {
      id: "vieja-estacion",
      name: "La vieja estación",
      elements: [
        { name: "andén", icon: "🛤️", position: { row: 2, col: 5 }, walkable: true },
        { name: "banqueta", icon: "🪑", position: { row: 3, col: 4 }, walkable: true },
        { name: "vía", icon: "🚂", position: { row: 3, col: 5 }, walkable: false },
      ],
      cells: [
        { row: 2, col: 5 },
        { row: 3, col: 4 },
        { row: 3, col: 5 },
      ],
    },
    {
      id: "la-alameda",
      name: "La Alameda",
      elements: [
        { name: "banqueta", icon: "🪑", position: { row: 3, col: 1 }, walkable: true },
        { name: "árbol", icon: "🌳", position: { row: 4, col: 0 }, walkable: false },
        { name: "césped", icon: "🌿", position: { row: 4, col: 1 }, walkable: false },
      ],
      cells: [
        { row: 3, col: 1 },
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 5, col: 0 },
        { row: 5, col: 1 },
      ],
    },
    {
      id: "fronton-viejo",
      name: "Frontón viejo",
      elements: [
        { name: "frontón", icon: "🏓", position: { row: 4, col: 3 }, walkable: false },
        { name: "línea", icon: "📏", position: { row: 4, col: 4 }, walkable: false },
        { name: "arena", icon: "🏖️", position: { row: 5, col: 2 }, walkable: true },
      ],
      cells: [
        { row: 4, col: 3 },
        { row: 4, col: 4 },
        { row: 5, col: 2 },
        { row: 5, col: 3 },
      ],
    },
    {
      id: "la-campa",
      name: "La campa",
      elements: [
        { name: "césped", icon: "🌿", position: { row: 4, col: 5 }, walkable: false },
        { name: "árbol", icon: "🌳", position: { row: 5, col: 4 }, walkable: false },
        { name: "bancos", icon: "🪑", position: { row: 5, col: 5 }, walkable: true },
      ],
      cells: [
        { row: 4, col: 5 },
        { row: 5, col: 4 },
        { row: 5, col: 5 },
      ],
    },
  ],
  characters: [
    {
      id: "colonel",
      name: "Coronel Hayes",
      image: "/tabers-murdoku/characters/p1.png",
      description: {
        es: "Un hombre militar retirado con temperamento violento.",
        en: "A retired military man with a violent temper.",
        eu: "Gizon militar erretiratua baseratzailekin.",
      },
    },
    {
      id: "maid",
      name: "Camarera",
      image: "/tabers-murdoku/characters/p2.png",
      description: {
        es: "Ayudante recién contratada, nerviosa y fácilmente asustadiza.",
        en: "Newly hired help, nervous and easily startled.",
        eu: "Azken-unean kontratatutako laguntzaile, nerviosoa eta erraz beldutakoa.",
      },
    },
    {
      id: "butler",
      name: "Mayordomo Blackwell",
      image: "/tabers-murdoku/characters/p3.png",
      description: {
        es: "Mayordomo leal durante 20 años, conoce cada secreto de la casa.",
        en: "Loyal butler of 20 years, knows every household secret.",
        eu: "20 urtez leialeko butlerra, etxeko sekretu guztiak dizkie.",
      },
    },
    {
      id: "gardener",
      name: "Jardinero Green",
      image: "/tabers-murdoku/characters/p4.png",
      description: {
        es: "Jardinero reservado que cuidaba los jardines solo.",
        en: "Reclusive gardener who tended the grounds alone.",
        eu: "Bereizi nekazari bakarrik loratu zituen lorategiak.",
      },
    },
    {
      id: "chef",
      name: "Chef Rodríguez",
      image: "/tabers-murdoku/characters/p5.png",
      description: {
        es: "Chef de temperamento caliente recientemente reprendido por el coronel.",
        en: "Hot-tempered chef recently reprimanded by the colonel.",
        eu: "Kolonelak azken-unean zigortutako sukalde-gorrotua.",
      },
    },
    {
      id: "librarian",
      name: "Bibliotecaria Pearl",
      image: "/tabers-murdoku/characters/p6.png",
      description: {
        es: "Bibliotecaria aguda con un pasado misterioso.",
        en: "Sharp-eyed librarian with a mysterious past.",
        eu: "Bizi-bistan baten jabe liburuzaina misteriotsuarekin.",
      },
    },
  ],
  solution: {
    killerId: "colonel",
    victimId: "maid",
    placements: [
      { characterId: "colonel", row: 0, col: 3 },
      { characterId: "maid", row: 0, col: 3 },
      { characterId: "butler", row: 1, col: 0 },
      { characterId: "gardener", row: 2, col: 4 },
      { characterId: "chef", row: 4, col: 2 },
      { characterId: "librarian", row: 5, col: 5 },
    ],
  },
  clues: [
    {
      id: "clue-1",
      text: {
        es: "El asesinato ocurrió en Ibaiondo, junto a la farola.",
        en: "The murder happened in Ibaiondo, next to the lamppost.",
        eu: "Hilketa Ibaiondon gertatu zen, farola ondoan.",
      },
      type: "clue",
      characterId: "colonel",
    },
    {
      id: "clue-2",
      text: {
        es: "El coronel estaba en la fila superior, en Ibaiondo.",
        en: "The colonel was in the top row, in Ibaiondo.",
        eu: "Kolonela goi lerroan dagoela, Ibaiondon.",
      },
      type: "clue",
      characterId: "maid",
    },
    {
      id: "clue-3",
      text: {
        es: "El mayordomo estaba en La Axular, junto a la esquina.",
        en: "The butler was in La Axular, by the corner.",
        eu: "Butlerra La Axulan zegoen, koroian.",
      },
      type: "clue",
      characterId: "butler",
    },
    {
      id: "clue-4",
      text: {
        es: "El jardinero estaba en el Skate park, junto a la rampa.",
        en: "The gardener was at the Skate park, by the ramp.",
        eu: "Jardineroa Skate park-en zegoen, ramparen ondoan.",
      },
      type: "clue",
      characterId: "gardener",
    },
    {
      id: "clue-5",
      text: {
        es: "El chef estaba en la Azoka, sentado en una mesa.",
        en: "The chef was at the Azoka, sitting at a table.",
        eu: "Sukaldaria Azokan zegoen, mahai baten ondoan.",
      },
      type: "clue",
      characterId: "chef",
    },
    {
      id: "clue-6",
      text: {
        es: "La bibliotecaria estaba en La campa, junto a un árbol.",
        en: "The librarian was at La campa, next to a tree.",
        eu: "Liburutegia La campan zegoen, zuhaitz ondoan.",
      },
      type: "clue",
      characterId: "librarian",
    },
  ],
};

export const SAMPLE_CASE: MurdokuCase = {
  id: "sample",
  title: "The Colonel's Crime",
  creator_id: null,
  status: "approved",
  content: SAMPLE_CASE_CONTENT,
  rejection_note: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

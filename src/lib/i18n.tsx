import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "eu" | "es" | "en";

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  eu: {
    "nav.home": "Hasiera",
    "nav.play": "Jokatu",
    "home.tagline": "IA egindako minijokoen aretoa. Sarrera bakarra oraingoz — laster gehiago.",
    "home.games": "JOKOAK",
    "home.available": "{n} eskuragarri",
    "home.card.tag": "Puzzlea · Jokalari bakarra",
    "home.card.desc": "Bota zazpi blokeatzaile eta sartu bederatzi piezak 6×6ko taulan. Beti askagarria, inoiz ez berdina.",
    "home.card.study.tag": "Puzzle · Jokalari bakarra",
    "home.card.study.desc": "3x3ko taula trinko batean jokatzen den xake logika joko erronka bat, non pieza gakoak kokatu behar dituzun puzzle estrategikoak konpontzeko.",
    "home.external": "Jolastu",
    "home.locked": "Blokeatuta",
    "home.coming": "Laster",
    "home.coming.desc": "Erronka berri bat forjatzen ari da. Itzuli laster.",
    "home.play": "Jokatu",
    "game.title": "THE TABER SQUARE",
    "game.desc": "Sartu bederatzi piezak zazpi blokeatzaileen inguruan. Biratu, iraulo eta jarri taula bete arte.",
    "game.new": "Joko berria",
    "game.selected": "Aukeratuta",
    "game.pickPiece": "Aukeratu pieza bat behean",
    "game.rotate": "Biratu (R)",
    "game.flip": "Iraulo (F)",
    "game.pieces": "Piezak",
    "game.hint": "Klik piezan → klik gelaxkan",
    "game.solved": "AMAITUTA",
    "game.solvedDesc": "Gelaxka guztiak beteta. Karratua zure aginduetara makurtzen da.",
    "game.playAgain": "Berriz jokatu",
    "game.close": "Itxi",
    "game.hintBtn": "Pista (1)",
    "game.hintUsed": "Pista erabilita",
    "game.solution": "Ikusi soluzioa",
    "game.hideSolution": "Ezkutatu soluzioa",
    "game.solutionShown": "Soluzioa ikusgai — ez du kontatzen irabazteko.",
    "home.card.e2.tag": "Puzzlea · Ertzak lotu",
    "home.card.e2.desc": "Lotu animalien ertzak. Taula txikietatik hasi eta jatorrizko 256 piezetako puzzlera iritsi.",
    "e2.desc": "Lotu ondoko piezen ertzak. Hasi 4×4an eta desblokeatu taula handiagoak jatorrizko Eternity II lortu arte.",
    "e2.rotate": "Biratu (R)",
    "e2.new": "Taula berria",
    "e2.reset": "Berrasi",
    "e2.pieces": "Piezak",
    "e2.help": "Klik piezan → klik gelaxkan · R biratzeko",
    "e2.candidates": "{n} pieza sar daitezke gelaxka honetan (berdez).",
    "e2.noCandidates": "Ez dago gelaxka honetan sartzen den piezarik.",
    "e2.score": "Bat datozen ertzak: {m}/{n}",
    "e2.placed": "Jarritakoak: {m}/{n}",
    "e2.trayEmpty": "Ez dago pieza gehiago.",
    "e2.solved": "EBATZITA!",
    "e2.solvedDesc": "Ertz guztiak bat datoz. Hurrengo tamaina desblokeatu duzu.",
    "e2.next": "Hurrengo maila",
    "e2.close": "Itxi",
    "e2.originalNote":
      "Hau da jatorrizko Eternity II puzzlea: 256 pieza finko eta argibide-pieza ofiziala. Inork ez du ebatzi; ez dago pistarik ez soluziorik.",
  },

  es: {
    "nav.home": "Inicio",
    "nav.play": "Jugar",
    "home.tagline": "Un salón de minijuegos hechos con la IA. Solo uno por ahora — vendrán más.",
    "home.games": "JUEGOS",
    "home.available": "{n} disponible",
    "home.card.tag": "Puzle · 1 jugador",
    "home.card.desc": "Tira los siete bloqueadores y encaja las nueve piezas en el tablero 6×6. Siempre resoluble, nunca igual.",
    "home.card.study.tag": "Puzle · 1 jugador",
    "home.card.study.desc": "Un desafiante juego de lógica de ajedrez en un tablero compacto de 3x3, donde debes colocar piezas clave para resolver acertijos estratégicos.",
    "home.external": "Jugar",
    "home.locked": "Bloqueado",
    "home.coming": "Próximamente",
    "home.coming.desc": "Se está forjando un nuevo desafío. Vuelve pronto.",
    "home.play": "Jugar",
    "game.title": "THE TABER SQUARE",
    "game.desc": "Coloca las nueve piezas alrededor de los siete bloqueadores. Rota, voltea y coloca hasta llenar el tablero.",
    "game.new": "Nueva partida",
    "game.selected": "Seleccionada",
    "game.pickPiece": "Elige una pieza abajo",
    "game.rotate": "Rotar (R)",
    "game.flip": "Voltear (F)",
    "game.pieces": "Piezas",
    "game.hint": "Clic en pieza → clic en celda",
    "game.solved": "RESUELTO",
    "game.solvedDesc": "Todas las celdas llenas. El cuadrado se dobla a tu voluntad.",
    "game.playAgain": "Jugar otra vez",
    "game.close": "Cerrar",
    "game.hintBtn": "Pista (1)",
    "game.hintUsed": "Pista usada",
    "game.solution": "Ver solución",
    "game.hideSolution": "Ocultar solución",
    "game.solutionShown": "Solución a la vista — no cuenta como victoria.",
    "home.card.e2.tag": "Puzle · Encaje de bordes",
    "home.card.e2.desc": "Haz coincidir los bordes de animales. Empieza en tableros pequeños y llega al puzle original de 256 piezas.",
    "e2.desc": "Haz coincidir los bordes de las piezas vecinas. Empieza en 4×4 y desbloquea tableros mayores hasta el Eternity II original.",
    "e2.rotate": "Rotar (R)",
    "e2.new": "Tablero nuevo",
    "e2.reset": "Reiniciar",
    "e2.pieces": "Piezas",
    "e2.help": "Clic en pieza → clic en celda · R para rotar",
    "e2.candidates": "{n} piezas encajan en esta casilla (en verde).",
    "e2.noCandidates": "Ninguna pieza encaja en esta casilla.",
    "e2.score": "Bordes que encajan: {m}/{n}",
    "e2.placed": "Colocadas: {m}/{n}",
    "e2.trayEmpty": "No quedan piezas.",
    "e2.solved": "¡RESUELTO!",
    "e2.solvedDesc": "Todos los bordes encajan. Has desbloqueado el siguiente tamaño.",
    "e2.next": "Siguiente nivel",
    "e2.close": "Cerrar",
    "e2.originalNote":
      "Este es el puzle Eternity II original: las 256 piezas reales y la pieza pista oficial. Nadie lo ha resuelto todavía, así que no hay pistas ni solución.",
  },

  en: {
    "nav.home": "Home",
    "nav.play": "Play",
    "home.tagline": "A arcade of AI-crafted minigames. One entry so far — more drops incoming.",
    "home.games": "GAMES",
    "home.available": "{n} available",
    "home.card.tag": "Puzzle · 1  player",
    "home.card.desc": "Roll seven blockers, then squeeze all nine pieces onto the 6×6 grid. Every game solvable, none the same.",
    "home.card.study.tag": "Puzzle · 1 player",
    "home.card.study.desc": "A challenging chess logic game on a compact 3x3 board, where you must position key pieces to solve strategic puzzles.",
    "home.external": "Play",
    "home.locked": "Locked",
    "home.coming": "Coming Soon",
    "home.coming.desc": "A new challenge is being forged. Check back soon.",
    "home.play": "Play",
    "game.title": "THE TABER SQUARE",
    "game.desc": "Fit all nine pieces around the seven blockers. Rotate, flip, and place until the grid is full.",
    "game.new": "New game",
    "game.selected": "Selected",
    "game.pickPiece": "Pick a piece below",
    "game.rotate": "Rotate (R)",
    "game.flip": "Flip (F)",
    "game.pieces": "Pieces",
    "game.hint": "Click a piece → click a cell",
    "game.solved": "SOLVED",
    "game.solvedDesc": "Every cell filled. The square bends to your will.",
    "game.playAgain": "Play again",
    "game.close": "Close",
    "game.hintBtn": "Hint (1)",
    "game.hintUsed": "Hint used",
    "game.solution": "Show solution",
    "game.hideSolution": "Hide solution",
    "game.solutionShown": "Solution revealed — it will not count as a win.",
    "home.card.e2.tag": "Puzzle · Edge matching",
    "home.card.e2.desc": "Match the animal edges. Start on small boards and work up to the original 256-piece puzzle.",
    "e2.desc": "Match the edges of neighbouring pieces. Start at 4×4 and unlock bigger boards up to the original Eternity II.",
    "e2.rotate": "Rotate (R)",
    "e2.new": "New board",
    "e2.reset": "Reset",
    "e2.pieces": "Pieces",
    "e2.help": "Click a piece → click a cell · R to rotate",
    "e2.candidates": "{n} pieces fit in this cell (in green).",
    "e2.noCandidates": "No piece fits in this cell.",
    "e2.score": "Matching edges: {m}/{n}",
    "e2.placed": "Placed: {m}/{n}",
    "e2.trayEmpty": "No pieces left.",
    "e2.solved": "SOLVED!",
    "e2.solvedDesc": "Every edge matches. The next size is unlocked.",
    "e2.next": "Next level",
    "e2.close": "Close",
    "e2.originalNote":
      "This is the original Eternity II puzzle: the real 256 pieces and the official clue piece. Nobody has solved it, so there is no hint and no solution.",
  },

};

const I18nContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}>({ lang: "es", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("taber-lang")) as Lang | null;
    if (saved && ["eu", "es", "en"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("taber-lang", l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

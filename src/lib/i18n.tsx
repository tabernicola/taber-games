import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "eu" | "es" | "en";
export type LangSlug = "eus" | "es" | "en";

export const LANG_SLUGS: LangSlug[] = ["eus", "es", "en"];

export function langFromSlug(slug: string | undefined): Lang | null {
  if (slug === "eus") return "eu";
  if (slug === "es") return "es";
  if (slug === "en") return "en";
  return null;
}

export function slugFromLang(lang: Lang): LangSlug {
  return lang === "eu" ? "eus" : lang;
}

/** Best guess for a visitor with no URL language: saved choice, then browser. */
export function detectLangSlug(): LangSlug {
  if (typeof window === "undefined") return "es";
  const saved = localStorage.getItem("taber-lang") as Lang | null;
  if (saved && ["eu", "es", "en"].includes(saved)) return slugFromLang(saved);
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("eu")) return "eus";
  if (nav.startsWith("es")) return "es";
  return "en";
}

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  eu: {
    "nav.home": "Hasiera",
    "nav.play": "Jokatu",
    "home.tagline": "IA egindako minijokoen aretoa. Sarrera bakarra oraingoz — laster gehiago.",
    "home.games": "JOKOAK",
    "home.available": "{n} eskuragarri",
    "home.card.tag": "Puzzlea · Jokalari bakarra",
    "home.card.desc":
      "Bota zazpi blokeatzaile eta sartu bederatzi piezak 6×6ko taulan. Beti askagarria, inoiz ez berdina.",
    "home.card.study.tag": "Puzzle · Jokalari bakarra",
    "home.card.study.desc":
      "3x3ko taula trinko batean jokatzen den xake logika joko erronka bat, non pieza gakoak kokatu behar dituzun puzzle estrategikoak konpontzeko.",
    "home.external": "Jolastu",
    "home.locked": "Blokeatuta",
    "home.coming": "Laster",
    "home.coming.desc": "Erronka berri bat forjatzen ari da. Itzuli laster.",
    "home.play": "Jokatu",
    "game.title": "THE TABER SQUARE",
    "game.desc":
      "Sartu bederatzi piezak zazpi blokeatzaileen inguruan. Biratu, iraulo eta jarri taula bete arte.",
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
    "home.card.e2.desc":
      "Lotu animalien ertzak. Taula txikietatik hasi eta jatorrizko 256 piezetako puzzlera iritsi.",
    "e2.desc":
      "Taber's Eternity erronka: ondoko piezen ertzak bat etorri behar dira. Inork ez du jatorrizko 16×16 taula ebatzi — ez dago soluziorik. Zuk lortuko duzu?",
    "e2.solveRateLabel": "Ebatzi duten",
    "e2.rate4": "60-70%",
    "e2.rate6": "25-30%",
    "e2.rate8": "5-10%",
    "e2.rate12": "%1 baino gutxiago",
    "e2.rate16": "inorrek ez du ebatzi",
    "e2.rotate": "Biratu (R)",
    "e2.solution": "Soluzioa",
    "e2.hideSolution": "Ezkutatu",
    "e2.solutionNote": "Soluzioa ikusi duzu: denbora ez da sailkapenean sartuko.",
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

    "common.back": "Atzera",
    "common.time": "Denbora",
    "common.loading": "Kargatzen…",
    "landing.howto": "Nola jokatu",
    "landing.startPlay": "Hasi jokatzen",
    "landing.chooseLevel": "Aukeratu maila",
    "landing.ranking": "Sailkapena",
    "rank.title": "Onenak 5",
    "rank.empty": "Oraindik ez dago markarik. Izan zaitez lehena!",
    "rank.error": "Ezin izan da sailkapena kargatu.",
    "rank.player": "Jokalaria",
    "rank.time": "Denbora",
    "score.yourTime": "Zure denbora: {t}",
    "score.enterName": "Zure izena",
    "score.submit": "Bidali sailkapenera",
    "score.saved": "Sailkapenean gordeta!",
    "score.skip": "Ez, eskerrik asko",
    "score.error": "Ezin izan da zure denbora gorde. Saiatu berriro.",
    "e2.level": "Maila",
    "e2.save": "Gorde partida",
    "e2.saving": "Gordetzen…",
    "e2.savedOk": "Partida gordeta",
    "e2.saveError": "Errorea gordetzean",
    "e2.saveNeedsAccount": "Kontu bat behar duzu partida gordetzeko.",
    "e2.continue": "Jarraitu gordetako partidarekin",
    "e2.savedInfo": "Gordeta: {size}×{size} · {t}",
    "e2.noSave": "Ez duzu gordetako partidarik.",
    "e2.loadError": "Ezin izan da zure gordetako partida egiaztatu.",
    "e2.deleteSave": "Ezabatu gordetakoa",
    "auth.title": "Sartu edo erregistratu",
    "auth.desc": "Kontu batekin Taber's Eternity partida gorde eta gero jarraitu dezakezu.",
    "auth.email": "Emaila",
    "auth.password": "Pasahitza",
    "auth.signIn": "Sartu",
    "auth.signUp": "Erregistratu",
    "auth.google": "Jarraitu Google-rekin",
    "auth.or": "edo",
    "auth.signOut": "Irten",
    "auth.checkEmail": "Egiaztatu zure emaila kontua baieztatzeko.",
    "auth.error": "Zerbait gaizki joan da. Saiatu berriro.",
    "auth.toggleSignUp": "Ez duzu konturik? Erregistratu",
    "auth.toggleSignIn": "Baduzu kontua? Sartu",
    "cookies.text":
      "Cookie teknikoak baino ez ditugu erabiltzen (hizkuntza eta saioa). Ez dago jarraipenik ez publizitaterik.",
    "cookies.accept": "Ados",
    "square.rule1": "Bota zazpi blokeatzaile: gelaxka horiek itxita daude.",
    "square.rule2": "Sartu bederatzi piezak gainerako gelaxketan.",
    "square.rule3": "Piezak biratu (R) eta iraul (F) daitezke.",
    "square.rule4": "Puzzle guztiak askagarriak dira; denbora gutxien behar duenak irabazten du.",
    "e2.rule1": "Jarri piezak taulan ondoko ertzak bat etor daitezen.",
    "e2.rule2": "Kanpoko ertzak taularen mugarekin bat etorri behar dira.",
    "e2.rule3": "Egin klik gelaxka huts batean gelaxka horretan sartzen diren piezak ikusteko.",
    "e2.rule4": "Ez dago pistarik ez soluziorik: 16×16 jatorrizkoa inork ez du ebatzi.",
  },

  es: {
    "nav.home": "Inicio",
    "nav.play": "Jugar",
    "home.tagline": "Un salón de minijuegos hechos con la IA. Solo uno por ahora — vendrán más.",
    "home.games": "JUEGOS",
    "home.available": "{n} disponible",
    "home.card.tag": "Puzle · 1 jugador",
    "home.card.desc":
      "Tira los siete bloqueadores y encaja las nueve piezas en el tablero 6×6. Siempre resoluble, nunca igual.",
    "home.card.study.tag": "Puzle · 1 jugador",
    "home.card.study.desc":
      "Un desafiante juego de lógica de ajedrez en un tablero compacto de 3x3, donde debes colocar piezas clave para resolver acertijos estratégicos.",
    "home.external": "Jugar",
    "home.locked": "Bloqueado",
    "home.coming": "Próximamente",
    "home.coming.desc": "Se está forjando un nuevo desafío. Vuelve pronto.",
    "home.play": "Jugar",
    "game.title": "THE TABER SQUARE",
    "game.desc":
      "Coloca las nueve piezas alrededor de los siete bloqueadores. Rota, voltea y coloca hasta llenar el tablero.",
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
    "home.card.e2.desc":
      "Haz coincidir los bordes de animales. Empieza en tableros pequeños y llega al puzle original de 256 piezas.",
    "e2.desc":
      "El reto de Taber's Eternity: haz coincidir los bordes de las piezas vecinas. Nadie ha resuelto el tablero original de 16×16 — no existe solución. ¿Lo conseguirás tú?",
    "e2.solveRateLabel": "Lo resuelven",
    "e2.rate4": "60-70%",
    "e2.rate6": "25-30%",
    "e2.rate8": "5-10%",
    "e2.rate12": "menos del 1%",
    "e2.rate16": "nadie lo ha resuelto",
    "e2.rotate": "Rotar (R)",
    "e2.solution": "Solución",
    "e2.hideSolution": "Ocultar",
    "e2.solutionNote": "Has visto la solución: este tiempo no cuenta para el ranking.",
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

    "common.back": "Volver",
    "common.time": "Tiempo",
    "common.loading": "Cargando…",
    "landing.howto": "Cómo se juega",
    "landing.startPlay": "Empezar a jugar",
    "landing.chooseLevel": "Elige nivel",
    "landing.ranking": "Ranking",
    "rank.title": "Top 5",
    "rank.empty": "Todavía no hay marcas. ¡Sé el primero!",
    "rank.error": "No se pudo cargar el ranking.",
    "rank.player": "Jugador",
    "rank.time": "Tiempo",
    "score.yourTime": "Tu tiempo: {t}",
    "score.enterName": "Tu nombre",
    "score.submit": "Enviar al ranking",
    "score.saved": "¡Guardado en el ranking!",
    "score.skip": "No, gracias",
    "score.error": "No se pudo guardar tu tiempo. Inténtalo de nuevo.",
    "e2.level": "Nivel",
    "e2.save": "Guardar partida",
    "e2.saving": "Guardando…",
    "e2.savedOk": "Partida guardada",
    "e2.saveError": "Error al guardar",
    "e2.saveNeedsAccount": "Necesitas una cuenta para guardar la partida.",
    "e2.continue": "Continuar partida guardada",
    "e2.savedInfo": "Guardada: {size}×{size} · {t}",
    "e2.noSave": "No tienes ninguna partida guardada.",
    "e2.loadError": "No se pudo comprobar tu partida guardada.",
    "e2.deleteSave": "Borrar la partida guardada",
    "auth.title": "Entrar o registrarse",
    "auth.desc":
      "Con una cuenta puedes guardar tu partida de Taber's Eternity y continuarla más tarde.",
    "auth.email": "Correo",
    "auth.password": "Contraseña",
    "auth.signIn": "Entrar",
    "auth.signUp": "Registrarse",
    "auth.google": "Continuar con Google",
    "auth.or": "o",
    "auth.signOut": "Salir",
    "auth.checkEmail": "Revisa tu correo para confirmar la cuenta.",
    "auth.error": "Algo salió mal. Inténtalo de nuevo.",
    "auth.toggleSignUp": "¿No tienes cuenta? Regístrate",
    "auth.toggleSignIn": "¿Ya tienes cuenta? Entra",
    "cookies.text":
      "Solo usamos cookies técnicas (idioma y sesión). No hay seguimiento ni publicidad.",
    "cookies.accept": "Entendido",
    "square.rule1": "Se tiran siete bloqueadores: esas casillas quedan ocupadas.",
    "square.rule2": "Encaja las nueve piezas en las casillas restantes.",
    "square.rule3": "Las piezas se pueden rotar (R) y voltear (F).",
    "square.rule4": "Todos los puzles tienen solución; gana quien lo resuelva en menos tiempo.",
    "e2.rule1": "Coloca las piezas de forma que los bordes vecinos coincidan.",
    "e2.rule2": "Los bordes exteriores deben mirar hacia fuera del tablero.",
    "e2.rule3": "Pulsa una casilla vacía para ver qué piezas encajan ahí.",
    "e2.rule4": "No hay pistas ni solución: el 16×16 original nadie lo ha resuelto.",
  },

  en: {
    "nav.home": "Home",
    "nav.play": "Play",
    "home.tagline": "A arcade of AI-crafted minigames. One entry so far — more drops incoming.",
    "home.games": "GAMES",
    "home.available": "{n} available",
    "home.card.tag": "Puzzle · 1  player",
    "home.card.desc":
      "Roll seven blockers, then squeeze all nine pieces onto the 6×6 grid. Every game solvable, none the same.",
    "home.card.study.tag": "Puzzle · 1 player",
    "home.card.study.desc":
      "A challenging chess logic game on a compact 3x3 board, where you must position key pieces to solve strategic puzzles.",
    "home.external": "Play",
    "home.locked": "Locked",
    "home.coming": "Coming Soon",
    "home.coming.desc": "A new challenge is being forged. Check back soon.",
    "home.play": "Play",
    "game.title": "THE TABER SQUARE",
    "game.desc":
      "Fit all nine pieces around the seven blockers. Rotate, flip, and place until the grid is full.",
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
    "home.card.e2.desc":
      "Match the animal edges. Start on small boards and work up to the original 256-piece puzzle.",
    "e2.desc":
      "The Taber's Eternity challenge: match the edges of neighbouring pieces. Nobody has solved the original 16×16 board — there is no known solution. Will you be the one?",
    "e2.solveRateLabel": "Solve it:",
    "e2.rate4": "60-70%",
    "e2.rate6": "25-30%",
    "e2.rate8": "5-10%",
    "e2.rate12": "less than 1%",
    "e2.rate16": "nobody has solved it",
    "e2.rotate": "Rotate (R)",
    "e2.solution": "Solution",
    "e2.hideSolution": "Hide",
    "e2.solutionNote": "You viewed the solution: this time will not count for the ranking.",
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

    "common.back": "Back",
    "common.time": "Time",
    "common.loading": "Loading…",
    "landing.howto": "How to play",
    "landing.startPlay": "Start playing",
    "landing.chooseLevel": "Choose a level",
    "landing.ranking": "Ranking",
    "rank.title": "Top 5",
    "rank.empty": "No times yet. Be the first!",
    "rank.error": "Couldn't load the ranking.",
    "rank.player": "Player",
    "rank.time": "Time",
    "score.yourTime": "Your time: {t}",
    "score.enterName": "Your name",
    "score.submit": "Send to ranking",
    "score.saved": "Saved to the ranking!",
    "score.skip": "No thanks",
    "score.error": "Couldn't save your time. Please try again.",
    "e2.level": "Level",
    "e2.save": "Save game",
    "e2.saving": "Saving…",
    "e2.savedOk": "Game saved",
    "e2.saveError": "Save failed",
    "e2.saveNeedsAccount": "You need an account to save your game.",
    "e2.continue": "Continue saved game",
    "e2.savedInfo": "Saved: {size}×{size} · {t}",
    "e2.noSave": "You have no saved game.",
    "e2.loadError": "Couldn't check your saved game.",
    "e2.deleteSave": "Delete saved game",
    "auth.title": "Sign in or sign up",
    "auth.desc": "With an account you can save your Taber's Eternity game and continue it later.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign in",
    "auth.signUp": "Sign up",
    "auth.google": "Continue with Google",
    "auth.or": "or",
    "auth.signOut": "Sign out",
    "auth.checkEmail": "Check your email to confirm your account.",
    "auth.error": "Something went wrong. Please try again.",
    "auth.toggleSignUp": "No account? Sign up",
    "auth.toggleSignIn": "Already have an account? Sign in",
    "cookies.text": "We only use technical cookies (language and session). No tracking, no ads.",
    "cookies.accept": "Got it",
    "square.rule1": "Seven blockers are rolled: those cells are taken.",
    "square.rule2": "Fit the nine pieces into the remaining cells.",
    "square.rule3": "Pieces can be rotated (R) and flipped (F).",
    "square.rule4": "Every puzzle is solvable; the fastest solve wins.",
    "e2.rule1": "Place pieces so neighbouring edges match.",
    "e2.rule2": "Outer edges must face the border of the board.",
    "e2.rule3": "Tap an empty cell to highlight the pieces that fit there.",
    "e2.rule4": "No hints and no solution: nobody has solved the original 16x16.",
  },
};

const I18nContext = createContext<{
  lang: Lang;
  slug: LangSlug;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}>({ lang: "es", slug: "es", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children, lang: controlled }: { children: ReactNode; lang?: Lang }) {
  const [internal, setInternal] = useState<Lang>("es");
  const lang = controlled ?? internal;

  useEffect(() => {
    if (controlled && typeof window !== "undefined") {
      localStorage.setItem("taber-lang", controlled);
    }
  }, [controlled]);

  const setLang = (l: Lang) => {
    setInternal(l);
    if (typeof window !== "undefined") localStorage.setItem("taber-lang", l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };

  return (
    <I18nContext.Provider value={{ lang, slug: slugFromLang(lang), setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

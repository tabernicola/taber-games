import type { ExternalGameEntry, GameModule } from "./types";
import { coreTranslations, mergeTranslations } from "@/platform/i18n";
import studyLogo from "@/assets/taber-study-logo.png.asset.json";
import { taberSquareGame } from "@/games/taber-square/manifest";
import { tabersStarGame } from "@/games/tabers-star/manifest";
import { eternityIIGame } from "@/games/eternity-ii/manifest";

export const games: GameModule[] = [taberSquareGame, eternityIIGame, tabersStarGame];

export const externalGames: ExternalGameEntry[] = [
  {
    id: "taber-study",
    href: "https://the-taber-study.base44.app",
    title: "The Taber Study",
    tagKey: "home.card.study.tag",
    descriptionKey: "home.card.study.desc",
    image: studyLogo.url,
  },
];

export const appTranslations = mergeTranslations(
  coreTranslations,
  ...games.map((game) => game.translations),
);

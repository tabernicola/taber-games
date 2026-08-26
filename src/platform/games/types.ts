import type { ComponentType } from "react";
import type { LangSlug, Translations } from "@/platform/i18n/engine";
import type { ScoresService } from "@/platform/scores/createScoresService";

export type GameCardProps = {
  lang: LangSlug;
};

export type TranslateFn = (key: string) => string;

/**
 * Contract every game slice fulfils so the platform (home, i18n, scores) can
 * consume it without knowing the game. Games never import each other.
 */
export interface GameModule {
  id: string;
  Card: ComponentType<GameCardProps>;
  translations: Translations;
  createScoresService: () => ScoresService;
  formatLevelLabel: (level: number, t: TranslateFn) => string;
}

/** A game hosted outside this app, listed on the home carousel. */
export interface ExternalGameEntry {
  id: string;
  href: string;
  title: string;
  /** i18n keys for the card copy. */
  tagKey: string;
  descriptionKey: string;
  image?: string;
}

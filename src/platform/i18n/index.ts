export { coreTranslations } from "./dict-core";
export {
  LANG_SLUGS,
  detectLangSlug,
  langFromSlug,
  mergeTranslations,
  slugFromLang,
  I18nProvider,
  useI18n,
} from "./engine";
export type { Dict, Lang, LangSlug, Translations } from "./engine";

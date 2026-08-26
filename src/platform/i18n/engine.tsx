import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getStorageItem, setStorageItem } from "@/platform/storage";

export type Lang = "eu" | "es" | "en";
export type LangSlug = "eus" | "es" | "en";
export type Dict = Record<string, string>;
export type Translations = Record<Lang, Dict>;

export const LANG_SLUGS: LangSlug[] = ["eus", "es", "en"];
const LANGS: Lang[] = ["eu", "es", "en"];

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
  const saved = getStorageItem("taber-lang") as Lang | null;
  if (saved && LANGS.includes(saved)) return slugFromLang(saved);
  const nav = navigator.language?.toLowerCase() ?? "";
  if (nav.startsWith("eu")) return "eus";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function mergeTranslations(...sources: Translations[]): Translations {
  const merged: Translations = { eu: {}, es: {}, en: {} };
  for (const source of sources) {
    for (const lang of LANGS) Object.assign(merged[lang], source[lang]);
  }
  return merged;
}

type I18nContextValue = {
  lang: Lang;
  slug: LangSlug;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const EMPTY_TRANSLATIONS: Translations = { eu: {}, es: {}, en: {} };

const I18nContext = createContext<I18nContextValue>({
  lang: "es",
  slug: "es",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({
  translations = EMPTY_TRANSLATIONS,
  children,
  lang: controlled,
}: {
  translations?: Translations;
  children: ReactNode;
  lang?: Lang;
}) {
  const [internal, setInternal] = useState<Lang>("es");
  const lang = controlled ?? internal;

  useEffect(() => {
    if (controlled) setStorageItem("taber-lang", controlled);
  }, [controlled]);

  const setLang = (l: Lang) => {
    setInternal(l);
    setStorageItem("taber-lang", l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s =
      translations[lang][key] ??
      translations.en[key] ??
      translations.es[key] ??
      translations.eu[key] ??
      key;
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

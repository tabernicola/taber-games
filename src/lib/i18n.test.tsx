import { afterEach, describe, expect, it, vi } from "vitest";
import { LANG_SLUGS, detectLangSlug, langFromSlug, slugFromLang } from "./i18n";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("langFromSlug", () => {
  it("maps known slugs to languages", () => {
    expect(langFromSlug("eus")).toBe("eu");
    expect(langFromSlug("es")).toBe("es");
    expect(langFromSlug("en")).toBe("en");
  });

  it("returns null for unknown or missing slugs", () => {
    expect(langFromSlug("fr")).toBeNull();
    expect(langFromSlug(undefined)).toBeNull();
  });
});

describe("slugFromLang", () => {
  it("maps languages to slugs, round-tripping with langFromSlug", () => {
    expect(slugFromLang("eu")).toBe("eus");
    expect(slugFromLang("es")).toBe("es");
    expect(slugFromLang("en")).toBe("en");
    for (const slug of LANG_SLUGS) {
      expect(slugFromLang(langFromSlug(slug)!)).toBe(slug);
    }
  });
});

describe("detectLangSlug", () => {
  function stubBrowser(saved: string | null, navLang: string) {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: () => saved,
    });
    vi.stubGlobal("navigator", { language: navLang });
  }

  it("returns es during SSR (no window)", () => {
    vi.stubGlobal("window", undefined);
    expect(detectLangSlug()).toBe("es");
  });

  it("prefers a valid saved language", () => {
    stubBrowser("eu", "en-US");
    expect(detectLangSlug()).toBe("eus");
  });

  it("ignores an invalid saved language and uses the browser", () => {
    stubBrowser("de", "es-ES");
    expect(detectLangSlug()).toBe("es");
  });

  it("detects basque and spanish browsers", () => {
    stubBrowser(null, "eu");
    expect(detectLangSlug()).toBe("eus");
    stubBrowser(null, "es-MX");
    expect(detectLangSlug()).toBe("es");
  });

  it("falls back to english for other browsers", () => {
    stubBrowser(null, "fr-FR");
    expect(detectLangSlug()).toBe("en");
  });
});

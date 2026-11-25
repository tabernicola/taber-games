import { coreTranslations } from "@/platform/i18n";
import type { Lang, LangSlug } from "@/platform/i18n/engine";

/** Canonical URL base (used for canonical + hreflang alternates). */
const SITE_URL = "https://taber-games.lovable.app";

/** Build canonical (Spanish) + hreflang alternate links for a page path. */
export function seoLinks({ lang, path }: { lang: LangSlug; path: string }) {
  const links: { rel: string; href: string; hreflang?: string }[] = [
    { rel: "canonical", href: `${SITE_URL}/es${path}` },
  ];
  for (const slug of ["eus", "es", "en"] as const) {
    links.push({
      rel: "alternate",
      hreflang: slug === "eus" ? "eu" : slug,
      href: `${SITE_URL}/${slug}${path}`,
    });
  }
  return links;
}

/** Standard meta tags (title, description, Open Graph, Twitter card) for a page. */
export function pageMeta({
  title,
  description,
  ogTitle = title,
  ogImage,
  keywords,
}: {
  title: string;
  description: string;
  /** Open Graph title, when it should differ from the document title. */
  ogTitle?: string;
  /** Open Graph image URL. */
  ogImage?: string;
  /** Keywords for SEO (optional). */
  keywords?: string;
}) {
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];

  if (ogImage) {
    meta.push({ property: "og:image", content: ogImage });
    meta.push({ name: "twitter:image", content: ogImage });
  }

  if (keywords) {
    meta.push({ name: "keywords", content: keywords });
  }

  return meta;
}

/** Get translated meta tags for a specific language. */
export function getTranslatedMeta(lang: Lang) {
  const translations = coreTranslations[lang];
  return {
    title: translations["meta.title"],
    description: translations["meta.description"],
    keywords: translations["meta.keywords"],
    ogDescription: translations["meta.og.description"],
    schemaWebsiteDescription: translations["schema.website.description"],
    schemaOrganizationDescription: translations["schema.organization.description"],
  };
}

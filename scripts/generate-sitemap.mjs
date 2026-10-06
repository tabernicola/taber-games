#!/usr/bin/env node
/**
 * Regenerates `public/sitemap.xml` from the file based routes in `src/routes`.
 *
 * Run it whenever routes are added, removed or renamed:
 *   npm run sitemap
 *
 * Rules it enforces:
 *  - Auth and admin pages are never listed (see `EXCLUDED_SEGMENTS`).
 *  - Pure redirects are never listed: the language-prefixed URL is the one in
 *    the sitemap, the short alias only bounces the visitor.
 *  - `/$lang/...` is expanded into one URL per supported language, each one
 *    carrying the full `hreflang` cluster.
 *  - `lastmod` comes from the last commit that touched the route file, falling
 *    back to its modification date when git is unavailable.
 *
 * Point it somewhere else with `SITE_URL=https://example.com npm run sitemap`.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROUTES_DIR = join(ROOT, "src", "routes");
const I18N_ENGINE = join(ROOT, "src", "platform", "i18n", "engine.tsx");
const OUTPUT = join(ROOT, "public", "sitemap.xml");

const SITE_URL = (process.env.SITE_URL ?? "https://taber-games.lovable.app").replace(/\/+$/, "");

const LANG_PARAM = "$lang";

/**
 * Route segments that must never reach the sitemap. Keep it in sync with
 * `public/robots.txt`: anything disallowed there belongs here too.
 */
const EXCLUDED_SEGMENTS = new Set([
  "auth",
  "admin",
  "create",
  "edit",
  "delete",
  "play",
  "playground",
  "sandbox",
  "test",
]);

/** File names that do not add a segment to the URL (TanStack Router file routing). */
const IGNORED_FILE_NAMES = new Set(["__root", "index", "route", "_layout"]);

const today = new Date().toISOString().slice(0, 10);

function readLanguages() {
  const source = readFileSync(I18N_ENGINE, "utf8");
  const slugs = extractStringList(source, /export const LANG_SLUGS:[^=]*=\s*\[([^\]]*)\]/);
  const langs = extractStringList(source, /const LANGS:[^=]*=\s*\[([^\]]*)\]/);
  if (slugs.length === 0 || slugs.length !== langs.length) {
    throw new Error(
      `Could not read the language lists from ${relative(ROOT, I18N_ENGINE)}. ` +
        `Expected LANG_SLUGS and LANGS to declare the same number of entries.`,
    );
  }
  // Both lists are declared in the same order, so index i pairs slug i with
  // hreflang code i (the Basque slug "eus" is the hreflang "eu").
  return slugs.map((slug, index) => ({ slug, hreflang: langs[index] }));
}

function extractStringList(source, pattern) {
  const match = source.match(pattern);
  if (!match) return [];
  return [...match[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((entry) => entry[1]);
}

function collectRouteFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectRouteFiles(full));
    else if (entry.isFile() && /\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

/**
 * Turns `src/routes/$lang/murdoku/index.tsx` into `/$lang/murdoku` and
 * `src/routes/$lang/murdoku/play.tsx` into `/$lang/murdoku/play`. Returns null
 * when the file is not an addressable page (root shell, pathless layouts) or
 * uses a dynamic shape this generator does not support.
 */
function routeTemplateFor(file) {
  const parts = relative(ROUTES_DIR, file).split(sep);
  const fileName = parts.pop().replace(/\.tsx$/, "");

  const segments = [];
  for (const dirName of parts) {
    if (dirName === "_layout") continue;
    if (dirName === "$" || dirName.startsWith("{-$")) {
      warn(`unsupported dynamic route shape in ${relative(ROOT, file)}, skipped`);
      return null;
    }
    segments.push(dirName);
  }

  // `index` stands for the folder itself, the rest are named route files.
  if (fileName !== "index") {
    if (IGNORED_FILE_NAMES.has(fileName)) return null;
    segments.push(fileName);
  }
  if (segments.some((segment) => segment.startsWith("$") && segment !== LANG_PARAM)) {
    warn(`unsupported dynamic segment in ${relative(ROOT, file)}, skipped`);
    return null;
  }
  if (segments.length === 0) return null;

  const template = `/${segments.join("/")}`;
  return template === "/" ? null : template;
}

function isRedirect(file) {
  return /\bredirect(ToLang)?\s*\(/.test(readFileSync(file, "utf8"));
}

function expandLangs(template, languages) {
  if (!template.includes(LANG_PARAM)) return [template];
  return languages.map(({ slug }) => template.replaceAll(LANG_PARAM, slug));
}

function lastmodFor(file) {
  const fromGit = lastCommitDate(file);
  if (fromGit) return fromGit;
  return statSync(file).mtime.toISOString().slice(0, 10);
}

function lastCommitDate(file) {
  try {
    const output = execFileSync("git", ["log", "-1", "--format=%cs", "--", relative(ROOT, file)], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(output)) return null;
    // Never advertise a future change, some validators reject those.
    return output > today ? today : output;
  } catch {
    return null;
  }
}

/** Home pages are the most important, then the game landings, then the rest. */
function metadataFor(path) {
  const depth = path.split("/").length;
  if (depth === 2) return { changefreq: "weekly", priority: "1.0" };
  if (path.endsWith("/play")) return { changefreq: "daily", priority: "0.7" };
  if (depth === 3) return { changefreq: "weekly", priority: "0.8" };
  return { changefreq: "monthly", priority: "0.6" };
}

function escapeXml(value) {
  return value.replace(/[<>&"']/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

const warnings = [];
function warn(message) {
  warnings.push(message);
}

function buildSitemap(paths, languages) {
  const urls = paths
    .flatMap(({ template, file }) =>
      expandLangs(template, languages).map((path) => {
        const alternates = languages.map(({ slug, hreflang }) => {
          const href = `${SITE_URL}${template.replaceAll(LANG_PARAM, slug)}`;
          return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}"/>`;
        });
        return [
          `  <url>`,
          `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
          `    <lastmod>${lastmodFor(file)}</lastmod>`,
          `    <changefreq>${metadataFor(path).changefreq}</changefreq>`,
          `    <priority>${metadataFor(path).priority}</priority>`,
          ...alternates,
          `  </url>`,
        ].join("\n");
      }),
    )
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"`,
    `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 ">`,
    urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

function main() {
  const languages = readLanguages();
  const skipped = { excluded: [], redirect: [], unsupported: [] };
  const seen = new Map();

  for (const file of collectRouteFiles(ROUTES_DIR)) {
    const template = routeTemplateFor(file);
    if (!template) {
      skipped.unsupported.push(relative(ROUTES_DIR, file));
      continue;
    }
    if (isRedirect(file)) {
      skipped.redirect.push(template);
      continue;
    }
    const blocked = template.split("/").filter((segment) => EXCLUDED_SEGMENTS.has(segment));
    if (blocked.length > 0) {
      skipped.excluded.push(`${template} (${blocked.join(", ")})`);
      continue;
    }
    if (seen.has(template)) {
      warn(`${template} is declared twice (${seen.get(template)}), skipped the duplicate`);
      continue;
    }
    seen.set(template, relative(ROOT, file));
  }

  const paths = [...seen.entries()]
    .map(([template, file]) => ({ template, file }))
    .sort((a, b) => a.template.localeCompare(b.template));

  const xml = buildSitemap(paths, languages);
  const generatedUrls = [...xml.matchAll(/<loc>/g)].length;
  for (const { slug } of languages) {
    for (const segment of EXCLUDED_SEGMENTS) {
      if (xml.includes(`${SITE_URL}/${slug}/${segment}`)) {
        throw new Error(`Refusing to write: a ${segment} page leaked into the sitemap.`);
      }
    }
  }

  writeFileSync(OUTPUT, xml);

  console.log(`Sitemap written to ${relative(ROOT, OUTPUT)}`);
  console.log(`  base URL    ${SITE_URL}`);
  console.log(
    `  languages   ${languages.map(({ slug, hreflang }) => `${slug} (${hreflang})`).join(", ")}`,
  );
  console.log(`  paths       ${paths.length}`);
  console.log(`  urls        ${generatedUrls}`);
  console.log(
    `  excluded    ${skipped.excluded.length} auth/admin (${skipped.excluded.map((entry) => entry.split(" ")[0]).join(", ") || "none"})`,
  );
  console.log(
    `  redirects   ${skipped.redirect.length} (${skipped.redirect.join(", ") || "none"})`,
  );
  for (const message of warnings) console.log(`  warning     ${message}`);
}

main();

import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useI18n, langFromSlug } from "@/platform/i18n";
import { pageMeta, getTranslatedMeta } from "@/platform/seo";
import { externalGames, games } from "@/platform/games/registry";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = langFromSlug(params.lang) ?? "es";
    const meta = getTranslatedMeta(lang);
    const canonicalUrl = `https://taber-games.lovable.app/${params.lang}`;

    return {
      meta: pageMeta({
        title: meta.title,
        description: meta.description,
        ogImage: logoAsset.url,
        keywords: meta.keywords,
      }),
      scripts: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "The Taber Games",
            url: "https://taber-games.lovable.app",
            description: meta.schemaWebsiteDescription,
            inLanguage: ["en", "es", "eu"],
            potentialAction: {
              "@type": "SearchAction",
              target: "https://taber-games.lovable.app/{search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        },
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "The Taber Games",
            url: "https://taber-games.lovable.app",
            logo: logoAsset.url,
            description: meta.schemaOrganizationDescription,
            sameAs: [],
          }),
        },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  component: Home,
});

function Home() {
  const { t, slug } = useI18n();

  const totalCards = games.length + externalGames.length;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:pt-16">
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-70 blur-3xl"
              style={{
                background: "radial-gradient(closest-side, var(--neon-pink), transparent 70%)",
              }}
            />
            <img
              src={logoAsset.url}
              alt="The Taber Games"
              className="w-[min(520px,86vw)] drop-shadow-[0_0_40px_oklch(0.72_0.30_350/0.55)]"
            />
          </div>
          <p className="mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
            {t("home.tagline.part1")}
            <img
              src={`/${slug}/AI.png`}
              alt={t("home.tagline.part2")}
              className="mx-1 inline-block h-6 align-middle"
            />
            {t("home.tagline.part3")}
            <img
              src={`/${slug}/AI2.png`}
              alt={t("home.tagline.part4")}
              className="mx-1 inline-block h-6 align-middle"
            />
            {t("home.tagline.part5")}
          </p>
        </section>

        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2
              className="text-2xl tracking-widest text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("home.games")}
            </h2>
            <span className="text-xs text-muted-foreground">
              {t("home.available", { n: totalCards })}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {games.map((game) => (
              <game.Card key={game.id} lang={slug} />
            ))}
            {externalGames.map((game) => (
              <ExternalGameCard key={game.id} entry={game} />
            ))}
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Taber Games
      </footer>
    </div>
  );
}

function ExternalGameCard({ entry }: { entry: (typeof externalGames)[number] }) {
  const { t } = useI18n();
  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-neon-cyan hover:shadow-lg"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: "var(--neon-cyan)" }}
      />
      <div className="relative mb-3 flex h-32 w-full items-center justify-center rounded-xl bg-background/50 p-2">
        {entry.image && (
          <img
            src={entry.image}
            alt={entry.title}
            className="h-full w-full object-contain p-2 drop-shadow-[0_0_20px_oklch(0.85_0.18_200/0.5)] transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-cyan">
          {t(entry.tagKey)}
        </span>
        <h3
          className="mt-0.5 text-base font-bold tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {entry.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {t(entry.descriptionKey)}
        </p>
      </div>
    </a>
  );
}

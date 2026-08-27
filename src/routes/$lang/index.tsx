import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import logoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { useI18n } from "@/platform/i18n";
import { pageMeta } from "@/platform/seo";
import { externalGames, games } from "@/platform/games/registry";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const canonicalUrl = `https://taber-games.lovable.app/${params.lang}`;
    return {
      meta: pageMeta({
        title: "The Taber Games — Neon Arcade of Minigames",
        description:
          "Enter The Taber Games arcade: The Taber Square, Taber's Eternity and The Taber's Star, with rankings and saved games.",
        ogImage: logoAsset.url,
        keywords: "minigames, arcade, puzzles, AI games, online games, free games, strategy games, brain games",
      }),
      scripts: [
        {
          type: "application/ld+json",
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "The Taber Games",
            url: "https://taber-games.lovable.app",
            description: "Neon arcade of hand-crafted minigames. Play The Taber Square and more inside The Taber Games.",
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
            description: "Neon arcade of hand-crafted minigames",
            sameAs: [],
          }),
        },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { t, slug } = useI18n();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const totalCards = games.length + externalGames.length;

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const cardWidth = firstChild.offsetWidth + 16;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(Math.min(Math.max(index, 0), totalCards - 1));
      }
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 350;
      carouselRef.current.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
    }
  };

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      const cardWidth = firstChild ? firstChild.offsetWidth + 16 : 350;
      carouselRef.current.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    }
  };

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

          <div className="group relative">
            <div
              ref={carouselRef}
              className="-mx-1 flex touch-pan-x gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-1 py-2 hide-scrollbar snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex w-[85vw] shrink-0 snap-center flex-col sm:w-[380px] sm:snap-start md:w-[420px] lg:w-[460px]"
                >
                  <game.Card lang={slug} />
                </div>
              ))}
              {externalGames.map((game) => (
                <div
                  key={game.id}
                  className="flex w-[85vw] shrink-0 snap-center flex-col sm:w-[380px] sm:snap-start md:w-[420px] lg:w-[460px]"
                >
                  <ExternalGameCard entry={game} />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-90 shadow-lg backdrop-blur transition-all hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:-left-5 sm:h-10 sm:w-10 sm:bg-card sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Previous games"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-90 shadow-lg backdrop-blur transition-all hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20 sm:-right-5 sm:h-10 sm:w-10 sm:bg-card sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Next games"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4 sm:h-5 sm:w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Pagination dots for mobile */}
            <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
              {Array.from({ length: totalCards }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  className={`h-2 cursor-pointer rounded-full transition-all ${
                    activeIndex === i
                      ? "w-6 bg-neon-pink shadow-[0_0_8px_var(--neon-pink)]"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to game ${i + 1}`}
                />
              ))}
            </div>
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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-cyan"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "var(--neon-cyan)" }}
      />
      <div className="mb-3 flex justify-center">
        {entry.image && (
          <img
            src={entry.image}
            alt=""
            className="h-24 w-24 object-contain drop-shadow-[0_0_20px_oklch(0.85_0.18_200/0.5)]"
          />
        )}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-neon-cyan">
        {t(entry.tagKey)}
      </span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {entry.title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{t(entry.descriptionKey)}</p>
      <div className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-neon-cyan">
        {t("home.external")} <span aria-hidden>↗</span>
      </div>
    </a>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import logoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import studyLogo from "@/assets/taber-study-logo.png.asset.json";
import squareLogo from "@/assets/taber-square-logo-v2.png.asset.json";
import eternityLogo from "@/assets/tabers-eternity-logo.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";
import { useI18n } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/")({
  head: () => ({
    meta: pageMeta({
      title: "The Taber Games — Neon Arcade of Minigames",
      description:
        "Enter The Taber Games arcade: The Taber Square, Taber's Eternity and The Taber Study, with rankings and saved games.",
    }),
  }),
  component: Home,
});

function Home() {
  const { t, slug } = useI18n();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const cardWidth = firstChild.offsetWidth + 16;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(Math.min(Math.max(index, 0), 2));
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
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 350;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
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
              className="absolute inset-0 -z-10 blur-3xl opacity-70"
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
              className="inline-block h-6 mx-1 align-middle"
            />
            {t("home.tagline.part3")}
            <img
              src={`/${slug}/AI2.png`}
              alt={t("home.tagline.part4")}
              className="inline-block h-6 mx-1 align-middle"
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
            <span className="text-xs text-muted-foreground">{t("home.available", { n: 3 })}</span>
          </div>

          <div className="relative group">
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth py-2 px-1 -mx-1 hide-scrollbar snap-x snap-mandatory touch-pan-x overscroll-x-contain [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div className="w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[460px] shrink-0 snap-center sm:snap-start flex flex-col">
                <GameCard
                  to="/$lang/the-taber-square"
                  lang={slug}
                  title="The Taber Square"
                  tag={t("home.card.tag")}
                  description={t("home.card.desc")}
                  playLabel={t("home.play")}
                  image={squareLogo.url}
                />
              </div>
              <div className="w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[460px] shrink-0 snap-center sm:snap-start flex flex-col">
                <GameCard
                  to="/$lang/eternity-ii"
                  lang={slug}
                  title="Taber's Eternity"
                  tag={t("home.card.e2.tag")}
                  description={t("home.card.e2.desc")}
                  playLabel={t("home.play")}
                  image={eternityLogo.url}
                />
              </div>
              <div className="w-[85vw] sm:w-[380px] md:w-[420px] lg:w-[460px] shrink-0 snap-center sm:snap-start flex flex-col">
                <ExternalGameCard
                  href="https://the-taber-study.base44.app"
                  title="The Taber Study"
                  tag={t("home.card.study.tag")}
                  description={t("home.card.study.desc")}
                  playLabel={t("home.external")}
                  image={studyLogo.url}
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 sm:bg-card backdrop-blur shadow-lg hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 transition-all text-foreground opacity-90 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Previous games"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 sm:bg-card backdrop-blur shadow-lg hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 transition-all text-foreground opacity-90 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Next games"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Pagination dots for mobile */}
            <div className="mt-4 flex justify-center items-center gap-2 sm:hidden">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToCard(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
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

function ExternalGameCard({
  href,
  title,
  tag,
  description,
  playLabel,
  image,
}: {
  href: string;
  title: string;
  tag: string;
  description: string;
  playLabel: string;
  image: string;
}) {
  return (
    <a
      href={href}
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
        <img
          src={image}
          alt=""
          className="h-24 w-24 object-contain drop-shadow-[0_0_20px_oklch(0.85_0.18_200/0.5)]"
        />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-neon-cyan">{tag}</span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-auto pt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan">
        {playLabel} <span aria-hidden>↗</span>
      </div>
    </a>
  );
}

function GameCard({
  to,
  lang,
  title,
  tag,
  description,
  playLabel,
  image,
}: {
  to: "/$lang/the-taber-square" | "/$lang/eternity-ii";
  lang: string;
  title: string;
  tag: string;
  description: string;
  playLabel: string;
  image?: string;
}) {
  return (
    <Link
      to={to}
      params={{ lang }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-pink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "var(--neon-pink)" }}
      />
      {image && (
        <div className="mb-3 flex justify-center">
          <img
            src={image}
            alt=""
            className="h-24 max-w-64 object-contain drop-shadow-[0_0_20px_oklch(0.72_0.30_350/0.5)]"
          />
        </div>
      )}
      <span className="text-[10px] uppercase tracking-widest text-neon-pink">{tag}</span>
      <h3 className="mt-2 text-xl text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-auto pt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-pink">
        {playLabel} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

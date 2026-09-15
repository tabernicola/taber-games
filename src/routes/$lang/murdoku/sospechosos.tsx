import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { pageMeta } from "@/platform/seo";
import { fetchSuspects, type MurdokuCharacter } from "@/games/murdoku/logic/characters";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/$lang/murdoku/sospechosos")({
  head: () => ({
    meta: pageMeta({
      title: "Sospechosos — Murdoku",
      ogTitle: "Sospechosos",
      description: "Conoce a los sospechosos de los casos Murdoku.",
    }),
  }),
  component: SuspectsPage,
});

function SuspectsPage() {
  const { t, slug } = useI18n();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const {
    data: suspects,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["murdoku-suspects"],
    queryFn: fetchSuspects,
  });

  const suspectsList = suspects ?? [];

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
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
  }, [suspectsList.length]);

  const scrollBy = (dir: -1 | 1) => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstElementChild as HTMLElement | null;
      const scrollAmount = firstChild ? firstChild.offsetWidth + 16 : 350;
      carouselRef.current.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="murdoku-light min-h-screen pt-4">
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-10">
          <header className="text-center">
            <h1
              className="mt-4 text-3xl font-bold tracking-widest text-primary sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("suspects.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              {t("suspects.subtitle")}
            </p>
          </header>

          <section className="mt-12">
            {isPending && (
              <p className="text-center text-muted-foreground">{t("common.loading")}</p>
            )}
            {isError && (
              <div className="text-center">
                <p className="text-destructive">{t("suspects.error")}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                >
                  {t("suspects.retry")}
                </button>
              </div>
            )}
            {suspectsList.length > 0 && (
              <>
                <div className="group relative">
                  <div
                    ref={carouselRef}
                    className="-mx-1 flex touch-pan-x gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-1 snap-x snap-mandatory hide-scrollbar"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {suspectsList.map((char) => (
                      <SuspectCard key={char.id} char={char} />
                    ))}
                    {suspectsList.map((char) => (
                      <SuspectCard key={`dup-${char.id}`} char={char} />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollBy(-1)}
                    disabled={!canScrollLeft}
                    className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-90 shadow-lg backdrop-blur transition-all hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20"
                    aria-label="Previous suspect"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-4 w-4"
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
                    className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-card/90 text-foreground opacity-90 shadow-lg backdrop-blur transition-all hover:border-neon-pink hover:bg-neon-pink/20 active:scale-95 disabled:pointer-events-none disabled:opacity-20"
                    aria-label="Next suspect"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {t("suspects.count", { n: suspectsList.length })}
                </p>
              </>
            )}
            {suspectsList.length === 0 && !isPending && !isError && (
              <p className="text-center text-muted-foreground">{t("suspects.empty")}</p>
            )}
          </section>

          <div className="mt-10 flex justify-center gap-3">
            <Link
              to="/$lang/murdoku"
              params={{ lang: slug }}
              className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
            >
              {t("suspects.back")}
            </Link>
          </div>
        </main>

        <GameFooter basedOn="Murdoku — Sudoku-style deduction puzzle in the style of Clue/Cluedo." />
      </div>
    </div>
  );
}

function SuspectCard({ char }: { char: MurdokuCharacter }) {
  const { lang } = useI18n();
  const desc = char.description[lang] ?? Object.values(char.description)[0] ?? "";

  return (
    <div className="flex w-[85vw] shrink-0 snap-center flex-col sm:w-[380px] sm:snap-start md:w-[420px] lg:w-[460px]">
      <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-neon-pink/40">
        <div className="mb-4 flex items-center gap-4">
          {char.image ? (
            <img
              src={char.image}
              alt={char.name}
              className="h-20 w-20 rounded-full object-top object-cover ring-2 ring-white shadow-xs"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-4xl font-bold text-foreground">
              {char.name[0]}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-foreground">{char.name}</h3>
          </div>
        </div>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
    </div>
  );
}

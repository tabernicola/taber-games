import { createFileRoute, Link } from "@tanstack/react-router";
import logoAsset from "@/assets/taber-games-logo.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Taber Games — Neon Arcade of Minigames" },
      {
        name: "description",
        content:
          "Enter The Taber Games arcade. Start with The Taber Square, a solo puzzle inspired by The Genius Square.",
      },
      { property: "og:title", content: "The Taber Games — Neon Arcade of Minigames" },
      {
        property: "og:description",
        content:
          "Enter The Taber Games arcade. Start with The Taber Square, a solo puzzle inspired by The Genius Square.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:pt-16">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 blur-3xl opacity-70"
              style={{
                background:
                  "radial-gradient(closest-side, var(--neon-pink), transparent 70%)",
              }}
            />
            <img
              src={logoAsset.url}
              alt="The Taber Games"
              className="w-[min(520px,86vw)] drop-shadow-[0_0_40px_oklch(0.72_0.30_350/0.55)]"
            />
          </div>
          <p className="mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
            A neon arcade of hand-crafted minigames. One entry so far — more
            drops incoming.
          </p>
        </section>

        {/* Games grid */}
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2
              className="text-2xl tracking-widest text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              GAMES
            </h2>
            <span className="text-xs text-muted-foreground">1 available</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GameCard
              to="/the-taber-square"
              title="The Taber Square"
              tag="Puzzle · Solo"
              description="Roll seven blockers, then squeeze all nine pieces onto the 6×6 grid. Every game solvable, none the same."
            />
            <ComingSoonCard />
            <ComingSoonCard />
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Taber Games
      </footer>
    </div>
  );
}

function GameCard({
  to,
  title,
  tag,
  description,
}: {
  to: string;
  title: string;
  tag: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-pink"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
        style={{ background: "var(--neon-pink)" }}
      />
      <span className="text-[10px] uppercase tracking-widest text-neon-pink">
        {tag}
      </span>
      <h3
        className="mt-2 text-xl text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h3>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-pink">
        Play <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

function ComingSoonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/40 p-6">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Locked
      </span>
      <h3
        className="mt-2 text-xl text-muted-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Coming Soon
      </h3>
      <p className="mt-3 text-sm text-muted-foreground/70">
        A new challenge is being forged. Check back soon.
      </p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
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
            {t("home.tagline")}
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <GameCard
              to="/$lang/the-taber-square"
              lang={slug}
              title="The Taber Square"
              tag={t("home.card.tag")}
              description={t("home.card.desc")}
              playLabel={t("home.play")}
              image={squareLogo.url}
            />
            <GameCard
              to="/$lang/eternity-ii"
              lang={slug}
              title="Taber's Eternity"
              tag={t("home.card.e2.tag")}
              description={t("home.card.e2.desc")}
              playLabel={t("home.play")}
              image={eternityLogo.url}
            />
            <ExternalGameCard
              href="https://the-taber-study.base44.app"
              title="The Taber Study"
              tag={t("home.card.study.tag")}
              description={t("home.card.study.desc")}
              playLabel={t("home.external")}
              image={studyLogo.url}
            />
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-cyan"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
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
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-cyan">
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-neon-pink"
    >
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
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
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neon-pink">
        {playLabel} <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

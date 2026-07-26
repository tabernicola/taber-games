import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/taber-games-logo.png.asset.json";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoAsset.url}
            alt="The Taber Games"
            className="h-9 w-9 rounded-md object-cover"
          />
          <span
            className="text-sm tracking-widest text-neon-pink text-glow-pink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            TABER GAMES
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
          >
            Home
          </Link>
          <Link
            to="/the-taber-square"
            className="text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Play
          </Link>
        </nav>
      </div>
    </header>
  );
}

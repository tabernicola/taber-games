import { Link } from "@tanstack/react-router";
import taberGamesLogoAsset from "@/assets/taber-games-logo-v2.png.asset.json";
import lovableLogoAsset from "@/assets/lovable-logo.png.asset.json";
import { useI18n } from "@/lib/i18n";

/** Credits footer shown on each game's landing page. */
export function GameFooter({ basedOn }: { basedOn?: string }) {
  const { slug } = useI18n();
  return (
    <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
      {basedOn && <p>{basedOn}</p>}
      <p className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span>developed by</span>
        <Link
          to="/$lang"
          params={{ lang: slug }}
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src={taberGamesLogoAsset.url}
            alt="The Taber Games"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <span>with</span>
        <a
          href="https://lovable.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src={lovableLogoAsset.url}
            alt="Lovable"
            className="h-6 w-auto rounded object-contain"
          />
        </a>
      </p>
    </footer>
  );
}

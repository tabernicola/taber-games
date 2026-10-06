import { Link } from "@tanstack/react-router";
import { useI18n } from "@/platform/i18n";

type SubGame = "murdoku" | "star-battle" | "tabers-sudoku";

const logos: Record<SubGame, { src: string; alt: string }> = {
  murdoku: { src: "/taberdoku/murdoku-logo.png", alt: "murdoku.title" },
  "star-battle": { src: "/taberdoku/star-battle-logo.png", alt: "starBattle.title" },
  "tabers-sudoku": { src: "/taberdoku/sudoku-logo.png", alt: "sudoku.title" },
};

export function SubGameTabs({ active }: { active: SubGame }) {
  const { t, slug } = useI18n();

  const tabs: { key: SubGame; label: string; href: string }[] = [
    { key: "murdoku", label: t("taberdoku.murdoku.title"), href: "/$lang/taberdoku/murdoku" },
    { key: "star-battle", label: t("taberdoku.starBattle.title"), href: "/$lang/taberdoku/star-battle" },
    { key: "tabers-sudoku", label: t("taberdoku.sudoku.title"), href: "/$lang/taberdoku/tabers-sudoku" },
  ];

  const logo = logos[active];

  return (
    <div className="flex flex-col items-center">
      <img
        src={logo.src}
        alt={t(logo.alt)}
        className="object-contain drop-shadow-[0_0_12px_oklch(0.72_0.30_350/0.5)]"
      />
      <nav className="mt-2 flex gap-1 rounded-xl border border-border bg-card/50 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            to={tab.href}
            params={{ lang: slug }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
              active === tab.key
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_var(--primary)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
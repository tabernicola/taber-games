import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Home } from "lucide-react";
import { formatTime } from "@/platform/scores/formatTime";
import { useI18n } from "@/platform/i18n";

type LangRoute =
  | "/$lang/eternity-ii"
  | "/$lang/the-taber-square"
  | "/$lang/the-tabers-star"
  | "/$lang/auth";

const itemClass =
  "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors";

/** Fixed bottom action bar shown on the play pages. */
export function GameNav({
  borderClass = "border-border",
  children,
}: {
  borderClass?: string;
  children: ReactNode;
}) {
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 border-t ${borderClass} bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur`}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 py-2">
        {children}
      </div>
    </nav>
  );
}

export function GameNavLink({
  to,
  colorClass,
  icon,
  label,
  dataNav,
}: {
  to: LangRoute;
  colorClass: string;
  icon: ReactNode;
  label: ReactNode;
  dataNav?: string;
}) {
  const { slug } = useI18n();
  return (
    <Link
      to={to}
      params={{ lang: slug }}
      data-nav={dataNav}
      className={`${itemClass} ${colorClass}`}
    >
      {icon}
      {label}
    </Link>
  );
}

/** Link back to the game's landing page. */
export function GameNavBackLink({ to }: { to: LangRoute }) {
  const { t } = useI18n();
  return (
    <GameNavLink
      to={to}
      dataNav="back"
      colorClass="text-muted-foreground hover:text-neon-pink"
      icon={<Home className="h-5 w-5" />}
      label={t("common.back")}
    />
  );
}

export function GameNavButton({
  onClick,
  disabled,
  colorClass,
  icon,
  label,
  dataNav,
}: {
  onClick: () => void;
  disabled?: boolean;
  colorClass: string;
  icon: ReactNode;
  label: ReactNode;
  dataNav?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-nav={dataNav}
      className={`${itemClass} ${colorClass} disabled:opacity-40`}
    >
      {icon}
      {label}
    </button>
  );
}

export function GameNavTimer({ seconds }: { seconds: number }) {
  return (
    <div
      data-timer
      className="flex flex-none flex-col items-center justify-center gap-1 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1.5 text-[10px] font-semibold text-neon-cyan"
    >
      <Clock className="h-5 w-5" />
      <span className="tabular-nums">{formatTime(seconds)}</span>
    </div>
  );
}

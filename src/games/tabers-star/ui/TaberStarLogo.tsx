interface TaberStarLogoProps {
  className?: string;
}

/** Logo for The Taber's Star (PNG asset in public/tabers-star/logo.png). */
export function TaberStarLogo({ className }: TaberStarLogoProps) {
  return (
    <img
      src="/tabers-star/logo.png"
      alt="The Taber's Star"
      className={className}
      draggable={false}
    />
  );
}

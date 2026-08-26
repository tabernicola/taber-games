interface TaberStarLogoProps {
  className?: string;
}

/** Neon six-pointed star used as the game's logo. */
export function TaberStarLogo({ className }: TaberStarLogoProps) {
  const R = 10;
  const r = R / Math.sqrt(3);
  const pts: string[] = [];
  for (let k = 0; k < 12; k++) {
    const rad = k % 2 === 0 ? R : r;
    const a = (Math.PI / 6) * k - Math.PI / 2;
    pts.push(`${(rad * Math.cos(a)).toFixed(3)},${(rad * Math.sin(a)).toFixed(3)}`);
  }
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="taber-star-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.30 350)" />
          <stop offset="100%" stopColor="oklch(0.85 0.18 200)" />
        </linearGradient>
      </defs>
      <polygon
        points={pts.join(" ")}
        fill="url(#taber-star-grad)"
        stroke="oklch(0.9 0.1 350)"
        strokeWidth="0.8"
      />
      <polygon
        points={pts
          .map((p) => p.split(","))
          .filter((_, i) => i % 2 === 0)
          .map((p) => `${(+p[0] * 0.55).toFixed(2)},${(+p[1] * 0.55).toFixed(2)}`)
          .join(" ")}
        fill="none"
        stroke="oklch(0.96 0.01 90 / 0.7)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

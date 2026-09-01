interface MascotProps {
  className?: string;
}

/** Decorative Taber the Traveler character (public asset). */
export function Mascot({ className }: MascotProps) {
  return (
    <img
      src="/tabers-star/Tabler-palestino.png"
      alt=""
      aria-hidden
      className={className}
      draggable={false}
    />
  );
}

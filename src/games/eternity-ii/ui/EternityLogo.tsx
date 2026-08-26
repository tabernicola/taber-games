import eternityLogo from "@/assets/tabers-eternity-logo.png.asset.json";

/** Taber's Eternity logo with its neon glow, used on the landing and play headers. */
export function EternityLogo() {
  return (
    <div className="relative inline-block">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl opacity-70"
        style={{
          background: "radial-gradient(closest-side, var(--neon-pink), transparent 70%)",
        }}
      />
      <img
        src={eternityLogo.url}
        alt="Taber's Eternity"
        className="h-32 w-64 drop-shadow-[0_0_40px_oklch(0.72_0.30_350/0.55)]"
      />
    </div>
  );
}

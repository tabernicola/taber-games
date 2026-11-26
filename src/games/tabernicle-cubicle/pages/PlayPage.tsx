import { useSearch } from "@tanstack/react-router";
import { GameFooter } from "@/platform/layout/GameFooter";
import { TabernicleGame } from "../components/TabernicleGame";
import { useI18n } from "@/platform/i18n";

export function PlayPage() {
  const { slug } = useI18n();
  // Safe search param extraction if passed
  let requestedStage = 0;
  try {
    const search = useSearch({ strict: false }) as { stage?: number };
    if (search?.stage && typeof search.stage === "number") {
      requestedStage = Math.max(0, search.stage - 1);
    }
  } catch {
    requestedStage = 0;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <main className="mx-auto max-w-5xl px-3 pb-16 pt-4 sm:px-4">
        {/* Game Canvas Container */}
        <TabernicleGame lang={slug} initialLevel={requestedStage} />

        <GameFooter basedOn="Tabernicle Cubicle: inspirado en Kickle Cubicle (Irem, 1988) con mecánica invertida de fuego y lava." />
      </main>
    </div>
  );
}

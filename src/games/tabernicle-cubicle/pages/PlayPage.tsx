import { Link, useSearch } from "@tanstack/react-router";
import { GameFooter } from "@/platform/layout/GameFooter";
import { TabernicleGame } from "../components/TabernicleGame";
import { useI18n } from "@/platform/i18n";
import { ArrowLeft } from "lucide-react";

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
        {/* Navigation back bar */}
        <div className="mb-3 flex items-center justify-between">
          <Link
            to="/$lang/tabernicle-cubicle"
            params={{ lang: slug }}
            className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/80 px-3 py-1.5 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-600/60 hover:text-amber-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Tabernicle</span>
          </Link>
        </div>

        {/* Game Canvas Container */}
        <TabernicleGame lang={slug} initialLevel={requestedStage} />

        <GameFooter basedOn="Tabernicle Cubicle: inspirado en Kickle Cubicle (Irem, 1988) con mecánica invertida de fuego y lava." />
      </main>
    </div>
  );
}

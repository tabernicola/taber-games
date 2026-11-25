import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/platform/layout/SiteHeader";
import { GameFooter } from "@/platform/layout/GameFooter";
import { useI18n } from "@/platform/i18n";
import { LEVELS } from "../logic/levels";
import { useTabernicleLevels } from "../logic/levelStore";
import { unlockAudio } from "../logic/audio";
import { Flame, Play, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function LandingPage() {
  const { t, slug } = useI18n();
  const { data: loadedLevels } = useTabernicleLevels();
  const levels = loadedLevels?.levels ?? LEVELS;
  const [maxUnlocked, setMaxUnlocked] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tabernicle_max_level");
      if (stored) {
        setMaxUnlocked(Math.max(1, Math.min(levels.length, parseInt(stored, 10))));
      }
    } catch {
      // localStorage may fail
    }
  }, [levels.length]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
        {/* Hero Section */}
        <header className="flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-3xl bg-amber-600/30 blur-2xl filter"
            />
            <img
              src="/tabernicle-cubicle/taber-v2.png"
              alt="Tabernicle Cubicle"
              className="relative h-48 w-auto rounded-2xl object-contain drop-shadow-[0_10px_30px_rgba(255,140,0,0.5)] sm:h-56"
            />
          </div>

          <span className="mt-4 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400">
            {t("home.card.tabernicle.tag")}
          </span>

          <h1
            className="mt-3 text-3xl font-black tracking-wider text-amber-400 sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tabernicle Cubicle
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
            {t("tabernicle.desc")}
          </p>

          {/* Big Play Button */}
          <Link
            to="/$lang/tabernicle-cubicle/play"
            params={{ lang: slug }}
            search={{ stage: 1 }}
            onClick={() => unlockAudio()}
            className="group mt-6 flex items-center gap-3 rounded-2xl border-2 border-amber-500 bg-amber-600 px-8 py-3.5 text-base font-black uppercase tracking-wider text-white shadow-xl shadow-amber-950/60 transition-all hover:bg-amber-500 hover:shadow-amber-600/40 active:scale-95"
          >
            <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
            <span>{t("tabernicle.playNow")}</span>
          </Link>
        </header>

        {/* Level Progression Grid */}
        <section className="mt-12 rounded-2xl border border-amber-900/40 bg-stone-900/60 p-5 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-base font-bold uppercase tracking-wider text-amber-300"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t("tabernicle.selectStage")}
            </h2>
            <span className="text-xs text-stone-400">
              {maxUnlocked} / {levels.length} desbloqueadas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {levels.map((lvl, index) => {
              const isUnlocked = index < maxUnlocked;
              const langKey = slug === "eus" ? "eu" : slug === "en" ? "en" : "es";

              return isUnlocked ? (
                <Link
                  key={lvl.id}
                  to="/$lang/tabernicle-cubicle/play"
                  params={{ lang: slug }}
                  search={{ stage: index + 1 }}
                  onClick={() => unlockAudio()}
                  className="flex flex-col rounded-xl border border-amber-600/50 bg-amber-950/40 p-3 transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-900/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400">#{lvl.id}</span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <span className="mt-1 line-clamp-1 text-xs font-medium text-stone-200">
                    {lvl.name[langKey].split(":")[1] || lvl.name[langKey]}
                  </span>
                </Link>
              ) : (
                <div
                  key={lvl.id}
                  className="flex flex-col rounded-xl border border-stone-800 bg-stone-950/60 p-3 opacity-50"
                >
                  <span className="text-xs font-bold text-stone-500">#{lvl.id}</span>
                  <span className="mt-1 text-xs text-stone-600">Bloqueado</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rules & Controls Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Rules */}
          <section className="rounded-2xl border border-amber-900/40 bg-stone-900/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-400">
              <Flame className="h-5 w-5" />
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("tabernicle.rules.title")}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">1.</span>
                <span>{t("tabernicle.rule1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">2.</span>
                <span>{t("tabernicle.rule2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">3.</span>
                <span>{t("tabernicle.rule3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">4.</span>
                <span>{t("tabernicle.rule4")}</span>
              </li>
            </ul>
          </section>

          {/* Controls */}
          <section className="rounded-2xl border border-amber-900/40 bg-stone-900/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("tabernicle.controls.title")}
              </h2>
            </div>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>{t("tabernicle.controls.move")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>{t("tabernicle.controls.fire")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>{t("tabernicle.controls.club")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400">•</span>
                <span>{t("tabernicle.controls.mobile")}</span>
              </li>
            </ul>
          </section>
        </div>

        <GameFooter basedOn="Tabernicle Cubicle: inspirado en Kickle Cubicle (Irem, 1988) con mecánica invertida de fuego y lava." />
      </main>
    </div>
  );
}

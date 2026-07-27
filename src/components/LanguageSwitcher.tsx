import { useI18n, type Lang } from "@/lib/i18n";
import flagEu from "@/assets/flag-eu.png.asset.json";

const LANGS: { code: Lang; label: string; flag: string; isImg?: boolean }[] = [
  { code: "eu", label: "Euskara", flag: flagEu.url, isImg: true },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center gap-1">
      {LANGS.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            title={l.label}
            aria-label={l.label}
            aria-pressed={active}
            className={`flex h-7 w-9 items-center justify-center rounded-md border text-lg leading-none transition-all ${
              active
                ? "border-neon-pink bg-neon-pink/10 neon-glow-pink"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {l.isImg ? (
              <img src={l.flag} alt="" className="h-4 w-6 object-contain" />
            ) : (
              <span>{l.flag}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

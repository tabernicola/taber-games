import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function CookieBanner() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("taber-cookies") !== "ok") setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 text-xs text-muted-foreground shadow-lg backdrop-blur sm:flex-row">
        <p className="flex-1 text-center sm:text-left">{t("cookies.text")}</p>
        <button
          onClick={() => {
            localStorage.setItem("taber-cookies", "ok");
            setShow(false);
          }}
          className="rounded-lg border border-neon-pink bg-neon-pink/10 px-4 py-1.5 text-xs font-semibold text-neon-pink transition-colors hover:bg-neon-pink/20"
        >
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatTime } from "./formatTime";
import type { ScoresService } from "./createScoresService";
import { useI18n } from "@/platform/i18n";

/** Name + submit form shown in a win modal. */
export function ScoreForm({
  service,
  level,
  seconds,
  onDone,
}: {
  service: ScoresService;
  level?: number;
  seconds: number;
  onDone?: () => void;
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const send = async () => {
    if (!name.trim() || state === "sending" || state === "done") return;
    setState("sending");
    try {
      await service.submit(level ?? 0, name, seconds);
      await qc.invalidateQueries({ queryKey: ["scores", service.table, level] });
      setState("done");
      onDone?.();
    } catch (error) {
      console.error("Failed to submit score:", error);
      setState("error");
    }
  };

  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground">
        {t("score.yourTime", { t: formatTime(seconds) })}
      </p>
      {state === "done" ? (
        <p className="mt-2 text-sm font-semibold text-neon-cyan">{t("score.saved")}</p>
      ) : (
        <div className="mt-2 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            maxLength={24}
            placeholder={t("score.enterName")}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-neon-pink"
          />
          <button
            onClick={send}
            disabled={!name.trim() || state === "sending"}
            className="rounded-lg border border-neon-cyan bg-neon-cyan/10 px-3 py-2 text-xs font-semibold text-neon-cyan transition-colors hover:bg-neon-cyan/20 disabled:opacity-40"
          >
            {t("score.submit")}
          </button>
        </div>
      )}
      {state === "error" && <p className="mt-2 text-sm text-destructive">{t("score.error")}</p>}
    </div>
  );
}

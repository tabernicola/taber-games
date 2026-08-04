import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { submitScore, formatTime, type GameId } from "@/lib/scores";
import { useI18n } from "@/lib/i18n";

/** Name + submit form shown in a win modal. */
export function ScoreForm({
  game,
  level = "",
  seconds,
  onDone,
}: {
  game: GameId;
  level?: string;
  seconds: number;
  onDone?: () => void;
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const send = async () => {
    if (!name.trim() || state !== "idle") return;
    setState("sending");
    try {
      await submitScore(game, level, name, seconds);
      await qc.invalidateQueries({ queryKey: ["scores", game, level] });
      setState("done");
      onDone?.();
    } catch {
      setState("idle");
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
    </div>
  );
}

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { CaseContent, Guess } from "../data/gameSchema";
import { useI18n } from "@/platform/i18n";
import { checkGuess } from "../logic/game";

export function AccusationModal({
  content,
  open,
  onClose,
  onAccuse,
}: {
  content: CaseContent;
  open: boolean;
  onClose: () => void;
  onAccuse: (result: ReturnType<typeof checkGuess>) => void;
}) {
  const { t } = useI18n();
  const { characters } = content;

  const firstId = characters[0]?.id ?? "";
  const [killerId, setKillerId] = useState(firstId);
  const [victimId, setVictimId] = useState(characters[1]?.id ?? firstId);

  const handleSubmit = () => {
    const guess: Guess = { killerId, victimId };
    const result = checkGuess(guess, content.solution);
    onAccuse(result);
  };

  const disabled = !killerId || !victimId || killerId === victimId;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          className="murdoku-light fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-lg focus:outline-none"
          aria-label={t("murdoku.accuse")}
        >
          <Dialog.Title className="text-center text-lg font-bold tracking-wider text-primary">
            {t("murdoku.accuse")}
          </Dialog.Title>

          <div className="mt-4 space-y-4">
            <SelectField
              label={t("murdoku.chooseKiller")}
              value={killerId}
              onChange={setKillerId}
              options={characters.filter((c) => c.id !== victimId)}
            />
            <SelectField
              label={t("murdoku.chooseVictim")}
              value={victimId}
              onChange={setVictimId}
              options={characters.filter((c) => c.id !== killerId)}
            />
          </div>

          <p className="mt-2 text-[10px] text-muted-foreground">{t("creator.killerVictimSame")}</p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {t("murdoku.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              className="flex-1 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
            >
              {t("murdoku.submit")}
            </button>
          </div>

          <Dialog.Close className="absolute right-3 top-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string; image?: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full overflow-hidden">
          {options.find((o) => o.id === value)?.image && (
            <img
              src={options.find((o) => o.id === value)!.image}
              alt=""
              className="h-full w-full object-top object-cover"
            />
          )}
        </div>
      </div>
    </div>
  );
}

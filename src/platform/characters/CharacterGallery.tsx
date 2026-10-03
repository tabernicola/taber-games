import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/platform/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  characterDescription,
  charactersQueryKey,
  fetchCharacters,
  type Character,
} from "./characters";

export function CharacterGallery() {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<Character | null>(null);

  const {
    data: characters,
    isPending,
    isError,
  } = useQuery({
    queryKey: charactersQueryKey,
    queryFn: fetchCharacters,
  });

  const list = characters ?? [];

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-baseline justify-between">
        <h2
          className="text-2xl tracking-widest text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("home.characters")}
        </h2>
        {list.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {t("characters.count", { n: list.length })}
          </span>
        )}
      </div>

      {isPending && (
        <p className="text-center text-sm text-muted-foreground">{t("common.loading")}</p>
      )}
      {isError && <p className="text-center text-sm text-destructive">{t("characters.error")}</p>}
      {!isPending && !isError && list.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">{t("characters.empty")}</p>
      )}

      {list.length > 0 && (
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {list.map((character) => (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => setSelected(character)}
                className="group flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl p-2 transition-all hover:-translate-y-0.5 hover:bg-card"
                aria-label={character.name}
              >
                <CharacterAvatar character={character} className="h-20 w-20 sm:h-24 sm:w-24" />
                <span className="line-clamp-2 text-center text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  {character.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md border-neon-pink/40">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="text-2xl tracking-widest text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {selected.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <CharacterAvatar
                  character={selected}
                  className="h-56 w-56 sm:h-64 sm:w-64"
                  ringClassName="ring-4 ring-neon-pink/60"
                />
              </div>
              <DialogDescription className="text-center text-sm text-muted-foreground">
                {characterDescription(selected, lang)}
              </DialogDescription>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CharacterAvatar({
  character,
  className = "",
  ringClassName = "ring-2 ring-white/70",
}: {
  character: Character;
  className?: string;
  ringClassName?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ${ringClassName} ${className}`}
    >
      {character.image ? (
        <img
          src={character.image}
          alt={character.name}
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span className="text-3xl font-bold text-foreground">{character.name[0]}</span>
      )}
    </span>
  );
}

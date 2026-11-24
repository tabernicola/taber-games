import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import type { LangSlug } from "@/platform/i18n";
import { Button } from "@/components/ui/button";
import { LEVELS } from "../logic/levels";
import { DEFAULT_LEVEL_TIME_LIMIT_SECONDS, type LevelDef } from "../logic/types";
import {
  resetTabernicleLevel,
  saveTabernicleLevel,
  TABERNICLE_LEVELS_QUERY_KEY,
  useTabernicleLevels,
  validateLevelDef,
} from "../logic/levelStore";
import { LevelEditorGrid } from "./LevelEditorGrid";

function cloneLevel(lvl: LevelDef): LevelDef {
  return {
    ...lvl,
    name: { ...lvl.name },
    hint: {
      es: lvl.hint?.es ?? "",
      en: lvl.hint?.en ?? "",
      eu: lvl.hint?.eu ?? "",
    },
    timeLimitSeconds: lvl.timeLimitSeconds ?? DEFAULT_LEVEL_TIME_LIMIT_SECONDS,
    map: [...lvl.map],
  };
}

interface LevelEditorProps {
  lang: LangSlug;
}

/**
 * Admin level editor for Tabernicle Cubicle: select a stage, paint tiles,
 * edit names/hints/parameters, and save overrides to the database.
 */
export function LevelEditor({ lang }: LevelEditorProps) {
  const qc = useQueryClient();
  const { data } = useTabernicleLevels();
  const levels = data?.levels ?? LEVELS;
  const overriddenSet = new Set(data?.overriddenIds ?? []);

  const [selectedId, setSelectedId] = useState<number>(levels[0]?.id ?? 1);
  const [draft, setDraft] = useState<LevelDef>(() => cloneLevel(levels[0] ?? LEVELS[0]!));
  const [selectedTool, setSelectedTool] = useState("#");

  useEffect(() => {
    const found = levels.find((l) => l.id === selectedId) ?? levels[0];
    if (found) setDraft(cloneLevel(found));
  }, [selectedId, data]);

  const saveMut = useMutation({
    mutationFn: saveTabernicleLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABERNICLE_LEVELS_QUERY_KEY });
      toast.success(`Nivel ${draft.id} guardado.`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error al guardar."),
  });

  const resetMut = useMutation({
    mutationFn: resetTabernicleLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TABERNICLE_LEVELS_QUERY_KEY });
      toast.success(`Nivel ${draft.id} restablecido al original.`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Error al restablecer."),
  });

  const errors = validateLevelDef(draft);
  const isOverridden = overriddenSet.has(draft.id);
  const stageIndex = Math.max(1, levels.findIndex((l) => l.id === draft.id) + 1);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-1.5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Niveles ({levels.length})
        </h2>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5 lg:grid-cols-1">
          {levels.map((lvl) => {
            const active = lvl.id === selectedId;
            const custom = overriddenSet.has(lvl.id);
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedId(lvl.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/60"
                }`}
              >
                <span className="truncate font-medium">
                  #{lvl.id} {lvl.name.es.replace(/^Fase \d+:\s*/i, "")}
                </span>
                {custom && (
                  <span className="ml-1.5 shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    Editado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-foreground">Nivel #{draft.id}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/$lang/tabernicle-cubicle/play" params={{ lang }} search={{ stage: stageIndex }}>
                <Play className="h-4 w-4" />
                Probar nivel
              </Link>
            </Button>
            {isOverridden && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resetMut.isPending}
                onClick={() => resetMut.mutate(draft.id)}
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer original
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              disabled={errors.length > 0 || saveMut.isPending}
              onClick={() => saveMut.mutate(draft)}
            >
              <Save className="h-4 w-4" />
              {saveMut.isPending ? "Guardando…" : "Guardar nivel"}
            </Button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/60 bg-destructive/10 p-3 text-xs text-destructive">
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <LevelEditorGrid
          map={draft.map}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onChangeMap={(nextMap) => setDraft((prev) => ({ ...prev, map: nextMap }))}
        />

        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <label className="space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground">Máx. criaturas</span>
            <input
              type="number"
              min={0}
              max={20}
              value={draft.maxCreatures}
              onChange={(e) =>
                setDraft((p) => ({ ...p, maxCreatures: Math.max(0, Number(e.target.value) || 0) }))
              }
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground">Cooldown volcán (s)</span>
            <input
              type="number"
              min={1}
              max={60}
              value={draft.volcanoCooldown}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  volcanoCooldown: Math.max(1, Number(e.target.value) || 1),
                }))
              }
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground">Tiempo límite (s)</span>
            <input
              type="number"
              min={10}
              max={600}
              value={draft.timeLimitSeconds ?? DEFAULT_LEVEL_TIME_LIMIT_SECONDS}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  timeLimitSeconds: Math.max(10, Number(e.target.value) || 10),
                }))
              }
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          {(["es", "en", "eu"] as const).map((code) => (
            <div key={code} className="space-y-2">
              <label className="block space-y-1 text-xs">
                <span className="font-semibold uppercase text-muted-foreground">
                  Nombre ({code})
                </span>
                <input
                  type="text"
                  value={draft.name[code]}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, name: { ...p.name, [code]: e.target.value } }))
                  }
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
                />
              </label>
              <label className="block space-y-1 text-xs">
                <span className="font-semibold uppercase text-muted-foreground">Pista ({code})</span>
                <textarea
                  rows={2}
                  value={draft.hint?.[code] ?? ""}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      hint: {
                        es: p.hint?.es ?? "",
                        en: p.hint?.en ?? "",
                        eu: p.hint?.eu ?? "",
                        [code]: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
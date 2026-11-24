import { useState } from "react";
import { GRID_COLS, GRID_ROWS } from "../logic/types";

export interface TileTool {
  char: string;
  label: string;
  symbol: string;
  cellClass: string;
}

export const TILE_TOOLS: TileTool[] = [
  { char: "#", label: "Muro", symbol: "🧱", cellClass: "bg-stone-700 text-stone-200" },
  { char: ".", label: "Suelo", symbol: "·", cellClass: "bg-amber-950/40 text-stone-500" },
  { char: "~", label: "Lava", symbol: "🔥", cellClass: "bg-orange-600/80 text-yellow-100" },
  { char: "V", label: "Volcán", symbol: "🌋", cellClass: "bg-red-800 text-amber-200" },
  { char: "P", label: "Taber", symbol: "🧔", cellClass: "bg-amber-500 text-stone-950" },
  { char: "E", label: "Huevo", symbol: "🥚", cellClass: "bg-cyan-700 text-cyan-100" },
  { char: "B", label: "Bloque", symbol: "🪨", cellClass: "bg-stone-500 text-stone-100" },
  { char: "C", label: "Criatura", symbol: "👾", cellClass: "bg-rose-700 text-rose-100" },
  { char: "M", label: "Montículo", symbol: "⛰️", cellClass: "bg-emerald-800 text-emerald-100" },
];

const TOOL_BY_CHAR = new Map(TILE_TOOLS.map((t) => [t.char, t]));

interface LevelEditorGridProps {
  map: string[];
  selectedTool: string;
  onSelectTool: (char: string) => void;
  onChangeMap: (nextMap: string[]) => void;
}

/**
 * Replaces a single cell in the 21x14 level map, keeping only one player start ("P").
 */
function paintCell(map: string[], row: number, col: number, char: string): string[] {
  return map.map((line, r) => {
    const padded = line.padEnd(GRID_COLS, ".").slice(0, GRID_COLS);
    const chars = padded.split("");
    if (char === "P") {
      for (let c = 0; c < chars.length; c++) {
        if (chars[c] === "P") chars[c] = ".";
      }
    }
    if (r === row) chars[col] = char;
    return chars.join("");
  });
}

/**
 * Interactive tile palette and 21x14 grid canvas for editing Tabernicle Cubicle maps.
 */
export function LevelEditorGrid({
  map,
  selectedTool,
  onSelectTool,
  onChangeMap,
}: LevelEditorGridProps) {
  const [painting, setPainting] = useState(false);

  const applyAt = (row: number, col: number) => {
    onChangeMap(paintCell(map, row, col, selectedTool));
  };

  return (
    <div
      className="space-y-3"
      onPointerUp={() => setPainting(false)}
      onPointerLeave={() => setPainting(false)}
    >
      <div className="flex flex-wrap gap-1.5" role="toolbar" aria-label="Herramientas de mapa">
        {TILE_TOOLS.map((tool) => {
          const active = selectedTool === tool.char;
          return (
            <button
              key={tool.char}
              type="button"
              onClick={() => onSelectTool(tool.char)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary"
              }`}
            >
              <span aria-hidden="true">{tool.symbol}</span>
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-stone-950 p-2">
        <div
          className="grid min-w-[546px] select-none gap-0.5"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: GRID_ROWS }).map((_, r) => {
            const rowStr = (map[r] ?? "").padEnd(GRID_COLS, ".");
            return Array.from({ length: GRID_COLS }).map((__, c) => {
              const ch = rowStr[c] ?? ".";
              const tool = TOOL_BY_CHAR.get(ch) ?? TILE_TOOLS[1]!;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`Fila ${r + 1}, columna ${c + 1}: ${tool.label}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setPainting(true);
                    applyAt(r, c);
                  }}
                  onPointerEnter={() => {
                    if (painting) applyAt(r, c);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-sm text-xs leading-none transition-transform hover:scale-105 ${tool.cellClass}`}
                >
                  {tool.symbol}
                </button>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
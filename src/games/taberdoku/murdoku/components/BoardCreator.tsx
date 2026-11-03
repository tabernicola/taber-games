import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/platform/i18n";
import { useIsAdmin } from "@/platform/hooks/useIsAdmin";
import { createMurdokuBoard } from "@/games/taberdoku/murdoku/boardFunctions";
import { fetchMurdokuElements, type MurdokuElement } from "@/games/taberdoku/murdoku/logic/cases";
import { localize, type Position, type Room } from "@/games/taberdoku/murdoku/logic/game";
import { useMurdokuTheme } from "@/games/taberdoku/murdoku/hooks/useMurdokuTheme";

import "@/games/taberdoku/murdoku/light-theme.css";

const ROOM_COLORS = [
  "bg-rose-200",
  "bg-blue-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-violet-200",
  "bg-cyan-200",
  "bg-orange-200",
  "bg-lime-200",
  "bg-pink-200",
];

type RoomDraft = Omit<Room, "cells"> & { cells: Position[] };
type PlacedElement = { element: MurdokuElement; row: number; col: number };

export function BoardCreator({
  onCancel,
  onCreated,
}: {
  onCancel?: () => void;
  onCreated?: (boardId: string) => void | Promise<void>;
}) {
  const { t, slug, lang } = useI18n();
  const { user, isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  useMurdokuTheme();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [rooms, setRooms] = useState<RoomDraft[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<{ id: string } | null>(null);
  const [catalogElements, setCatalogElements] = useState<MurdokuElement[]>([]);
  const [elementsLoaded, setElementsLoaded] = useState(false);
  const [placedElements, setPlacedElements] = useState<PlacedElement[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomAtCell = useMemo(() => {
    const result = new Map<string, { room: RoomDraft; color: string }>();
    rooms.forEach((room, index) => {
      room.cells.forEach(({ row, col }) =>
        result.set(`${row},${col}`, {
          room,
          color: ROOM_COLORS[index % ROOM_COLORS.length],
        }),
      );
    });
    return result;
  }, [rooms]);
  const elementAtCell = useMemo(
    () => new Map(placedElements.map((element) => [`${element.row},${element.col}`, element])),
    [placedElements],
  );
  const assignedCells = rooms.reduce((total, room) => total + room.cells.length, 0);
  const allCellsAssigned = assignedCells === rows * cols;
  const currentRoom = rooms.find((room) => room.id === selectedRoomId);
  const layoutStarted = rooms.length > 0 || placedElements.length > 0;

  const loadCatalogElements = async () => {
    if (elementsLoaded) return;
    try {
      const elements = await fetchMurdokuElements(isAdmin);
      setCatalogElements(elements);
      setElementsLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  };

  const addRoom = () => {
    const id = `room-${crypto.randomUUID()}`;
    const room: RoomDraft = {
      id,
      name: t("boardCreator.zoneNumber", { number: rooms.length + 1 }),
      nameI18n: {},
      cells: [],
    };
    setRooms((current) => [...current, room]);
    setSelectedRoomId(id);
  };

  const assignCellToRoom = (row: number, col: number) => {
    if (!selectedRoomId) return;
    setRooms((current) =>
      current.map((room) => ({
        ...room,
        cells:
          room.id === selectedRoomId
            ? room.cells.some((cell) => cell.row === row && cell.col === col)
              ? room.cells.filter((cell) => cell.row !== row || cell.col !== col)
              : [...room.cells, { row, col }]
            : room.cells.filter((cell) => cell.row !== row || cell.col !== col),
      })),
    );
  };

  const removeRoom = (roomId: string) => {
    setRooms((current) => current.filter((room) => room.id !== roomId));
    if (selectedRoomId === roomId) setSelectedRoomId(null);
  };

  const addElementToCell = (row: number, col: number) => {
    const key = `${row},${col}`;
    if (elementAtCell.has(key)) {
      setPlacedElements((current) =>
        current.filter((element) => element.row !== row || element.col !== col),
      );
      return;
    }
    if (!selectedElement) return;
    const element = catalogElements.find((item) => item.id === selectedElement.id);
    if (element) setPlacedElements((current) => [...current, { element, row, col }]);
  };

  const saveBoard = async () => {
    if (!user || !name.trim()) return;
    const roomIdsByCell = new Map<string, string>();
    rooms.forEach((room) =>
      room.cells.forEach(({ row, col }) => roomIdsByCell.set(`${row},${col}`, room.id)),
    );
    setSaving(true);
    setError(null);
    try {
      const { boardId } = await createMurdokuBoard({
        data: {
          name: name.trim(),
          gridRows: rows,
          gridCols: cols,
          rooms: rooms.map(({ cells, ...room }) => ({ ...room, cells })),
          elements: placedElements.map((element, index) => ({
            elementId: element.element.id,
            roomId: roomIdsByCell.get(`${element.row},${element.col}`) ?? "",
            row: element.row,
            col: element.col,
            sortOrder: index,
            instanceId: crypto.randomUUID(),
          })),
        },
      });
      if (onCreated) {
        await onCreated(boardId);
      } else {
        await navigate({
          to: "/$lang/taberdoku/murdoku/create",
          params: { lang: slug },
          search: { boardId },
        });
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    if (onCancel) onCancel();
    else void navigate({ to: "/$lang/taberdoku/murdoku/create", params: { lang: slug } });
  };

  if (loading) {
    return (
      <div className="murdoku-light flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">{t("common.loading")}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="murdoku-light flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-muted-foreground">{t("creator.needsAuth")}</p>
        <Link
          to="/$lang/auth"
          params={{ lang: slug }}
          className="rounded-lg border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary"
        >
          {t("creator.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="murdoku-light min-h-screen pb-20">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={goBack}
          aria-label={t("creator.back")}
          className="text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold tracking-widest text-primary">
          {t("boardCreator.title")}
        </h1>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="flex gap-2">
          {(
            [
              "boardCreator.stepSize",
              "boardCreator.stepRooms",
              "boardCreator.stepElements",
            ] as const
          ).map((key, index) => (
            <button
              key={key}
              type="button"
              disabled={index > step}
              onClick={() => index < step && setStep(index)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                index === step
                  ? "border-primary bg-primary/10 text-primary"
                  : index < step
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border text-muted-foreground"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {step === 0 && (
          <section className="space-y-4 rounded-xl border border-border bg-background p-4">
            <label className="block space-y-2 text-sm font-semibold">
              {t("boardCreator.name")}
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                {t("creator.gridRows")}
                <select
                  value={rows}
                  onChange={(event) => setRows(Number(event.target.value))}
                  disabled={layoutStarted}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
                >
                  {[6, 7, 8, 9].map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-semibold">
                {t("creator.gridCols")}
                <select
                  value={cols}
                  onChange={(event) => setCols(Number(event.target.value))}
                  disabled={layoutStarted}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
                >
                  {[6, 7, 8, 9].map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">{t("boardCreator.sizeHint")}</p>
            {layoutStarted && (
              <p className="text-xs text-muted-foreground">{t("boardCreator.resizeLocked")}</p>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("boardCreator.roomInstruction", { assigned: assignedCells, total: rows * cols })}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {rooms.map((room, index) => (
                <div key={room.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      selectedRoomId === room.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    } ${ROOM_COLORS[index % ROOM_COLORS.length]}`}
                  >
                    {room.name} ({room.cells.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    aria-label={t("boardCreator.removeZone")}
                    className="rounded p-1 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1 rounded-lg border border-dashed border-primary px-3 py-2 text-sm text-primary"
              >
                <Plus className="h-4 w-4" /> {t("boardCreator.addZone")}
              </button>
            </div>
            {currentRoom && (
              <label className="block max-w-sm space-y-2 text-sm font-semibold">
                {t("boardCreator.zoneName")}
                <input
                  value={currentRoom.name}
                  onChange={(event) =>
                    setRooms((current) =>
                      current.map((room) =>
                        room.id === currentRoom.id ? { ...room, name: event.target.value } : room,
                      ),
                    )
                  }
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-normal"
                />
              </label>
            )}
            <div
              className="mx-auto grid max-w-2xl gap-1"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: rows * cols }, (_, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                const assignment = roomAtCell.get(`${row},${col}`);
                return (
                  <button
                    key={`${row},${col}`}
                    type="button"
                    onClick={() => assignCellToRoom(row, col)}
                    aria-label={t("boardCreator.cellPosition", { row: row + 1, col: col + 1 })}
                    className={`aspect-square rounded border border-border text-xs ${
                      assignment?.color ?? "bg-background"
                    } ${selectedRoomId && assignment?.room.id === selectedRoomId ? "ring-2 ring-primary" : ""}`}
                  >
                    {assignment?.room.name.slice(0, 2) ?? "·"}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("boardCreator.elementInstruction")}</p>
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <h2 className="text-sm font-semibold">{t("boardCreator.catalogElements")}</h2>
              <select
                value={selectedElement?.id ?? ""}
                onFocus={() => void loadCatalogElements()}
                onChange={(event) =>
                  setSelectedElement(event.target.value ? { id: event.target.value } : null)
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t("boardCreator.selectElement")}</option>
                {catalogElements.map((element) => (
                  <option key={element.id} value={element.id}>
                    {element.icon} {localize(element.name, element.nameI18n, lang)}
                  </option>
                ))}
              </select>
              {isAdmin && (
                <p className="text-xs text-muted-foreground">
                  {t("boardCreator.adminPrivateElements")}
                </p>
              )}
            </div>
            <div
              className="mx-auto grid max-w-2xl gap-1"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: rows * cols }, (_, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                const assignment = roomAtCell.get(`${row},${col}`);
                const element = elementAtCell.get(`${row},${col}`);
                const icon = element?.element.icon;
                return (
                  <button
                    key={`${row},${col}`}
                    type="button"
                    onClick={() => addElementToCell(row, col)}
                    aria-label={t("boardCreator.cellPosition", { row: row + 1, col: col + 1 })}
                    className={`aspect-square rounded border border-border text-2xl ${
                      assignment?.color ?? "bg-background"
                    }`}
                  >
                    {icon ?? ""}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold"
            >
              {t("creator.back")}
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              disabled={
                step === 0
                  ? !name.trim()
                  : !allCellsAssigned ||
                    rooms.some((room) => !room.name.trim() || !room.cells.length)
              }
              onClick={() => {
                setError(null);
                if (step === 1) {
                  setStep(2);
                  void loadCatalogElements();
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex-1 rounded-lg border border-secondary bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary disabled:opacity-50"
            >
              {t("creator.next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveBoard()}
              className="flex-1 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50"
            >
              {saving ? t("boardCreator.saving") : t("boardCreator.save")}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

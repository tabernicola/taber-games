import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CaseContent, MurdokuCase, CaseStatus, Room, LocalizedText } from "./game";

export type { MurdokuCase };

type Row = Tables<"murdoku_playable_cases">;

export interface Board {
  id: string;
  slug: string;
  name: string;
  nameI18n?: LocalizedText;
  gridRows: number;
  gridCols: number;
  rooms: Room[];
}

export interface BoardElement {
  instanceId: string | null;
  elementId: string;
  roomId: string;
  row: number;
  col: number;
  sortOrder: number;
  name: string;
  nameI18n?: LocalizedText;
  icon: string;
  image?: string;
  walkable: boolean;
}

export async function fetchBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from("murdoku_boards")
    .select("id, slug, name, name_i18n, grid_rows, grid_cols, rooms")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameI18n: (row.name_i18n ?? undefined) as LocalizedText | undefined,
    gridRows: row.grid_rows,
    gridCols: row.grid_cols,
    rooms: Array.isArray(row.rooms) ? (row.rooms as unknown as Room[]) : [],
  }));
}

export async function fetchBoardElements(boardId: string): Promise<BoardElement[]> {
  const { data: beRows, error: beError } = await supabase
    .from("murdoku_board_elements")
    .select("element_id, instance_id, room_id, row_index, col_index, sort_order")
    .eq("board_id", boardId)
    .order("sort_order", { ascending: true });
  if (beError) throw beError;
  if (!beRows || beRows.length === 0) return [];

  const elementIds = Array.from(new Set(beRows.map((r) => r.element_id)));
  const { data: elRows, error: elError } = await supabase
    .from("murdoku_elements")
    .select("id, name, name_i18n, icon, image, walkable")
    .in("id", elementIds);
  if (elError) throw elError;

  return beRows.map((be) => {
    const e = (elRows ?? []).find((el) => el.id === be.element_id);
    return {
      instanceId: be.instance_id ?? null,
      elementId: be.element_id,
      roomId: be.room_id,
      row: be.row_index,
      col: be.col_index,
      sortOrder: be.sort_order,
      name: e?.name ?? "",
      nameI18n: (e?.name_i18n ?? undefined) as LocalizedText | undefined,
      icon: e?.icon ?? "",
      image: e?.image ?? undefined,
      walkable: e?.walkable ?? true,
    };
  });
}

export function attachElementsToRooms(rooms: Room[], elements: BoardElement[]): Room[] {
  const byRoom = new Map<string, BoardElement[]>();
  for (const el of elements) {
    const arr = byRoom.get(el.roomId) ?? [];
    arr.push(el);
    byRoom.set(el.roomId, arr);
  }
  return rooms.map((room) => {
    const els = byRoom.get(room.id) ?? [];
    return {
      ...room,
      elements: els.map((el) => ({
        id: el.instanceId ?? undefined,
        name: el.name,
        nameI18n: el.nameI18n,
        icon: el.icon,
        image: el.image,
        position: { row: el.row, col: el.col },
        walkable: el.walkable,
      })),
    };
  });
}

function toCase(row: Row): MurdokuCase {
  if (!row?.id || !row?.title) {
    throw new Error("Incomplete Murdoku case");
  }
  const raw = row.content as unknown;
  if (!raw || typeof raw !== "object") {
    throw new Error("Incomplete Murdoku case");
  }
  const content = { ...(raw as any) };
  if (!Array.isArray(content.rooms)) content.rooms = [];
  if (!Array.isArray(content.characters)) content.characters = [];
  if (!Array.isArray(content.clues)) content.clues = [];
  if (!content.solution) content.solution = { killerId: "", placements: [] };
  if (typeof content.gridRows !== "number") content.gridRows = 0;
  if (typeof content.gridCols !== "number") content.gridCols = 0;
  const image = (row as any).image ?? content.image ?? null;
  content.image = image;
  return {
    id: row.id,
    title: row.title,
    titleI18n: row.title_i18n as MurdokuCase["titleI18n"] | undefined,
    creator_id: (row as any).creator_id ?? null,
    status: ((row as any).status ?? "draft") as CaseStatus,
    content: content as CaseContent,
    rejection_note: (row as any).rejection_note ?? null,
    created_at: (row as any).created_at ?? "",
    updated_at: (row as any).updated_at ?? "",
    board_id: (row as any).board_id ?? null,
    image,
  };
}

export async function fetchApprovedCases(): Promise<MurdokuCase[]> {
  const { data, error } = await supabase
    .from("murdoku_playable_cases")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toCase);
}

export async function fetchCase(id: string): Promise<MurdokuCase | null> {
  const { data, error } = await supabase
    .from("murdoku_playable_cases")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if ((error as { code?: string }).code === "PGRST116") return null;
    throw error;
  }
  return toCase(data);
}

export async function fetchPendingCases(): Promise<MurdokuCase[]> {
  const { data, error } = await supabase
    .from("murdoku_playable_cases")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toCase);
}

export async function submitCase(params: {
  title: string;
  creatorId: string;
  content: CaseContent;
  status?: CaseStatus;
}): Promise<MurdokuCase> {
  const { data, error } = await supabase
    .from("murdoku_cases")
    .insert({
      title: params.title,
      creator_id: params.creatorId,
      content: params.content as unknown as never,
      status: params.status ?? "pending_review",
    })
    .select()
    .single();
  if (error) throw error;
  return toCase(data);
}

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CaseContent, MurdokuCase, CaseStatus } from "./game";

export type { MurdokuCase };

type Row = Tables<"murdoku_playable_cases">;

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
  const { data, error } = await supabase.from("murdoku_playable_cases").select("*").eq("id", id).single();
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

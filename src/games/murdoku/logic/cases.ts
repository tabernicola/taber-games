import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { CaseContent, MurdokuCase, CaseStatus } from "./game";

export type { MurdokuCase };

type Row = Tables<"murdoku_cases">;

function toCase(row: Row): MurdokuCase {
  return {
    ...row,
    content: row.content as unknown as CaseContent,
  };
}

export async function fetchApprovedCases(): Promise<MurdokuCase[]> {
  const { data, error } = await supabase
    .from("murdoku_cases")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toCase);
}

export async function fetchCase(id: string): Promise<MurdokuCase | null> {
  const { data, error } = await supabase.from("murdoku_cases").select("*").eq("id", id).single();
  if (error) {
    if ((error as { code?: string }).code === "PGRST116") return null;
    throw error;
  }
  return toCase(data);
}

export async function fetchPendingCases(): Promise<MurdokuCase[]> {
  const { data, error } = await supabase
    .from("murdoku_cases")
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

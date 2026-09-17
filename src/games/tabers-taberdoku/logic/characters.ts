import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface MurdokuCharacter {
  id: string;
  name: string;
  image?: string;
  description: Record<string, string>;
}

type Row = Tables<"murdoku_characters">;

export async function fetchSuspects(): Promise<MurdokuCharacter[]> {
  const { data, error } = await supabase
    .from("murdoku_characters")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    image: row.image ?? undefined,
    description: row.description as Record<string, string>,
  }));
}

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface Character {
  id: string;
  name: string;
  image?: string;
  description: Record<string, string>;
}

type Row = Tables<"murdoku_characters">;

export const charactersQueryKey = ["characters"] as const;

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from("murdoku_characters")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: Row) => ({
    id: row.id,
    name: row.name,
    image: row.image ?? undefined,
    description: row.description as Record<string, string>,
  }));
}

/** Picks the description for the active language, falling back to any available one. */
export function characterDescription(character: Character, lang: string): string {
  return character.description[lang] ?? Object.values(character.description)[0] ?? "";
}

import { supabase } from "./supabase";
export type HomepageSection = { section_key: string; is_visible: boolean; sort_order: number };
export async function getHomepageSections(): Promise<HomepageSection[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("homepage_sections").select("section_key,is_visible,sort_order").order("sort_order");
    if (error || !Array.isArray(data) || !data.length) return null;
    return data as HomepageSection[];
  } catch { return null; }
}

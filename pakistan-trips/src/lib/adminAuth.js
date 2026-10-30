import { supabase } from "./supabase";

/**
 * Confirms CMS membership using the protected tour_cms_admins table.
 * This is intentionally separate from user-editable auth metadata.
 */
export async function isCmsAdmin(userId) {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!userId) return false;

  const { data, error } = await supabase
    .from("tour_cms_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data?.user_id);
}

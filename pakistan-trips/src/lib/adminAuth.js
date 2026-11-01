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
  if (data?.user_id) return true;

  // Active team members may sign in; their table access remains constrained by RLS permissions.
  const { data: member, error: memberError } = await supabase
    .from("team_members")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "team_member")
    .eq("status", "active")
    .maybeSingle();
  if (memberError) throw memberError;
  return Boolean(member?.user_id);
}

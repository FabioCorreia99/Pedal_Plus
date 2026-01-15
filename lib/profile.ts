import { supabase } from "./supabase";

export async function getMyProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      username,
      full_name,
      bio,
      gender,
      birthday,
      website_link,
      avatar_url,
      total_points,
      current_level_id,
      levels (
        level_number,
        title,
        xp_required
      )
    `
    )
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data;
}

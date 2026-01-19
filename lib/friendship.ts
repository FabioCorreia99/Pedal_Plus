import { supabase } from "@/lib/supabase";

export async function getFriendshipStatus(
  myUserId: string,
  targetUserId: string,
): Promise<"none" | "pending" | "accepted"> {
  const { data, error } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(user_id.eq.${myUserId},friend_id.eq.${targetUserId}),
       and(user_id.eq.${targetUserId},friend_id.eq.${myUserId})`,
    )
    .maybeSingle();

  if (error || !data) return "none";

  return data.status;
}

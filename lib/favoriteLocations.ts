import type { FavoriteLocation } from "@/types/favorites";
import { supabase } from "./supabase";

export async function getFavoriteLocations(): Promise<FavoriteLocation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("favorite_locations")
    .select("id, name, latitude, longitude, category")
    .eq("user_id", user.id);

  if (error) {
    console.error("getFavoriteLocations error:", error);
    return [];
  }

  return (data ?? []) as FavoriteLocation[];
}

export async function addFavoriteLocation(input: {
  name: string;
  latitude: number;
  longitude: number;
  category: "home" | "work" | "favorite";
}): Promise<FavoriteLocation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Garante que só existe UMA casa / trabalho
  if (input.category === "home" || input.category === "work") {
    await supabase
      .from("favorite_locations")
      .delete()
      .eq("user_id", user.id)
      .eq("category", input.category);
  }

  const { data, error } = await supabase
    .from("favorite_locations")
    .insert({
      user_id: user.id,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      category: input.category,
    })
    .select()
    .single();

  if (error || !data) {
    throw error;
  }

  return data as FavoriteLocation;
}

export async function removeFavoriteLocation(id: string) {
  const { error } = await supabase
    .from("favorite_locations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao remover favorito:", error);
    throw error;
  }
}

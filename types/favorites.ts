export type FavoriteCategory = "home" | "work" | "favorite";

export type FavoriteLocation = {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  category: FavoriteCategory;
};

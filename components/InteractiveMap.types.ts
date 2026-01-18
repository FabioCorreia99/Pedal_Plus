export type FavoriteMapLocation = {
  latitude: number;
  longitude: number;
  category: "home" | "work" | "favorite";
};

export interface InteractiveMapProps {
  zoom?: number;
  showRoute?: boolean;
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  currentPosition?: { latitude: number; longitude: number };
  mapPaddingBottom?: number;
  routeCoordinates?: { latitude: number; longitude: number }[];
  isNavigating?: boolean;
  userHeading?: number;

  favoriteLocations?: FavoriteMapLocation[];
}

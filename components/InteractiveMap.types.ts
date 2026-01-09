import { LatLng } from "react-native-maps";

export interface InteractiveMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
  showRoute?: boolean;
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  currentPosition?: { latitude: number; longitude: number };
  mapPaddingBottom?: number;
  routeCoordinates?: LatLng[];
  isNavigating?: boolean;
  userHeading?: number; // direction user is facing
}
import polyline from '@mapbox/polyline';

type LatLng = { latitude: number; longitude: number };

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export type RideMode = 'Sport' | 'Tourist' | 'Safest';
type TravelMode = 'BICYCLE' | 'DRIVE';

function getTravelMode(mode: RideMode): TravelMode {
  return mode === 'Sport' ? 'DRIVE' : 'BICYCLE';
}

// Optional: only add modifiers when they are valid for the selected travel mode.
function getRouteModifiers(mode: RideMode, travelMode: TravelMode) {
  if (travelMode !== 'DRIVE') return undefined;

  if (mode === 'Sport') {
    return { avoidTolls: true, avoidHighways: true };
  }

  return undefined;
}

export async function fetchBikeRoute(
  origin: LatLng,
  destination: LatLng,
  apiKey: string,
  mode: RideMode
): Promise<{ coords: LatLng[]; distanceMeters?: number; duration?: string }> {
  const travelMode = getTravelMode(mode);
  console.log(travelMode);
  const routeModifiers = getRouteModifiers(mode, travelMode);
  console.log(routeModifiers);

  const body: any = {
    origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
    destination: { location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } } },
    travelMode,
    polylineQuality: 'OVERVIEW',
    polylineEncoding: 'ENCODED_POLYLINE',
  };

  if (routeModifiers) body.routeModifiers = routeModifiers;

  const res = await fetch(ROUTES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // Field masks are required. [page:0]
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Routes API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const route = data?.routes?.[0];
  const encoded: string | undefined = route?.polyline?.encodedPolyline;

  if (!encoded) return { coords: [] };

  const coords = polyline.decode(encoded).map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return { coords, distanceMeters: route.distanceMeters, duration: route.duration };
}

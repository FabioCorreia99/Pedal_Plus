import polyline from '@mapbox/polyline';

type LatLng = { latitude: number; longitude: number };

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export type RideMode = 'Sport' | 'Turista' | 'Seguro';
type TravelMode = 'BICYCLE' | 'DRIVE';

export interface NavigationStep {
  instruction: string;
  maneuver: string;
  distanceMeters: number;
  startLocation: LatLng;
  endLocation: LatLng;
}

function getTravelMode(mode: RideMode): TravelMode {
  return mode === 'Sport' ? 'DRIVE' : 'BICYCLE';
}

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
): Promise<{
  coords: LatLng[];
  distanceMeters?: number;
  duration?: string;
  steps: NavigationStep[];
}> {
  const travelMode = getTravelMode(mode);
  const routeModifiers = getRouteModifiers(mode, travelMode);

  const body: any = {
    origin: { location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } } },
    destination: {
      location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } },
    },
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
      'X-Goog-FieldMask':
        'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,' +
        'routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,' +
        'routes.legs.steps.startLocation,routes.legs.steps.endLocation',
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

  if (!encoded) return { coords: [], steps: [] };

  const coords = polyline.decode(encoded).map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  const steps: NavigationStep[] = [];
  if (route?.legs) {
    for (const leg of route.legs) {
      if (leg.steps) {
        for (const step of leg.steps) {
          steps.push({
            instruction: step.navigationInstruction?.instructions || 'Continue',
            maneuver: step.navigationInstruction?.maneuver || 'STRAIGHT',
            distanceMeters: step.distanceMeters || 0,
            startLocation: {
              latitude: step.startLocation?.latLng?.latitude || 0,
              longitude: step.startLocation?.latLng?.longitude || 0,
            },
            endLocation: {
              latitude: step.endLocation?.latLng?.latitude || 0,
              longitude: step.endLocation?.latLng?.longitude || 0,
            },
          });
        }
      }
    }
  }

  return {
    coords,
    distanceMeters: route.distanceMeters,
    duration: route.duration,
    steps,
  };
}

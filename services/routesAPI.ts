import polyline from '@mapbox/polyline';

type LatLng = { latitude: number; longitude: number };

const ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export async function fetchFastestBikeRoute(
  origin: LatLng,
  destination: LatLng,
  apiKey: string
): Promise<{ coords: LatLng[]; distanceMeters?: number; duration?: string }> {
  const res = await fetch(ROUTES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      // Field mask is REQUIRED, and this is the minimal set you need for drawing + basic UI. [page:0]
      'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
    },
    body: JSON.stringify({
      origin: {
        location: { latLng: { latitude: origin.latitude, longitude: origin.longitude } },
      },
      destination: {
        location: { latLng: { latitude: destination.latitude, longitude: destination.longitude } },
      },
      travelMode: 'BICYCLE',
      polylineQuality: 'OVERVIEW',
      polylineEncoding: 'ENCODED_POLYLINE',
    }),
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

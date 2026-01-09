import { NavigationStep } from './routesAPI';

type LatLng = { latitude: number; longitude: number };

export function haversine(a: LatLng, b: LatLng) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(s));
}

export function closestIndex(pos: LatLng, line: LatLng[]) {
  let bestI = 0;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < line.length; i++) {
    const d = haversine(pos, line[i]);
    if (d < bestD) {
      bestD = d;
      bestI = i;
    }
  }
  return bestI;
}

export function remainingDistanceMeters(pos: LatLng, line: LatLng[]) {
  if (line.length < 2) return 0;
  const i0 = closestIndex(pos, line);
  let sum = 0;
  for (let i = i0; i < line.length - 1; i++) {
    sum += haversine(line[i], line[i + 1]);
  }
  return sum;
}

// Find which step the user is currently on
export function getCurrentStep(
  currentPosition: LatLng,
  steps: NavigationStep[]
): { step: NavigationStep; index: number; distanceToEnd: number } | null {
  if (steps.length === 0) return null;

  let closestStepIndex = 0;
  let minDist = Number.POSITIVE_INFINITY;

  // Find the closest step by checking distance to step's start location
  for (let i = 0; i < steps.length; i++) {
    const distToStart = haversine(currentPosition, steps[i].startLocation);
    const distToEnd = haversine(currentPosition, steps[i].endLocation);
    const minDistToStep = Math.min(distToStart, distToEnd);

    if (minDistToStep < minDist) {
      minDist = minDistToStep;
      closestStepIndex = i;
    }
  }

  const step = steps[closestStepIndex];
  const distanceToEnd = haversine(currentPosition, step.endLocation);

  return { step, index: closestStepIndex, distanceToEnd };
}

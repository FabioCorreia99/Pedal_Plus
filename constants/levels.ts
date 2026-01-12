export function getUserLevel(ecoPoints: number): number {
  if (ecoPoints >= 2000) return 5;
  if (ecoPoints >= 1200) return 4;
  if (ecoPoints >= 700) return 3;
  if (ecoPoints >= 300) return 2;
  return 1;
}

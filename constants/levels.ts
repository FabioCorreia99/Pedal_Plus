export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 80, title: "Explorer" },
  { level: 3, xpRequired: 200, title: "Adventurer" },
  { level: 4, xpRequired: 400, title: "Route Master" },
  { level: 5, xpRequired: 700, title: "Local Legend" }, // KING
];

const MAX_LEVEL = 5;

/**
 * Devolve o nível do utilizador com base no XP total.
 * - Nunca passa do nível 5
 * - XP a mais continua a acumular, mas o nível fica fixo
 */
export function getLevelFromXp(xp?: number | null): number {
  if (!xp || xp <= 0) {
    return 1;
  }

  const level =
    [...LEVELS].reverse().find((l) => xp >= l.xpRequired)?.level ?? 1;

  return Math.min(level, MAX_LEVEL);
}

/**
 * Percentagem de progresso para o próximo nível
 * - No nível máximo devolve sempre 100%
 */
export function getLevelProgress(xp?: number | null): number {
  if (!xp || xp <= 0) return 0;

  const currentLevel = getLevelFromXp(xp);

  if (currentLevel >= MAX_LEVEL) {
    return 100;
  }

  const current = LEVELS.find((l) => l.level === currentLevel)!;
  const next = LEVELS.find((l) => l.level === currentLevel + 1)!;

  const progress =
    ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100;

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

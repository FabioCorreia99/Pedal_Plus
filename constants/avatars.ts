export const AVATARS: Record<number, any> = {
  1: require("../assets/avatars/level1.png"),
  2: require("../assets/avatars/level2.png"),
  3: require("../assets/avatars/level3.png"),
  4: require("../assets/avatars/level4.png"),
  5: require("../assets/avatars/king.png"), // fim
};

export function getAvatarForLevel(level: number) {
  return AVATARS[level] ?? AVATARS[1];
}

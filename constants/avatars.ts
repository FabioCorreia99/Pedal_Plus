export const AVATARS_BY_LEVEL: Record<number, any> = {
  1: require("../assets/avatars/level1.png"),
  2: require("../assets/avatars/level2.png"),
  3: require("../assets/avatars/level3.png"),
  4: require("../assets/avatars/level4.png"),
  5: require("../assets/avatars/level5.png"),
};

export function getAvatarByLevel(level: number) {
  return AVATARS_BY_LEVEL[level] ?? AVATARS_BY_LEVEL[1];
}

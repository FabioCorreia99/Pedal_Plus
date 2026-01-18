import { supabase } from "../lib/supabase";

/* ---------- CONSTANTES ---------- */

const CO2_SAVED_PER_KM = 0.12; // kg CO₂
const ECOPOINTS_PER_KG_CO2 = 100;

/* ---------- BADGES DEFINIÇÃO ---------- */

const BADGE_RULES = [
  {
    id: 1,
    check: ({ totalActivities }: Stats) => totalActivities >= 1,
  },
  {
    id: 2,
    check: ({ totalActivities }: Stats) => totalActivities >= 10,
  },
  {
    id: 3,
    check: ({ totalKm }: Stats) => totalKm >= 50,
  },
  {
    id: 4,
    check: ({ totalKm }: Stats) => totalKm >= 100,
  },
];

type Stats = {
  totalActivities: number;
  totalKm: number;
};

/* ---------- FUNÇÃO PRINCIPAL ---------- */

export async function processActivityRewards(
  userId: string,
  distanceKm: number,
) {
  /* CO2 + ECOPOINTS */

  const co2SavedKg = distanceKm * CO2_SAVED_PER_KM;
  const ecoPointsEarned = Math.round(co2SavedKg * ECOPOINTS_PER_KG_CO2);

  /* STATS DO USER */

  const [{ count: totalActivities }, { data: kmData }] = await Promise.all([
    supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),

    supabase.from("activities").select("distance_km").eq("user_id", userId),
  ]);

  const totalKm =
    kmData?.reduce((sum, a) => sum + (a.distance_km ?? 0), 0) ?? 0;

  const stats: Stats = {
    totalActivities: totalActivities ?? 0,
    totalKm,
  };

  /* BADGES JÁ DESBLOQUEADOS */

  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const ownedBadgeIds = new Set(existingBadges?.map((b) => b.badge_id));

  /* NOVOS BADGES */

  const newBadges = BADGE_RULES.filter(
    (badge) => badge.check(stats) && !ownedBadgeIds.has(badge.id),
  );

  if (newBadges.length) {
    await supabase.from("user_badges").insert(
      newBadges.map((b) => ({
        user_id: userId,
        badge_id: b.id,
      })),
    );
  }

  /* ATUALIZAR ECOPOINTS */

  await supabase.rpc("increment_eco_points", {
    p_user_id: userId,
    p_amount: ecoPointsEarned,
  });

  return {
    ecoPointsEarned,
    co2SavedKg,
    unlockedBadges: newBadges.map((b) => b.id),
  };
}

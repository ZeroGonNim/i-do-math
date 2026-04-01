export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 50,   // level 1 → 2: 50별
  2: 150,  // level 2 → 3: 150별
  3: 300,  // level 3 → 4: 300별
  4: 500,  // level 4 → 5: 500별
}

export function calcLevel(totalStars: number): number {
  let level = 1
  for (const [lv, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (totalStars >= threshold) level = Number(lv) + 1
  }
  return Math.min(level, 5)
}

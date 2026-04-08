/**
 * O(1) 레벨 계산.
 * 공식: 레벨 N → N+1에 필요한 XP = N × 100
 * 누적 XP(레벨 N) = N × (N-1) / 2 × 100
 * 역산: N = floor((1 + sqrt(1 + 4 * totalXP / 50)) / 2)
 */
export function calcLevel(totalXP: number): number {
  if (totalXP <= 0) return 1
  const level = Math.floor((1 + Math.sqrt(1 + 4 * totalXP / 50)) / 2)
  return Math.min(level, 50)
}

/**
 * 현재 레벨에서 다음 레벨까지 필요한 XP.
 */
export function xpForNextLevel(level: number): number {
  return level * 100
}

/**
 * 현재 레벨 내 진행도 (0~1).
 * 홈 화면 XP 바 표시용.
 */
export function levelProgress(totalXP: number): number {
  const level = calcLevel(totalXP)
  if (level >= 50) return 1
  const xpAtLevel = (level * (level - 1)) / 2 * 100
  const needed = xpForNextLevel(level)
  return Math.min((totalXP - xpAtLevel) / needed, 1)
}

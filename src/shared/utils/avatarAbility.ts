import type { AvatarId } from '@/types/avatar'

interface AvatarAbilityContext {
  isCorrect: boolean
  hintUsed: boolean
  noDropStreak: number   // proxy for consecutive corrects
}

interface AvatarAbilityResult {
  /** 오답 시에도 지급할 추가 XP (전사 +2) */
  wrongXpBonus: number
  /** 정답 XP에 곱할 배수 (암살자 ×2) */
  xpMultiplier: number
  /** true면 힌트 사용 페널티 무시 (마법사) */
  ignoreHintPenalty: boolean
  /** 박스 드롭 확률에 더할 보너스율 (로봇 +0.05) */
  boxBonusRate: number
}

export function getAvatarAbility(
  avatarId: AvatarId | undefined,
  ctx: AvatarAbilityContext
): AvatarAbilityResult {
  const result: AvatarAbilityResult = {
    wrongXpBonus: 0,
    xpMultiplier: 1,
    ignoreHintPenalty: false,
    boxBonusRate: 0,
  }

  switch (avatarId) {
    case 'warrior':
      if (!ctx.isCorrect) result.wrongXpBonus = 2
      break
    case 'mage':
      if (ctx.hintUsed) result.ignoreHintPenalty = true
      break
    case 'assassin':
      // 연속 정답 2회 이상(noDropStreak ≥ 2)이면 XP 두 배
      if (ctx.isCorrect && ctx.noDropStreak >= 2) result.xpMultiplier = 2
      break
    case 'robot':
      result.boxBonusRate = 0.05
      break
  }

  return result
}

import type { AvatarId } from './avatar'

export type CharacterId = 'char-01' | 'char-02' | 'char-03' | 'char-04' // @deprecated → avatarId 사용

export const LEVEL_TITLES: Record<number, string> = {
  1: '수학 새싹',
  2: '수학 탐험가',
  3: '수학 용사',
  4: '수학 마법사',
  5: '수학 전설',
}

export interface UserProfile {
  userId: string
  displayName: string
  grade: number
  characterId: CharacterId    // @deprecated → avatarId 사용
  avatarId: AvatarId          // 현재 장착 아바타
  unlockedAvatars: AvatarId[] // 해금된 아바타 목록
  level: number
  totalStars: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string        // 'YYYY-MM-DD'
  parentalPinHash: string | null
  parentalPinSalt: string | null
  createdAt: number
  missionDate: string          // 'YYYY-MM-DD'
  missionProblemsSolved: number
  missionWrongReviewed: boolean
  unlockedDifficulty: 'basic' | 'applied' | 'challenge'
  boxCount: number
  pittyCount: number
  // Phase B: XP 시스템 (version 4 마이그레이션으로 기본값 0)
  totalXP: number
  noDropStreak: number           // 천장 카운터: 박스 미드롭 연속 정답 수
  duplicateBuff?: {              // 중복 아이템 보상 버프
    remaining: number            // 남은 적용 문제 수 (최대 3)
    bonusRate: number            // 드롭 확률 보너스 (0.05 = +5%)
  }
}

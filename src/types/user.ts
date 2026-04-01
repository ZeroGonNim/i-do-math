export type CharacterId = 'char-01' | 'char-02' | 'char-03' | 'char-04'

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
  characterId: CharacterId
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
  unlockedDifficulty: 'basic' | 'applied'
}

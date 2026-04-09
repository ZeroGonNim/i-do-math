import { describe, it, expect } from 'vitest'
import { canUnlockNextDifficulty } from '../difficultyUnlock'
import type { LearningLog } from '@/types/learningLog'

const makeLog = (isCorrect: boolean): LearningLog => ({
  logId: 'x',
  userId: 'u',
  grade: 4,
  problemId: 'p',
  concept: 'c',
  difficulty: 'basic',
  mistakeType: null,
  isCorrect,
  userAnswer: { numerator: 1, denominator: 1 },
  timeSpent: 20,
  hintUsed: false,
  retryCount: 0,
  timestamp: Date.now(),
})

describe('canUnlockNextDifficulty', () => {
  it('returns false when fewer than 15 problems solved', () => {
    const logs = Array(10).fill(makeLog(true)) as LearningLog[]
    expect(canUnlockNextDifficulty(logs)).toBe(false)
  })

  it('returns false when accuracy < 70%', () => {
    const logs = [
      ...(Array(10).fill(makeLog(true)) as LearningLog[]),
      ...(Array(10).fill(makeLog(false)) as LearningLog[]),
    ]
    expect(canUnlockNextDifficulty(logs)).toBe(false)
  })

  it('returns false when recent 5 have fewer than 4 correct', () => {
    const logs = [
      ...(Array(15).fill(makeLog(true)) as LearningLog[]),
      ...(Array(5).fill(makeLog(false)) as LearningLog[]),
    ]
    expect(canUnlockNextDifficulty(logs)).toBe(false)
  })

  it('returns true when all conditions met', () => {
    const logs = Array(20).fill(makeLog(true)) as LearningLog[]
    expect(canUnlockNextDifficulty(logs)).toBe(true)
  })
})

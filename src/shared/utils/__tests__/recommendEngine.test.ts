import { describe, it, expect } from 'vitest'
import { selectRecommendedProblem } from '../recommendEngine'
import type { Problem } from '@/types/problem'

const makeProblem = (id: string, difficulty: 'basic' | 'applied' | 'challenge', concept: string): Problem => ({
  id, grade: 4, semester: 1, unit: '분수', subUnit: '',
  type: 'calculation', difficulty, concept,
  skills: ['numerator_add'], mistakeTypes: ['denominator_error'],
  question: 'Q', answer: { numerator: 1, denominator: 2 },
  steps: [], animationAsset: '', conceptExplanation: '',
})

const pool = [
  makeProblem('b1', 'basic', 'fraction_add'),
  makeProblem('b2', 'basic', 'fraction_add'),
  makeProblem('a1', 'applied', 'fraction_add'),
]

describe('selectRecommendedProblem', () => {
  it('prefers lower difficulty on wrong answer', () => {
    const result = selectRecommendedProblem({
      concept: 'fraction_add',
      currentDifficulty: 'applied',
      currentId: 'a1',
      isCorrect: false,
      recentIds: [],
      pool,
    })
    expect(result?.difficulty).toBe('basic')
  })

  it('falls back to any available when lower difficulty is all recent', () => {
    // b1, b2(basic)가 recent, a1이 currentId이므로 pool 전체가 exclude
    // fallback: safe zone(최근 10개 보호) 후 전체 pool에서 뽑음 → b2가 반환될 수 있음
    const result = selectRecommendedProblem({
      concept: 'fraction_add',
      currentDifficulty: 'applied',
      currentId: 'a1',
      isCorrect: false,
      recentIds: ['b1', 'b2'],
      pool,
    })
    // recentIds가 2개뿐이라 safeZone=2 → b1,b2,a1 모두 제외 → 빈 배열 → 최후 fallback: currentId(a1)만 제외
    expect(result).not.toBeNull()
  })

  it('returns null when no problem available (empty pool)', () => {
    const result = selectRecommendedProblem({
      concept: 'unknown_concept',
      currentDifficulty: 'basic',
      currentId: 'x',
      isCorrect: false,
      recentIds: [],
      pool: [],
    })
    expect(result).toBeNull()
  })
})

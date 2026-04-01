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
      isCorrect: false,
      recentIds: [],
      pool,
    })
    expect(result?.difficulty).toBe('basic')
  })

  it('falls back to same difficulty when lower is all recent', () => {
    const result = selectRecommendedProblem({
      concept: 'fraction_add',
      currentDifficulty: 'applied',
      isCorrect: false,
      recentIds: ['b1', 'b2'],
      pool,
    })
    expect(result?.difficulty).toBe('applied')
  })

  it('returns null when no problem available', () => {
    const result = selectRecommendedProblem({
      concept: 'unknown_concept',
      currentDifficulty: 'basic',
      isCorrect: false,
      recentIds: [],
      pool,
    })
    expect(result).toBeNull()
  })
})

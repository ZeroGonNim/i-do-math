import { describe, it, expect } from 'vitest'
import { selectRecommendedProblem } from '../recommendEngine'
import { classifyMistake } from '../mistakeClassifier'
import type { Problem } from '@/types/problem'

const makeProblem = (id: string, difficulty: any, concept: string, skills: string[] = []): Problem => ({
  id, grade: 6, semester: 1, unit: '나눗셈', subUnit: '',
  type: 'calculation', difficulty, concept,
  skills, mistakeTypes: [],
  question: 'Q', answer: { value: 100 },
  steps: [], conceptExplanation: '',
  animationAsset: '',
})

describe('Advanced Recommend Engine (Skills Similarity)', () => {
  const pool = [
    makeProblem('p1', 'basic', 'concept_A', ['division']), // 1개 겹침
    makeProblem('p2', 'basic', 'concept_B', ['multiplication']), // 0개 겹침
    makeProblem('p3', 'basic', 'concept_C', ['division', 'fraction']), // 2개 모두 겹침 (Perfect Match)
  ]

  it('prioritizes high skill similarity when concept differs', () => {
    const result = selectRecommendedProblem({
      unit: '나눗셈',
      concept: 'concept_X', // pool에 concept_X 없음 -> Unit 검색으로 넘어감
      currentDifficulty: 'basic',
      currentId: 'p0',
      isCorrect: true,
      recentIds: [],
      pool,
    })
    // p3가 p2보다 유사도가 높음 (division, fraction 2개 겹침 vs division 1개)
    expect(result?.id).toBe('p3')
  })
})

describe('Advanced Mistake Classifier', () => {
  it('detects precision_error (10x difference) for integers', () => {
    const correct = { value: 100 }
    const wrong = { value: 10 }
    expect(classifyMistake('calculation', correct, wrong, 10)).toBe('precision_error')
  })

  it('detects precision_error for decimal-like text answers', () => {
    const correct = { text: '12.5' }
    const wrong = { text: '1.25' }
    expect(classifyMistake('calculation', correct, wrong as any, 10)).toBe('precision_error')
  })

  it('detects calculation_error for other numerical differences', () => {
    const correct = { value: 100 }
    const wrong = { value: 99 }
    expect(classifyMistake('calculation', correct, wrong, 10)).toBe('calculation_error')
  })
})

import { describe, it, expect } from 'vitest'
import { generateFromTemplate } from '../problemGenerator'
import type { ProblemTemplate } from '@/types/problem'

const template: ProblemTemplate = {
  templateId: 'tpl-001',
  grade: 4, semester: 1, unit: '분수',
  type: 'calculation', difficulty: 'basic',
  concept: 'fraction_add_same_denominator',
  skills: ['numerator_add'], mistakeTypes: ['denominator_error'],
  template: '{a}/{b} + {c}/{b} = ?',
  variables: { a: [1, 2, 3], b: [5, 6, 7], c: [1, 2] },
  constraints: ['a + c < b'],
  animationAsset: 'test.lottie',
  conceptExplanation: '분자끼리 더하세요',
}

describe('generateFromTemplate', () => {
  it('generates a problem satisfying constraints', () => {
    const problem = generateFromTemplate(template, 'user-1', 0)
    const parts = problem.question.match(/(\d+)\/(\d+) \+ (\d+)\/(\d+)/)!
    const a = parseInt(parts[1])
    const b = parseInt(parts[2])
    const c = parseInt(parts[3])
    expect(a + c).toBeLessThan(b)
  })

  it('produces valid answer with positive denominator', () => {
    const p1 = generateFromTemplate(template, 'u', 0)
    const p2 = generateFromTemplate(template, 'u', 10)
    expect(p1.answer.denominator).toBeGreaterThan(0)
    expect(p2.answer.denominator).toBeGreaterThan(0)
  })
})

import { describe, it, expect } from 'vitest'
import { classifyMistake } from '../mistakeClassifier'

describe('classifyMistake - fraction type', () => {
  const correct = { numerator: 5, denominator: 8 }

  it('detects denominator_error when denominator differs', () =>
    expect(classifyMistake('calculation', correct, { numerator: 5, denominator: 16 }, 10)).toBe('denominator_error'))

  it('detects numerator_error when only numerator differs', () =>
    expect(classifyMistake('calculation', correct, { numerator: 3, denominator: 8 }, 10)).toBe('numerator_error'))

  it('detects concept_error when both differ', () =>
    expect(classifyMistake('calculation', correct, { numerator: 3, denominator: 16 }, 10)).toBe('concept_error'))

  it('detects guess_error when timeSpent < 3s', () =>
    expect(classifyMistake('calculation', correct, { numerator: 3, denominator: 16 }, 2)).toBe('guess_error'))
})

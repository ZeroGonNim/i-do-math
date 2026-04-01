import type { FractionAnswer, MistakeType, ProblemType } from '@/types/problem'
import { normalizeFraction } from './fractionUtils'

export function classifyMistake(
  problemType: ProblemType,
  correct: FractionAnswer,
  userAnswer: FractionAnswer,
  timeSpent: number
): MistakeType {
  if (timeSpent < 3) return 'guess_error'

  const nc = normalizeFraction(correct.numerator, correct.denominator)
  const nu = normalizeFraction(userAnswer.numerator, userAnswer.denominator)

  if (problemType === 'calculation') {
    const denomMatch = nc.denominator === nu.denominator
    const numerMatch = nc.numerator === nu.numerator
    if (!denomMatch && numerMatch) return 'denominator_error'
    if (denomMatch && !numerMatch) return 'numerator_error'
    return 'concept_error'
  }

  return 'concept_error'
}

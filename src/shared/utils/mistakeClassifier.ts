import type { Answer, MistakeType, ProblemType } from '@/types/problem'
import { isIntegerAnswer, isFractionAnswer } from '@/types/problem'
import { normalizeFraction } from './fractionUtils'

export function classifyMistake(
  problemType: ProblemType,
  correct: Answer,
  userAnswer: Answer,
  timeSpent: number
): MistakeType {
  if (timeSpent < 3) return 'guess_error'

  if (isIntegerAnswer(correct) && isIntegerAnswer(userAnswer)) {
    return 'calculation_error'
  }

  if (isFractionAnswer(correct) && isFractionAnswer(userAnswer)) {
    const nc = normalizeFraction(correct.numerator, correct.denominator)
    const nu = normalizeFraction(userAnswer.numerator, userAnswer.denominator)

    if (problemType === 'calculation') {
      const denomMatch = nc.denominator === nu.denominator
      const numerMatch = nc.numerator === nu.numerator
      if (!denomMatch && numerMatch) return 'denominator_error'
      if (denomMatch && !numerMatch) return 'numerator_error'
    }
    return 'concept_error'
  }

  // multiple_choice / symbol / multi_blank / text / draw
  return 'concept_error'
}

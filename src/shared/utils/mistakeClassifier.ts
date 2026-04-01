import type { Answer, FractionAnswer, MistakeType, ProblemType } from '@/types/problem'
import { isIntegerAnswer } from '@/types/problem'
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

  const nc = normalizeFraction(
    (correct as FractionAnswer).numerator,
    (correct as FractionAnswer).denominator
  )
  const nu = normalizeFraction(
    (userAnswer as FractionAnswer).numerator,
    (userAnswer as FractionAnswer).denominator
  )

  if (problemType === 'calculation') {
    const denomMatch = nc.denominator === nu.denominator
    const numerMatch = nc.numerator === nu.numerator
    if (!denomMatch && numerMatch) return 'denominator_error'
    if (denomMatch && !numerMatch) return 'numerator_error'
    return 'concept_error'
  }

  return 'concept_error'
}

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

  // 1. 정수 타입 정밀 분석
  if (isIntegerAnswer(correct) && isIntegerAnswer(userAnswer)) {
    const diff = Math.abs(correct.value - userAnswer.value)
    // 0 한두 개 차이거나 10배수 차이면 자릿수 실수
    if (diff > 0 && (correct.value / userAnswer.value === 10 || userAnswer.value / correct.value === 10)) {
      return 'precision_error'
    }
    return 'calculation_error'
  }

  // 2. 분수 타입 정밀 분석
  if (isFractionAnswer(correct) && isFractionAnswer(userAnswer)) {
    const nc = normalizeFraction(correct.numerator, correct.denominator)
    const nu = normalizeFraction(userAnswer.numerator, userAnswer.denominator)

    // 약분을 안 해서 틀린 경우 (값은 같지만 형식이 다름)
    const isValueEqual = (correct.numerator * userAnswer.denominator) === (userAnswer.numerator * correct.denominator)
    if (isValueEqual && (userAnswer.numerator !== correct.numerator)) {
      // 만약 정답이 기약분수인데 사용자가 약분을 안 했다면
      return 'concept_error' // reduction_error 타입이 정의되어 있다면 그것을 사용하되, 현재는 concept_error로 분류
    }

    if (problemType === 'calculation') {
      const denomMatch = nc.denominator === nu.denominator
      const numerMatch = nc.numerator === nu.numerator
      if (!denomMatch && numerMatch) return 'denominator_error'
      if (denomMatch && !numerMatch) return 'numerator_error'
    }
    return 'concept_error'
  }

  // 3. 텍스트 타입 (소수점 등)
  if ('text' in correct && 'text' in (userAnswer as any)) {
    const cText = (correct as any).text
    const uText = (userAnswer as any).text
    if (!isNaN(parseFloat(cText)) && !isNaN(parseFloat(uText))) {
      // 수치형 텍스트인데 소수점 위치만 틀린 경우
      const cVal = parseFloat(cText)
      const uVal = parseFloat(uText)
      if (cVal !== uVal && (cVal / uVal === 10 || uVal / cVal === 10)) {
        return 'precision_error'
      }
    }
  }

  return 'concept_error'
}

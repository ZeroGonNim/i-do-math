import { MistakeType } from '@/types/problem'

export interface MistakeFeedback {
  label: string
  color: string
  advice: string
}

export function getMistakeFeedback(type: MistakeType): MistakeFeedback {
  switch (type) {
    case 'precision_error':
      return {
        label: '자릿수 실수',
        color: '#ff716c',
        advice: '소수점 위치나 0의 개수를 다시 한번 확인해보는 습관이 필요해요.'
      }
    case 'calculation_error':
      return {
        label: '연산 실수',
        color: '#fbbf24',
        advice: '풀이 과정은 맞았지만 마지막 계산에서 실수가 있었어요. 천천히 다시 풀어볼까요?'
      }
    case 'denominator_error':
      return {
        label: '분모 오류',
        color: '#38bdf8',
        advice: '분모를 통분하거나 유지하는 과정에서 실수가 있었어요. 공통분모를 확인해보세요.'
      }
    case 'numerator_error':
      return {
        label: '분자 오류',
        color: '#c084fc',
        advice: '분자끼리의 연산에 집중해 보세요. 나눗셈을 곱셈으로 바꿀 때 분자/분모가 바뀌지 않았나요?'
      }
    case 'concept_error':
      return {
        label: '개념 이해 필요',
        color: '#f472b6',
        advice: '해당 단원의 기본 원리를 다시 한번 복습하면 훨씬 잘 풀 수 있을 거예요!'
      }
    case 'guess_error':
      return {
        label: '성급한 풀이',
        color: '#94a3b8',
        advice: '조금 더 시간을 들여서 문제를 읽어보면 충분히 맞힐 수 있는 문제예요.'
      }
    default:
      return {
        label: '확인 필요',
        color: '#64748b',
        advice: '풀이 과정을 차근차근 다시 한번 검토해 보세요.'
      }
  }
}

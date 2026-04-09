import { MistakeType } from '@/types/problem'

export const MISTAKE_LABELS: Record<NonNullable<MistakeType>, string> = {
  denominator_error: '분모 오답',
  numerator_error: '분자 오답',
  concept_error: '개념 이해 부족',
  precision_error: '정밀도 부족',
  guess_error: '찍기(풀이 시간 부족)',
  hint_dependent_error: '힌트 의존',
  calculation_error: '계산 실수',
}

/**
 * 시스템 내부의 영문 concept 키값을 한글 레이블로 변환하는 매핑 테이블
 */
export const CONCEPT_LABELS: Record<string, string> = {
  // 분수
  fraction_add_same_denominator: '분모 같은 분수의 덧셈',
  fraction_sub_same_denominator: '분모 같은 분수의 뺄셈',
  
  // 각도
  angle_drawing: '각도 그리기',
  angle_calculation: '각도 계산하기',
  angle_classification: '각도 분류하기',
  angle_addition: '각의 합 구하기',
  angle_division: '각의 차 구하기',
  triangle_angle_sum: '삼각형 각의 합',
  quadrilateral_angle_sum: '사각형 각의 합',
  straight_line_angle: '직각과 직선의 각',
  
  // 큰 수
  big_number_read_write: '큰 수 읽고 쓰기',
  big_number_place_value: '큰 수의 자릿값',
  big_number_sequence: '큰 수의 뛰어 세기',
  big_number_compare: '큰 수의 크기 비교',
  big_number_addition: '큰 수의 덧셈',
  big_number_money_calc: '돈 계산하기',
  
  // 곱셈 및 나눗셈
  three_digit_multiplication: '세 자리 수 곱셈',
  multiply_3digit_tens: '세 자리 수 × 몇십',
  multiply_3digit_2digit: '세 자리 수 × 두 자리 수',
  multiply_reverse: '곱셈 역산하기',
  multiplication_word_problem: '곱셈 문장제',
  multiplication_property: '곱셈의 성질',
  multiplication_comparison: '곱셈 크기 비교',
  
  two_digit_division: '두 자리 수 나눗셈',
  divide_hundreds_tens: '몇백 ÷ 몇십',
  division_with_remainder: '나머지가 있는 나눗셈',
  division_word_problem: '나눗셈 문장제',
  division_property: '나눗셈의 성질',
  division_comparison: '나눗셈 크기 비교',
  divide_reverse: '나눗셈 역산하기',
  
  // 도형 및 데이터
  'plane-shape-movement': '평면도형의 이동',
  'bar-graph': '막대그래프',
  'number-pattern': '수 배열의 규칙',
  pattern_find: '규칙 찾기',
}

/**
 * 개념명을 포맷팅하는 유틸리티 함수
 */
export function formatConceptName(concept: string): string {
  if (!concept) return '알 수 없는 개념'
  
  // 매핑 테이블에 있으면 반환
  if (CONCEPT_LABELS[concept]) {
    return CONCEPT_LABELS[concept]
  }
  
  // 없으면 snake_case를 Title Case로 변환
  return concept
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

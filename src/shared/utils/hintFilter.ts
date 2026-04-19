/**
 * 힌트 텍스트에서 직접적인 정답 노출을 방지하기 위한 필터링 유틸리티
 *
 * [필터링 원칙]
 * 1. '정답은 X' 형태의 직접 언급 문장 제거
 * 2. 계산 결과 노출 패턴 마스킹 (빼면 X, 더하면 X, = X 등)
 * 3. answerValues로 넘어온 정답값을 힌트 내에서 직접 마스킹
 * 4. 객관식 기호(①-⑤, ㄱ-ㄹ) 제거
 * 5. 필터링 후 내용이 부실하면 공통 안내 메시지로 대체
 */

// 계산 결과를 직접 노출하는 동사 패턴
const CALC_VERBS = '빼면|더하면|나누면|곱하면|더하기하면|빼기하면|계산하면|구하면|합하면|하면'

export function filterHintText(text: string, answerValues?: number[]): string {
  if (!text) return ''

  // 문장 단위로 분리
  const sentences = text.split(/(?<=[.!?])\s+/)

  const filteredSentences = sentences.filter(s => {
    // 1. "정답은 X" / "답은 X" 직접 언급 문장 제거
    if (/(정답|이 문제의 정답|답)은?\s*[:=]?\s*\d+/.test(s)) return false
    // 너무 짧고 숫자만 있는 조각 제거
    if (s.trim().length < 5 && /\d+/.test(s)) return false
    return true
  })

  let result = filteredSentences.join(' ')

  // 2. "빼면/더하면/계산하면 등 + 숫자" → 숫자를 ?로 마스킹
  result = result.replace(
    new RegExp(`(${CALC_VERBS})\\s*(\\d+[,\\d]*)`, 'g'),
    '$1 ?'
  )

  // 3. "= 숫자" 패턴 마스킹 (수식 결과값)
  result = result.replace(/=\s*\d[\d,]*/g, '= ?')

  // 4. "이므로 숫자" / "따라서 숫자" 패턴 마스킹
  result = result.replace(/(이므로|따라서)\s+(\d[\d,]*)/g, '$1 ?')

  // 5. 넘어온 정답값을 힌트 내에서 직접 마스킹
  if (answerValues && answerValues.length > 0) {
    for (const val of answerValues) {
      if (val <= 0) continue
      // 단어 경계 또는 °/원/개/명/cm 등 단위 앞의 숫자만 마스킹
      result = result.replace(
        new RegExp(`(?<![\\d])(${val})(?![\\d])`, 'g'),
        '?'
      )
    }
  }

  // 6. 객관식 기호 제거
  result = result.replace(/[①②③④⑤ㄱㄴㄷㄹ]/g, '').trim()

  // 필터링 후 너무 짧아지면 기본 가이드로 대체
  if (result.length < 10) {
    return '문제의 풀이 단계를 차근차근 읽어보세요. 각 계산 과정을 다시 한번 확인하면 스스로 정답을 찾을 수 있습니다.'
  }

  if (!result.endsWith('.')) result += '.'
  return result
}

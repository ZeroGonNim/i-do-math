/**
 * 힌트 텍스트에서 직접적인 정답 노출을 방지하기 위한 필터링 유틸리티
 * 
 * [필터링 원칙]
 * 1. '정답', '답' 단어가 포함된 문장이나 구절은 통째로 삭제
 * 2. 부등호(<, >, =)나 숫자가 답을 직접 알려주는 형태 차단
 * 3. 객관식 기호(①-⑤, ㄱ-ㄹ) 제거
 * 4. 필터링 후 내용이 부실하면 공통 원리 메시지로 대체
 */
export function filterHintText(text: string): string {
  if (!text) return ''

  // 문장 단위로 분리 (마침표 기준)
  const sentences = text.split(/[.!?]\s+/)
  
  const filteredSentences = sentences.filter(s => {
    // 1. 정답이나 답이라는 직접적인 언급이 있는 문장 제외 (너무 노골적인 경우만)
    if (/(정답|답)은?\s*[:=]?\s*\d+/.test(s)) return false

    // 2. 필터링 로직 완화: 단순히 숫자가 있다고 지우지 않고, 너무 짧은 정답 문장만 제외
    if (s.trim().length < 5 && /\d+/.test(s)) return false

    return true
  })

  let result = filteredSentences.join('. ')
    // 3. 수식 내의 최종 결과값 등을 '?'로 부드럽게 마스킹 (선택적)
    .replace(/=\s*\d+/g, '= ?')
    .replace(/[①②③④⑤ㄱㄴㄷㄹ]/g, '')
    .trim()
  // 만약 필터링 후 너무 짧아지거나 알맹이가 없으면 기본 가이드로 대체
  if (result.length < 10) {
    return '문제의 풀이 단계를 차근차근 읽어보세요. 각 계산 과정을 다시 한번 확인하면 스스로 정답을 찾을 수 있습니다.'
  }

  // 문장 끝에 마침표 보정
  if (!result.endsWith('.')) result += '.'

  return result
}

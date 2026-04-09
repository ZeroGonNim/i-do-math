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
    // 1. 정답이나 답이라는 직접적인 언급이 있는 문장 제외
    if (/(정답|답|결과)은?\s*[:=]?\s*/.test(s)) return false
    
    // 2. 부등호와 숫자가 결합되어 정답을 알려주는 문장 제외 (예: 361 < 363)
    if (/[\d,]+\s*[<>=]\s*[\d,]+/.test(s)) return false
    
    // 3. 문장 자체가 특정 숫자로 끝나는 경우 (예: "결과는 123입니다.")
    if (/\d+(번|입니다|예요|가|이|개|원|분|cm|도|°)$/.test(s.trim())) return false

    return true
  })

  let result = filteredSentences.join('. ')
    // 4. 남아있는 객관식 번호 및 기호 개별 제거
    .replace(/[①②③④⑤ㄱㄴㄷㄹ]/g, '')
    .trim()

  // 만약 필터링 후 너무 짧아지거나 알맹이가 없으면 기본 가이드로 대체
  if (result.length < 10) {
    return '천천히 원리를 생각해보자! 그림이나 식을 다시 한번 살펴보면 답을 찾을 수 있을 거야.'
  }

  // 문장 끝에 마침표 보정
  if (!result.endsWith('.')) result += '.'

  return result
}

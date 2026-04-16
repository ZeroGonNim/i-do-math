/**
 * 숫자를 3자리마다 콤마를 찍어서 문자열로 반환합니다 (예: 100,000)
 * 소수점이 있는 경우 소수점 이하는 유지합니다.
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0'
  
  // 콤마 제거 후 숫자만 추출
  const stringValue = String(value).replace(/,/g, '')
  if (stringValue.trim() === '') return ''
  
  const num = Number(stringValue)
  if (isNaN(num)) return stringValue
  
  return num.toLocaleString('ko-KR', {
    maximumFractionDigits: 10
  })
}

/**
 * 문자열 내의 모든 숫자를 찾아 3자리마다 콤마를 찍어줍니다.
 * 콤마가 잘못 찍혀있거나 자릿수가 틀린 숫자도 올바르게 교정합니다.
 *
 * 주의: 한국 수학 문제에서 4자리 이하 숫자(예: 1567, 4768)는
 * 한국식 4자리 그룹 표기의 일부일 수 있으므로 콤마를 찍지 않습니다.
 * 5자리 이상(10,000 이상)인 숫자만 콤마 포맷을 적용합니다.
 */
export function formatNumbersInString(text: string): string {
  if (!text) return ''

  // 정규식: 숫자와 콤마가 연속된 뭉치를 찾음
  return text.replace(/[\d,]+(\.\d+)?/g, (match) => {
    if (match === ',') return match

    const hasTrailingComma = match.endsWith(',')
    const cleanMatch = hasTrailingComma ? match.slice(0, -1) : match

    // 콤마 제거 후 순수 숫자 길이 확인
    const digits = cleanMatch.replace(/,/g, '')
    // 4자리 이하(9999 이하)는 한국식 4자리 그룹 표기 일부일 수 있으므로 그대로 반환
    if (digits.length <= 4 && !digits.includes('.')) {
      return match
    }

    const formatted = formatNumber(cleanMatch)
    return hasTrailingComma ? formatted + ',' : formatted
  })
}

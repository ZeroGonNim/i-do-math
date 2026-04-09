/**
 * 숫자를 3자리마다 콤마를 찍어서 문자열로 반환합니다 (예: 100,000)
 * 소수점이 있는 경우 소수점 이하는 유지합니다.
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0'
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
 */
export function formatNumbersInString(text: string): string {
  if (!text) return ''
  return text.replace(/\d+(\.\d+)?/g, (match) => {
    return formatNumber(match)
  })
}

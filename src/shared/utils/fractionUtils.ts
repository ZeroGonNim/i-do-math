import type { FractionAnswer } from '@/types/problem'

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function normalizeFraction(numerator: number, denominator: number): FractionAnswer {
  const d = gcd(numerator, denominator)
  const n = numerator / d
  const den = denominator / d
  // 분모가 음수이면 부호를 분자로 이동 (-3/-6 → 1/2)
  return den < 0
    ? { numerator: -n, denominator: -den }
    : { numerator: n, denominator: den }
}

export function isFractionEqual(a: FractionAnswer, b: FractionAnswer): boolean {
  const na = normalizeFraction(a.numerator, a.denominator)
  const nb = normalizeFraction(b.numerator, b.denominator)
  return na.numerator === nb.numerator && na.denominator === nb.denominator
}

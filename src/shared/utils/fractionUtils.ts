import type { FractionAnswer } from '@/types/problem'

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

export function normalizeFraction(numerator: number, denominator: number): FractionAnswer {
  const d = gcd(numerator, denominator)
  return { numerator: numerator / d, denominator: denominator / d }
}

export function isFractionEqual(a: FractionAnswer, b: FractionAnswer): boolean {
  const na = normalizeFraction(a.numerator, a.denominator)
  const nb = normalizeFraction(b.numerator, b.denominator)
  return na.numerator === nb.numerator && na.denominator === nb.denominator
}

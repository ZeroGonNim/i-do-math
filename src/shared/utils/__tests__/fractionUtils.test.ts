import { describe, it, expect } from 'vitest'
import { gcd, normalizeFraction, isFractionEqual } from '../fractionUtils'

describe('gcd', () => {
  it('returns 4 for gcd(8, 4)', () => expect(gcd(8, 4)).toBe(4))
  it('returns 1 for coprime numbers', () => expect(gcd(5, 8)).toBe(1))
})

describe('normalizeFraction', () => {
  it('reduces 2/4 to 1/2', () =>
    expect(normalizeFraction(2, 4)).toEqual({ numerator: 1, denominator: 2 }))
  it('keeps 5/8 as 5/8', () =>
    expect(normalizeFraction(5, 8)).toEqual({ numerator: 5, denominator: 8 }))
})

describe('isFractionEqual', () => {
  it('2/4 equals 1/2', () =>
    expect(isFractionEqual({ numerator: 2, denominator: 4 }, { numerator: 1, denominator: 2 })).toBe(true))
  it('3/8 does not equal 5/8', () =>
    expect(isFractionEqual({ numerator: 3, denominator: 8 }, { numerator: 5, denominator: 8 })).toBe(false))
})

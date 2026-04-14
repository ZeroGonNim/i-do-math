#!/usr/bin/env node
/**
 * 문제 데이터 자동 검증 스크립트
 * 수학적 정확성 검증:
 * 1. 큰 수 읽기 문제 — 선택지와 숫자가 일치하는지
 * 2. 사칙연산 문제 — steps.expression 계산 결과가 정답과 일치하는지
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = join(__dirname, '../public/data/problems-v1.json')
const raw = JSON.parse(readFileSync(dataPath, 'utf-8'))
const problems = Array.isArray(raw) ? raw : (raw.problems ?? [])

// ─────────────────────────────────────────────
// 한국어 큰수 변환 유틸
// ─────────────────────────────────────────────
const UNITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
const POS   = ['', '십', '백', '천']
const GROUP = ['', '만', '억', '조']

/** 4자리 이하 숫자를 한국어로 변환 (ex: 1234 → '천이백삼십사') */
function to4Digits(n) {
  if (n === 0) return ''
  let result = ''
  for (let i = 3; i >= 0; i--) {
    const d = Math.floor(n / Math.pow(10, i)) % 10
    if (d === 0) continue
    // '일십', '일백', '일천' → '십', '백', '천'으로 간소화
    const unit = (d === 1 && i > 0) ? '' : UNITS[d]
    result += unit + POS[i]
  }
  return result
}

/** 정수를 한국어 큰수 읽기로 변환 (조 단위까지) */
function toKorean(num) {
  if (num === 0) return '영'
  if (!Number.isFinite(num) || num < 0) return null

  // 그룹 분리: [조, 억, 만, 일]
  const jo  = Math.floor(num / 1_0000_0000_0000)
  const eok = Math.floor((num % 1_0000_0000_0000) / 1_0000_0000)
  const man = Math.floor((num % 1_0000_0000) / 1_0000)
  const il  = num % 1_0000

  let result = ''
  if (jo  > 0) result += to4Digits(jo)  + '조'
  if (eok > 0) result += to4Digits(eok) + '억'
  if (man > 0) result += to4Digits(man) + '만'
  if (il  > 0) result += to4Digits(il)
  return result
}

// ─────────────────────────────────────────────
// 큰 수 읽기 문제 검증
// ─────────────────────────────────────────────
function extractBigNumber(problem) {
  // "83267조 2426억 3357만을 수로 나타내면"
  // "다음 수를 읽어보세요. 123456789"
  const qText = problem.question

  // 패턴 1: 순수 숫자 (공백/쉼표 포함 가능)
  const pureNumMatch = qText.match(/[\d,\s]+/)
  if (pureNumMatch) {
    const n = parseInt(pureNumMatch[0].replace(/[,\s]/g, ''), 10)
    if (!isNaN(n) && n > 9999) return n
  }

  // 패턴 2: "N조 M억 K만" 형태
  let total = 0
  const joM  = qText.match(/(\d[\d,]*)조/)
  const eokM = qText.match(/(\d[\d,]*)억/)
  const manM = qText.match(/(\d[\d,]*)만/)
  const ilM  = qText.match(/조.*억.*만.*?(\d[\d,]+)\s*(?:을|이|가|은|를|$)/)
  if (joM || eokM || manM) {
    if (joM)  total += parseInt(joM[1].replace(/,/g,''), 10) * 1_0000_0000_0000
    if (eokM) total += parseInt(eokM[1].replace(/,/g,''), 10) * 1_0000_0000
    if (manM) total += parseInt(manM[1].replace(/,/g,''), 10) * 1_0000
    if (ilM)  total += parseInt(ilM[1].replace(/,/g,''), 10)
    if (total > 0) return total
  }

  return null
}

// steps 필드에서 "N조가 A개, M억이 B개, K만이 C개, D개" 추출 (한국어 조사 대응)
function extractFromSteps(problem) {
  if (!problem.steps || !Array.isArray(problem.steps)) return null
  const stepText = problem.steps.map(s => s.expression + (s.narrative ?? '')).join(' ')

  // 각 단위 파싱 — 조사: 가/이/은/는/를/이고/로 등 유연하게 처리
  let total = 0
  let found = false

  const joM  = stepText.match(/(\d[\d,]*)조/)
  const eokM = stepText.match(/(\d[\d,]*)억/)
  const manM = stepText.match(/(\d[\d,]*)만/)
  // 일의 자리 그룹 (단독 숫자 뒤에 조사)
  // 나타내면: "... 3357만 ..." 이후 남은 단위

  if (joM)  { total += parseInt(joM[1].replace(/,/g,''), 10) * 1_0000_0000_0000; found = true }
  if (eokM) { total += parseInt(eokM[1].replace(/,/g,''), 10) * 1_0000_0000; found = true }
  if (manM) { total += parseInt(manM[1].replace(/,/g,''), 10) * 1_0000; found = true }

  return found ? total : null
}

// ─────────────────────────────────────────────
// 산술식 안전 계산
// ─────────────────────────────────────────────
function safeEval(expr) {
  try {
    // 한국어 × ÷ → * /
    const normalized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^0-9+\-*/().\s]/g, '')
      .trim()
    if (!normalized) return null
    // Function 생성자 방식 — 안전한 숫자식 평가
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + normalized + ')')()
    return typeof result === 'number' && isFinite(result) ? result : null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// 검증 실행
// ─────────────────────────────────────────────
const errors = []
let checked = 0

for (const p of problems) {
  const id = p.id
  const answerType = p.answer?.type ?? 'integer'

  // ── 1. 큰 수 읽기: multiple_choice + unit에 "큰 수" 포함 문제
  if (
    answerType === 'multiple_choice' &&
    p.choices?.length > 0 &&
    (p.unit?.includes('큰 수') || p.question?.match(/읽어|나타내|한국어/))
  ) {
    const correctIdx = (p.answer?.choice ?? 1) - 1 // 0-indexed
    const correctChoice = p.choices?.[correctIdx]

    if (correctChoice) {
      // 숫자 추출: 질문 또는 steps에서
      let num = extractBigNumber(p)
      if (!num && p.steps) num = extractFromSteps(p)

      if (num !== null) {
        const expected = toKorean(num)
        if (expected && !correctChoice.includes(expected.slice(0, 6))) {
          errors.push({
            type: 'WRONG_READING_ANSWER',
            id,
            expected: expected.slice(0, 20) + '...',
            actual: correctChoice.slice(0, 40),
            num,
          })
        }
        checked++
      }
    }
  }

  // ── 2. 산술식 검증: steps.expression에 = 기호 있는 경우
  // 순수 숫자 산술식만 검증 (한국어 단위, 변수, 특수문자 포함 시 스킵)
  if (p.steps && Array.isArray(p.steps)) {
    for (const step of p.steps) {
      const expr = step.expression ?? ''
      if (!expr.includes('=')) continue

      // 한국어 문자, 영문자(변수), 특수수학기호, 단위 포함 시 스킵
      const hasKorean = /[가-힣]/.test(expr)
      const hasLetter = /[a-zA-Z□㉠㉡㉢]/.test(expr)
      const hasSpecial = /[²³°↺↻→←↑↓,]/.test(expr)
      if (hasKorean || hasLetter || hasSpecial) continue

      // = 이 하나만 있고 양쪽이 순수 숫자식인 경우만 처리
      const eqCount = (expr.match(/=/g) ?? []).length
      if (eqCount !== 1) continue

      const [lhs, rhs] = expr.split('=').map(s => s.trim())

      const lhsVal = safeEval(lhs)
      const rhsVal = safeEval(rhs)

      if (lhsVal !== null && rhsVal !== null) {
        if (Math.abs(lhsVal - rhsVal) > 0.0001) {
          errors.push({
            type: 'WRONG_STEP_CALC',
            id,
            expression: expr,
            lhs: lhsVal,
            rhs: rhsVal,
          })
        }
        checked++
      }
    }
  }

  // ── 3. multiple_choice: 마지막 step 텍스트 vs answer.choice 불일치
  if (
    (p.answerType === 'multiple_choice' || answerType === 'multiple_choice') &&
    p.choices?.length > 0 &&
    p.steps?.length > 0
  ) {
    const correctIdx = (p.answer?.choice ?? 1) - 1
    const lastStep = p.steps[p.steps.length - 1]
    const lastText = (lastStep?.expression ?? '') + ' ' + (lastStep?.narrative ?? '')

    const mentioned = p.choices
      .map((c, i) => ({ idx: i, choice: c, found: lastText.includes(c) }))
      .filter(x => x.found)

    if (mentioned.length === 1 && mentioned[0].idx !== correctIdx) {
      errors.push({
        type: 'CHOICE_MISMATCH',
        id,
        choices: p.choices,
        answerChoice: p.answer?.choice,
        stepSays: mentioned[0].choice,
        expectedChoice: mentioned[0].idx + 1,
        lastStep: lastText.trim().slice(0, 80),
      })
      checked++
    }
  }

  // ── 4. 정수 정답 일치: answer.value와 steps 마지막 계산식 결과
  if (answerType === 'integer' && p.answer?.value !== undefined && p.steps?.length > 0) {
    const lastStep = p.steps[p.steps.length - 1]
    const expr = lastStep?.expression ?? ''
    const hasKorean = /[가-힣]/.test(expr)
    const hasLetter = /[a-zA-Z□㉠㉡㉢]/.test(expr)
    const hasSpecial = /[²³°↺↻→←↑↓,]/.test(expr)
    if (expr.includes('=') && !hasKorean && !hasLetter && !hasSpecial) {
      const eqCount = (expr.match(/=/g) ?? []).length
      if (eqCount === 1) {
        const rhs = expr.split('=').pop()?.trim()
        const rhsVal = safeEval(rhs ?? '')
        if (rhsVal !== null && Math.abs(rhsVal - p.answer.value) > 0.0001) {
          errors.push({
            type: 'ANSWER_MISMATCH',
            id,
            stepResult: rhsVal,
            answerValue: p.answer.value,
            expression: expr,
          })
        }
      }
    }
  }
}

// ─────────────────────────────────────────────
// 결과 출력
// ─────────────────────────────────────────────
console.log(`\n총 문제 수: ${problems.length}`)
console.log(`검사 항목: ${checked}`)
console.log(`오류 발견: ${errors.length}\n`)

if (errors.length === 0) {
  console.log('✅ 모든 검사 통과 — 수학적 오류 없음')
} else {
  errors.forEach((e, i) => {
    console.log(`[${i + 1}] ${e.type} | ${e.id}`)
    if (e.type === 'WRONG_READING_ANSWER') {
      console.log(`    숫자: ${e.num?.toLocaleString()}`)
      console.log(`    예상: ${e.expected}`)
      console.log(`    정답: ${e.actual}`)
    } else if (e.type === 'WRONG_STEP_CALC') {
      console.log(`    식: ${e.expression}`)
      console.log(`    LHS=${e.lhs}, RHS=${e.rhs}`)
    } else if (e.type === 'ANSWER_MISMATCH') {
      console.log(`    steps 마지막 결과: ${e.stepResult}`)
      console.log(`    answer.value: ${e.answerValue}`)
      console.log(`    식: ${e.expression}`)
    }
    console.log()
  })
}

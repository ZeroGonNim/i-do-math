/**
 * 4·5학년 종합 QA — 화면 렌더링 + 정답/힌트/풀이 검수
 * answerType 별 대표 문제를 실제 화면에서 확인
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

const SS = (name: string) => `e2e/screenshots/qa45-${name}.png`
const raw = JSON.parse(readFileSync(join(process.cwd(), 'public/data/problems-v1.json'), 'utf-8'))
const allProblems: Record<string, unknown>[] = raw.problems ?? raw

// ── 검수 대상 ────────────────────────────────────────────────
const TARGETS = [
  // 4학년 - answerType 별 대표
  { id: 'g4-s1-u2-angle-001',        label: 'g4-integer',       grade: 4 },
  { id: 'g4-s1-u2-angle-002',        label: 'g4-multiple_choice', grade: 4 },
  { id: 'g4-s1-u2-angle-005',        label: 'g4-multi_blank',   grade: 4 },
  { id: 'g4-s1-u2-angle-009',        label: 'g4-draw',          grade: 4 },
  { id: 'g4-s1-u3-mul-div-009',      label: 'g4-symbol',        grade: 4 },
  { id: 'g4-s1-u6-pattern-013',      label: 'g4-text',          grade: 4 },
  { id: 'g4-s2-u1-fraction-011',     label: 'g4-fraction',      grade: 4 },
  // 5학년 구버전 - 기존 지원 answerType
  { id: 'g5-s1-u3-correspond-001',   label: 'g5-text',          grade: 5 },
  { id: 'g5-s1-u3-correspond-002',   label: 'g5-multiple_choice', grade: 5 },
  { id: 'g5-s1-u3-correspond-003',   label: 'g5-integer',       grade: 5 },
  { id: 'g5-s1-u5-add-diff-001',     label: 'g5-fraction',      grade: 5 },
  { id: 'g5-s1-u5-add-mixed-001',    label: 'g5-multi_blank',   grade: 5 },
  // 5학년 신버전 - number / short_answer (미지원 타입)
  { id: 'g5-s2-u3-point-sym-count-001', label: 'g5-number-display', grade: 5 },
  { id: 'g5-s2-u6-prob-zero-001',    label: 'g5-short_answer',  grade: 5 },
  // 5학년 신버전 1학기 (내가 추가) - number + steps:{step,description}
  { id: 'g5-s1-u1-mixed-001',        label: 'g5s1-u1-number',   grade: 5 },
  { id: 'g5-s1-u2-gcd-001',          label: 'g5s1-u2-number',   grade: 5 },
  { id: 'g5-s1-u3-table-fill-002',   label: 'g5s1-u3-short_answer', grade: 5 },
  { id: 'g5-s1-u4-simplify-001',     label: 'g5s1-u4-fraction-new', grade: 5 },
  { id: 'g5-s1-u5-add-001',          label: 'g5s1-u5-fraction-new', grade: 5 },
  { id: 'g5-s1-u6-perimeter-001',    label: 'g5s1-u6-number',   grade: 5 },
  { id: 'g5-s1-u6-apply-001',        label: 'g5s1-u6-apply',    grade: 5 },
  { id: 'g5-s1-u6-challenge-001',    label: 'g5s1-u6-challenge', grade: 5 },
]

async function clearDB(page: Page) {
  await page.evaluate(() =>
    new Promise<void>(resolve => {
      const req = indexedDB.deleteDatabase('IDoMathDB')
      req.onsuccess = req.onerror = req.onblocked = () => resolve()
    })
  )
}

async function completeOnboarding(page: Page) {
  await page.goto('/')
  await clearDB(page)
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  await page.locator('input').fill('QA테스트')
  await page.getByRole('button', { name: /다음/ }).click()
  const grade5Btn = page.getByRole('button', { name: '5학년' })
  const grade4Btn = page.getByRole('button', { name: '4학년' })
  if (await grade5Btn.isVisible().catch(() => false)) await grade5Btn.click()
  else await grade4Btn.click()
  await page.getByRole('button', { name: /다음/ }).click()
  await page.locator('.grid').first().locator('> *').first().click()
  await page.getByRole('button', { name: /시작하기/ }).click()
  await page.waitForURL('**/home', { timeout: 8000 })
  await page.waitForLoadState('networkidle')
}

async function goToProblem(page: Page, problemId: string): Promise<boolean> {
  const problem = allProblems.find(p => p.id === problemId)
  if (!problem) {
    console.log(`  ⚠ 건너뜀: ${problemId} — 데이터 없음`)
    return false
  }
  await page.evaluate((prob) => {
    const routerState = { usr: { problem: prob, isRemind: false }, key: `qa-${Date.now()}`, idx: 2 }
    window.history.pushState(routerState, '', '/problem')
    window.dispatchEvent(new PopStateEvent('popstate', { state: routerState }))
  }, problem)
  await page.waitForTimeout(1500)
  return true
}

// ── 정답 입력 헬퍼 ───────────────────────────────────────────
async function inputAnswer(page: Page, problem: Record<string, unknown>): Promise<boolean> {
  const answerType = (problem.answerType as string) ?? 'fraction'
  const answer = problem.answer as Record<string, unknown>

  try {
    if (answerType === 'integer') {
      const val = String(answer.value)
      for (const ch of val) {
        await page.getByRole('button', { name: ch, exact: true }).first().click()
      }
      return true
    }
    if (answerType === 'number') {
      // number 타입: UI에서 어떻게 처리되는지 확인 (integer input이 보이면 입력)
      const intInput = page.locator('[data-testid="integer-input"], input[type="number"]').first()
      if (await intInput.isVisible().catch(() => false)) {
        await intInput.fill(String(answer.value))
        return true
      }
      // CustomKeypad로 시도
      const val = String(answer.value).replace(/[^0-9]/g, '')
      for (const ch of val) {
        const btn = page.getByRole('button', { name: ch, exact: true }).first()
        if (await btn.isVisible().catch(() => false)) await btn.click()
      }
      return val.length > 0
    }
    if (answerType === 'multiple_choice') {
      const choiceNum = answer.choice as number
      const choiceBtns = page.locator('button').filter({ hasText: /^[①②③④⑤]$/ })
      const count = await choiceBtns.count()
      if (count > 0) {
        await choiceBtns.nth(choiceNum - 1).click()
        return true
      }
      return false
    }
    if (answerType === 'symbol') {
      const sym = answer.symbol as string
      await page.getByRole('button', { name: sym, exact: true }).click()
      return true
    }
    if (answerType === 'fraction') {
      // 분자 입력 (위 칸)
      const num = String(answer.numerator)
      const den = String(answer.denominator)
      // 분자 칸 활성화
      const fracTop = page.locator('[data-field="numerator"]').first()
      if (await fracTop.isVisible().catch(() => false)) await fracTop.click()
      for (const ch of num) {
        await page.getByRole('button', { name: ch, exact: true }).first().click()
      }
      // 분모 칸 활성화
      const fracBot = page.locator('[data-field="denominator"]').first()
      if (await fracBot.isVisible().catch(() => false)) await fracBot.click()
      for (const ch of den) {
        await page.getByRole('button', { name: ch, exact: true }).first().click()
      }
      return true
    }
    if (answerType === 'multi_blank') {
      const vals = (answer.values as number[])
      for (let i = 0; i < vals.length; i++) {
        const val = String(vals[i])
        // i번째 빈칸 포커스
        const blanks = page.locator('[data-blank-index]')
        const blankCount = await blanks.count()
        if (blankCount > i) await blanks.nth(i).click()
        else {
          // 탭키로 이동 시도
          await page.keyboard.press('Tab')
        }
        for (const ch of val) {
          await page.getByRole('button', { name: ch, exact: true }).first().click()
        }
      }
      return true
    }
    if (answerType === 'text' || answerType === 'short_answer') {
      // 텍스트/short_answer: DrawProblem 컴포넌트(자가채점 버튼) 존재 여부 확인
      return false // 자가채점 불가 → 화면 확인만
    }
  } catch {
    return false
  }
  return false
}

// ── 메인 테스트 ──────────────────────────────────────────────
test.describe('4·5학년 종합 QA', () => {

  test('문제 화면 렌더링 — 모든 answerType', async ({ page }) => {
    await completeOnboarding(page)

    const results: Array<{ id: string; label: string; status: string; issues: string[] }> = []

    for (const { id, label } of TARGETS) {
      const problem = allProblems.find(p => p.id === id)
      if (!problem) {
        results.push({ id, label, status: '⚠ 데이터없음', issues: ['문제 ID 없음'] })
        continue
      }

      const ok = await goToProblem(page, id)
      if (!ok) continue

      const bodyText = await page.locator('body').innerText().catch(() => '')
      const issues: string[] = []

      // 렌더링 오류 체크
      if (bodyText.includes('오류가 발생') || bodyText.toLowerCase().includes('cannot read')) {
        issues.push('렌더링 오류')
      }
      if (bodyText.trim() === '' || bodyText.includes('로딩 중')) {
        issues.push('문제 미표시')
      }

      // 문제 텍스트 표시 체크
      const questionText = (problem.question as string) ?? ''
      if (questionText && !bodyText.includes(questionText.substring(0, 15))) {
        issues.push('문제 텍스트 미표시')
      }

      // 힌트 버튼 존재 체크
      const hintBtn = page.getByRole('button', { name: /힌트/ })
      const hasHint = await hintBtn.isVisible().catch(() => false)
      if (!hasHint) issues.push('힌트 버튼 없음')

      // 정답 제출 버튼 체크
      const submitBtn = page.getByRole('button', { name: /정답 제출하기/ })
      const hasSubmit = await submitBtn.isVisible().catch(() => false)
      if (!hasSubmit) issues.push('제출 버튼 없음')

      // answerType별 입력 UI 체크
      const answerType = (problem.answerType as string) ?? 'fraction'
      if (answerType === 'multiple_choice') {
        const choices = problem.choices as string[] | undefined
        if (!choices || choices.length === 0) {
          issues.push('choices 데이터 없음 (선택지 미표시)')
        }
      }
      if (['number', 'short_answer'].includes(answerType)) {
        // 미지원 타입: fraction input이 기본으로 뜨는지 확인
        const fracInput = page.locator('text=/분자|분모/').first()
        const hasFrac = await fracInput.isVisible().catch(() => false)
        if (hasFrac) issues.push(`미지원 answerType(${answerType}) → fraction UI로 fallback (정답 입력 불가)`)
      }

      await page.screenshot({ path: SS(`${label}-problem`), fullPage: false })

      const status = issues.length === 0 ? '✓ OK' : `✗ ${issues.length}개 이슈`
      results.push({ id, label, status, issues })
      console.log(`  ${status} [${label}] ${id}`)
      if (issues.length) issues.forEach(i => console.log(`    └ ${i}`))
    }

    // 전체 결과 요약 출력
    console.log('\n=== 렌더링 QA 결과 요약 ===')
    const failed = results.filter(r => r.issues.length > 0)
    console.log(`총 ${results.length}개 검수 / ${failed.length}개 이슈`)
    failed.forEach(r => {
      console.log(`  ✗ [${r.label}] ${r.id}`)
      r.issues.forEach(i => console.log(`    └ ${i}`))
    })

    // 크리티컬 이슈: 렌더링 오류는 실패 처리
    const criticalFails = results.filter(r => r.issues.some(i => i.includes('렌더링 오류') || i.includes('문제 미표시')))
    expect(criticalFails.length, `렌더링 오류 ${criticalFails.length}개`).toBe(0)
  })

  test('힌트 표시 QA', async ({ page }) => {
    await completeOnboarding(page)

    // 대표 문제들에서 힌트 버튼 클릭 시 힌트 텍스트 노출 확인
    const hintTargets = TARGETS.filter(t => !['g4-draw', 'g5-text', 'g5-short_answer'].includes(t.label)).slice(0, 8)

    for (const { id, label } of hintTargets) {
      const problem = allProblems.find(p => p.id === id)
      if (!problem) continue

      const ok = await goToProblem(page, id)
      if (!ok) continue

      // 힌트 버튼 클릭
      const hintBtn = page.getByRole('button', { name: /힌트/ })
      const hasHint = await hintBtn.isVisible().catch(() => false)
      if (!hasHint) {
        console.log(`  ⚠ [${label}] 힌트 버튼 없음`)
        continue
      }

      await hintBtn.click()
      await page.waitForTimeout(500)

      // 힌트 박스 + 개념 설명 텍스트 확인
      const conceptExp = (problem.conceptExplanation as string) ?? ''
      const hintBox = page.locator('text=힌트').first()
      const hintVisible = await hintBox.isVisible().catch(() => false)

      const bodyText = await page.locator('body').innerText().catch(() => '')
      const conceptShown = conceptExp.length > 10
        ? bodyText.includes(conceptExp.substring(0, 15))
        : true

      await page.screenshot({ path: SS(`${label}-hint`), fullPage: false })

      console.log(`  ${hintVisible && conceptShown ? '✓' : '✗'} [${label}] 힌트 표시: ${hintVisible}, 개념 텍스트: ${conceptShown}`)
      expect(hintVisible, `${id} — 힌트 박스 미표시`).toBe(true)
    }
  })

  test('정답 제출 QA — 정답 입력 후 결과 화면 확인', async ({ page }) => {
    await completeOnboarding(page)

    const submitTargets = [
      'g4-s1-u2-angle-001',     // integer
      'g4-s1-u2-angle-002',     // multiple_choice
      'g4-s1-u3-mul-div-009',   // symbol
      'g4-s2-u1-fraction-011',  // fraction
      'g5-s1-u3-correspond-003', // integer (5학년)
      'g5-s1-u3-correspond-002', // multiple_choice (5학년)
    ]

    for (const id of submitTargets) {
      const problem = allProblems.find(p => p.id === id)
      if (!problem) continue

      const ok = await goToProblem(page, id)
      if (!ok) continue

      const inputOk = await inputAnswer(page, problem as Record<string, unknown>)
      if (!inputOk) {
        console.log(`  ⚠ [${id}] 정답 입력 불가 (answerType: ${problem.answerType})`)
        await page.screenshot({ path: SS(`${id}-no-input`), fullPage: false })
        continue
      }

      // 제출 버튼 활성화 확인
      const submitBtn = page.getByRole('button', { name: /정답 제출하기/ })
      const isDisabled = await submitBtn.getAttribute('disabled')

      if (isDisabled !== null) {
        console.log(`  ✗ [${id}] 제출 버튼 여전히 비활성 — 입력 인식 실패`)
        await page.screenshot({ path: SS(`${id}-submit-disabled`), fullPage: false })
        continue
      }

      await submitBtn.click()
      await page.waitForTimeout(1500)

      // 결과 화면 진입 확인
      const resultText = await page.locator('body').innerText().catch(() => '')
      const isResultPage = resultText.includes('정답이에요') || resultText.includes('아쉬워요') || resultText.includes('퀘스트 완료')

      await page.screenshot({ path: SS(`${id}-result`), fullPage: false })

      console.log(`  ${isResultPage ? '✓' : '✗'} [${id}] 결과 화면: ${isResultPage ? (resultText.includes('정답이에요') ? '정답' : '오답') : '미진입'}`)
      expect(isResultPage, `${id} — 결과 화면 미진입`).toBe(true)

      // 결과화면에서 풀이 과정 표시 확인
      if (isResultPage) {
        const hasSteps = resultText.includes('풀이 과정')
        const hasConceptTip = resultText.includes('핵심 개념') || resultText.includes('오늘의 팁')
        console.log(`    └ 풀이과정: ${hasSteps ? '✓' : '✗'} | 개념팁: ${hasConceptTip ? '✓' : '✗'}`)

        // steps 내용이 빈칸(undefined)인지 확인
        const bodyHtml = await page.locator('body').innerHTML().catch(() => '')
        const hasUndefined = bodyHtml.includes('>undefined<') || bodyHtml.includes('undefined')
        if (hasUndefined) {
          console.log(`    └ ⚠ 'undefined' 텍스트 감지 — steps 구조 불일치 가능성`)
        }
      }

      // 다음 테스트를 위해 홈으로
      await page.goto('/home')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }
  })

  test('미지원 answerType 문제 동작 확인 (number/short_answer)', async ({ page }) => {
    await completeOnboarding(page)

    const unsupportedTargets = [
      { id: 'g5-s2-u3-point-sym-count-001', type: 'number' },
      { id: 'g5-s2-u6-prob-zero-001',        type: 'short_answer' },
      { id: 'g5-s1-u1-mixed-001',            type: 'number' },
      { id: 'g5-s1-u6-perimeter-001',        type: 'number' },
    ]

    for (const { id, type } of unsupportedTargets) {
      const problem = allProblems.find(p => p.id === id)
      if (!problem) continue

      const ok = await goToProblem(page, id)
      if (!ok) continue

      const bodyText = await page.locator('body').innerText().catch(() => '')
      const bodyHtml = await page.locator('body').innerHTML().catch(() => '')

      // 렌더링 오류 없이 표시되는지
      const hasError = bodyText.includes('오류가 발생') || bodyText.trim() === ''

      // 어떤 입력 UI가 표시되는지 확인
      const hasFractionUI = await page.locator('text=/분자|분모/').first().isVisible().catch(() => false)
      const hasKeypad = await page.locator('button').filter({ hasText: '1' }).first().isVisible().catch(() => false)
      const hasChoices = await page.locator('button').filter({ hasText: /①|②|③/ }).first().isVisible().catch(() => false)
      const hasTextInput = await page.locator('textarea, input[type=text]').first().isVisible().catch(() => false)

      await page.screenshot({ path: SS(`unsupported-${type}-${id.split('-').slice(-2).join('-')}`), fullPage: false })

      console.log(`  [${type}] ${id}:`)
      console.log(`    렌더링 오류: ${hasError ? '✗' : '✓'}`)
      console.log(`    표시된 UI: fraction=${hasFractionUI}, keypad=${hasKeypad}, choice=${hasChoices}, text=${hasTextInput}`)
      console.log(`    → ${type} 타입이 미지원이라 ${hasFractionUI ? 'fraction으로 fallback됨 (정답 제출 불가)' : '다른 UI'}`)

      expect(hasError, `${id} — 렌더링 오류`).toBe(false)
    }
  })
})

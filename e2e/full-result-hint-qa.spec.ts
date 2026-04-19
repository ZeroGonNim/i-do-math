/**
 * 결과화면 + 힌트 전수 검수 — answerType별 분리
 */
import { test, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

const raw = JSON.parse(readFileSync(join(process.cwd(), 'public/data/problems-v1.json'), 'utf-8'))
const ALL: Record<string, any>[] = raw.problems
const SS = (name: string) => `e2e/screenshots/qa-result-${name}.png`

async function setup(page: Page) {
  await page.goto('/')
  await page.evaluate(() => new Promise<void>(r => {
    const req = indexedDB.deleteDatabase('IDoMathDB')
    req.onsuccess = req.onerror = req.onblocked = () => r()
  }))
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  await page.locator('input').fill('검수봇')
  await page.getByRole('button', { name: /다음/ }).click()
  const g5 = page.getByRole('button', { name: '5학년' })
  if (await g5.isVisible().catch(() => false)) await g5.click()
  else await page.getByRole('button', { name: '4학년' }).click()
  await page.getByRole('button', { name: /다음/ }).click()
  await page.locator('.grid').first().locator('> *').first().click()
  await page.getByRole('button', { name: /시작하기/ }).click()
  await page.waitForURL('**/home', { timeout: 8000 })
}

async function loadProblem(page: Page, id: string) {
  const prob = ALL.find(p => p.id === id)!
  await page.evaluate((p) => {
    const s = { usr: { problem: p, isRemind: false }, key: `qa-${Date.now()}`, idx: 2 }
    window.history.pushState(s, '', '/problem')
    window.dispatchEvent(new PopStateEvent('popstate', { state: s }))
  }, prob)
  await page.waitForTimeout(800)
  return prob
}

async function checkHint(page: Page, label: string) {
  const hintBtn = page.getByRole('button', { name: /힌트/ })
  await hintBtn.click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: SS(`${label}-hint`) })
  const box = page.locator('text=힌트').first()
  const visible = await box.isVisible().catch(() => false)
  const text = visible ? (await page.locator('.animate-in, [class*="HintBox"], [class*="hint"]').textContent().catch(() => '')) : ''
  console.log(`  힌트: ${visible ? '✅' : '❌'} | "${text?.substring(0,50)}"`)
  await hintBtn.click()
  await page.waitForTimeout(200)
}

async function checkResult(page: Page, label: string) {
  await page.waitForTimeout(600)
  // 정답/오답 팝업 닫기 (탭하면 닫힘)
  await page.mouse.click(390, 300)
  await page.waitForTimeout(400)
  await page.screenshot({ path: SS(`${label}-result`) })

  const bodyText = await page.locator('body').textContent() ?? ''

  // 풀이과정 확인
  const hasSteps = bodyText.includes('풀이') || bodyText.includes('단계') || bodyText.includes('desc')
  const stepsSection = page.locator('section, [class*="step"], [class*="Step"]').first()
  const stepsVis = await stepsSection.isVisible().catch(() => false)

  // 스크롤
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
  await page.waitForTimeout(200)
  await page.screenshot({ path: SS(`${label}-result-steps`) })

  // 결과 판단
  const correct = bodyText.includes('정답') || bodyText.includes('맞')
  const wrong = bodyText.includes('오답') || bodyText.includes('틀')
  const resultText = correct ? '✅ 정답' : wrong ? '❌ 오답' : '⚠ 판정 불명'

  // steps 내용 샘플
  const stepsEl = await page.locator('[class*="step"], [class*="Step"], li, .desc').allTextContents().catch(() => [] as string[])
  const stepsSample = stepsEl.join(' | ').substring(0, 80)

  console.log(`  결과: ${resultText}`)
  console.log(`  풀이과정 섹션: ${stepsVis ? '✅' : '⚠'} | body포함여부: ${hasSteps}`)
  if (stepsSample) console.log(`  steps샘플: "${stepsSample}"`)
  return { correct, hasSteps }
}

// ── 1. integer (4학년) ─────────────────────────────────────────
test('① integer — g4-s1-u2-angle-001 (정답:58)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g4-s1-u2-angle-001')
  await checkHint(page, 'g4-integer')
  await page.screenshot({ path: SS('g4-integer-problem') })
  // 58 입력
  for (const k of ['5','8']) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  await page.getByRole('button', { name: /정답 제출/ }).click()
  await page.waitForURL('**/result', { timeout: 8000 })
  await checkResult(page, 'g4-integer')
})

// ── 2. fraction (4학년) ────────────────────────────────────────
test('② fraction — g4-s2-u1-fraction-011 (정답:1/4)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  const prob = await loadProblem(page, 'g4-s2-u1-fraction-011')
  console.log('  문제 answer:', JSON.stringify(prob.answer))
  await checkHint(page, 'g4-fraction')
  await page.screenshot({ path: SS('g4-fraction-problem') })

  const { numerator, denominator } = prob.answer as { numerator: number; denominator: number }
  // 1. 분자 입력 (기본 activeField='numerator')
  for (const k of String(numerator).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  // 2. 분모 버튼('?') 클릭 → denominator 필드로 포커스 이동
  await page.getByRole('button', { name: '?', exact: true }).first().click()
  await page.waitForTimeout(100)
  // 3. 분모 입력
  for (const k of String(denominator).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(200)
  await page.screenshot({ path: SS('g4-fraction-input') })

  const submitBtn = page.getByRole('button', { name: /정답 제출/ })
  const enabled = await submitBtn.isEnabled().catch(() => false)
  console.log(`  제출버튼 활성: ${enabled}`)
  if (enabled) {
    await submitBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g4-fraction')
  }
})

// ── 3. multi_blank (4학년) ─────────────────────────────────────
test('③ multi_blank — g4-s1-u2-angle-005 (values:[105,360])', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  const prob = await loadProblem(page, 'g4-s1-u2-angle-005')
  console.log('  문제 answer:', JSON.stringify(prob.answer))
  await checkHint(page, 'g4-multi_blank')
  await page.screenshot({ path: SS('g4-multi_blank-problem') })

  const values = (prob.answer as { values: number[] }).values
  // 1. 첫째 칸(index=0) 입력 — 초기 activeBlankIndex=0
  for (const k of String(values[0]).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  // 2. 둘째 칸('?') 클릭 → activeBlankIndex=1로 이동
  await page.getByRole('button', { name: '?', exact: true }).first().click()
  await page.waitForTimeout(100)
  // 3. 둘째 칸 입력
  for (const k of String(values[1]).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(200)
  await page.screenshot({ path: SS('g4-multi_blank-input') })

  const submitBtn = page.getByRole('button', { name: /정답 제출/ })
  const enabled = await submitBtn.isEnabled().catch(() => false)
  console.log(`  제출버튼 활성: ${enabled}`)
  if (enabled) {
    await submitBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g4-multi_blank')
  }
})

// ── 4. symbol ─────────────────────────────────────────────────
test('④ symbol — g4-s1-u3-mul-div-009 (정답:<)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g4-s1-u3-mul-div-009')
  await checkHint(page, 'g4-symbol')
  await page.screenshot({ path: SS('g4-symbol-problem') })
  await page.getByRole('button', { name: '<', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: /정답 제출/ }).click()
  await page.waitForURL('**/result', { timeout: 8000 })
  await checkResult(page, 'g4-symbol')
})

// ── 5. draw (자가채점) ─────────────────────────────────────────
test('⑤ draw — g4-s1-u2-angle-009 (자가채점)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g4-s1-u2-angle-009')
  await checkHint(page, 'g4-draw')
  await page.screenshot({ path: SS('g4-draw-problem') })
  const selfBtn = page.getByRole('button', { name: /정답 확인/ })
  const visible = await selfBtn.isVisible().catch(() => false)
  console.log(`  정답확인 버튼: ${visible ? '✅' : '❌'}`)
  if (visible) {
    // Phase 1→2: drawing → comparing
    await selfBtn.click()
    const correctBtn = page.getByRole('button', { name: /맞게 그렸어/ })
    await correctBtn.waitFor({ state: 'visible', timeout: 5000 })
    await page.screenshot({ path: SS('g4-draw-comparing') })
    // Phase 2→result: 맞게 그렸어 → navigate('/result')
    await correctBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g4-draw')
  }
})

// ── 6. text (자가채점 — 4학년 패턴) ──────────────────────────
test('⑥ text — g4-s1-u6-pattern-013 (자가채점)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  const prob = await loadProblem(page, 'g4-s1-u6-pattern-013')
  console.log('  answer:', JSON.stringify(prob.answer))
  await checkHint(page, 'g4-text')
  await page.screenshot({ path: SS('g4-text-problem') })
  const selfBtn = page.getByRole('button', { name: /정답 확인/ })
  const visible = await selfBtn.isVisible().catch(() => false)
  console.log(`  정답확인 버튼: ${visible ? '✅' : '❌'}`)
  if (visible) {
    // Phase 1→2: drawing → comparing
    await selfBtn.click()
    const correctBtn = page.getByRole('button', { name: /맞게 그렸어/ })
    await correctBtn.waitFor({ state: 'visible', timeout: 5000 })
    await page.screenshot({ path: SS('g4-text-comparing') })
    // Phase 2→result
    await correctBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g4-text')
  }
})

// ── 7. integer — 5학년 이전 number 타입 ───────────────────────
test('⑦ integer — g5-s2-u3-point-sym-count-001 (이전 number→integer, 정답:2)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g5-s2-u3-point-sym-count-001')
  await checkHint(page, 'g5-was-number')
  await page.screenshot({ path: SS('g5-was-number-problem') })
  await page.getByRole('button', { name: '2', exact: true }).first().click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: /정답 제출/ }).click()
  await page.waitForURL('**/result', { timeout: 8000 })
  await checkResult(page, 'g5-was-number')
})

// ── 8. text — 5학년 이전 short_answer ────────────────────────
test('⑧ text — g5-s2-u6-prob-zero-001 (이전 short_answer→text)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  const prob = await loadProblem(page, 'g5-s2-u6-prob-zero-001')
  console.log('  answer:', JSON.stringify(prob.answer))
  await checkHint(page, 'g5-was-short')
  await page.screenshot({ path: SS('g5-was-short-problem') })
  const selfBtn = page.getByRole('button', { name: /정답 확인/ })
  const visible = await selfBtn.isVisible().catch(() => false)
  console.log(`  정답확인 버튼: ${visible ? '✅' : '❌'}`)
  if (visible) {
    // Phase 1→2: drawing → comparing
    await selfBtn.click()
    const correctBtn = page.getByRole('button', { name: /맞게 그렸어/ })
    await correctBtn.waitFor({ state: 'visible', timeout: 5000 })
    await page.screenshot({ path: SS('g5-was-short-comparing') })
    // Phase 2→result
    await correctBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g5-was-short')
  }
})

// ── 9. fraction — 5학년 ───────────────────────────────────────
test('⑨ fraction — g5-s1-u4-simplify-001', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  const prob = await loadProblem(page, 'g5-s1-u4-simplify-001')
  console.log('  answer:', JSON.stringify(prob.answer))
  await checkHint(page, 'g5-fraction')
  await page.screenshot({ path: SS('g5-fraction-problem') })

  const { numerator, denominator } = prob.answer as { numerator: number; denominator: number }
  // 1. 분자 입력 (기본 activeField='numerator')
  for (const k of String(numerator).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  // 2. 분모 버튼('?') 클릭 → denominator 필드 활성화
  await page.getByRole('button', { name: '?', exact: true }).first().click()
  await page.waitForTimeout(100)
  // 3. 분모 입력
  for (const k of String(denominator).split('')) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(200)
  await page.screenshot({ path: SS('g5-fraction-input') })

  const submitBtn = page.getByRole('button', { name: /정답 제출/ })
  console.log(`  제출버튼 활성: ${await submitBtn.isEnabled().catch(() => false)}`)
  if (await submitBtn.isEnabled().catch(() => false)) {
    await submitBtn.click()
    await page.waitForURL('**/result', { timeout: 8000 })
    await checkResult(page, 'g5-fraction')
  }
})

// ── 10. integer — 5학년 1학기 신규 (steps 변환 검증) ─────────
test('⑩ integer + steps — g5-s1-u1-mixed-001 (정답:3)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g5-s1-u1-mixed-001')
  await checkHint(page, 'g5-s1-integer')
  await page.screenshot({ path: SS('g5-s1-integer-problem') })
  await page.getByRole('button', { name: '3', exact: true }).first().click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: /정답 제출/ }).click()
  await page.waitForURL('**/result', { timeout: 8000 })
  await checkResult(page, 'g5-s1-integer')
})

// ── 11. integer — 5학년 6단원 신규 추가 문제 ─────────────────
test('⑪ integer — g5-s1-u6-perimeter-001 (정답:15)', async ({ page }) => {
  test.setTimeout(60_000)
  await setup(page)
  await loadProblem(page, 'g5-s1-u6-perimeter-001')
  await checkHint(page, 'g5-s1-perimeter')
  await page.screenshot({ path: SS('g5-s1-perimeter-problem') })
  for (const k of ['1','5']) {
    await page.getByRole('button', { name: k, exact: true }).first().click()
    await page.waitForTimeout(80)
  }
  await page.getByRole('button', { name: /정답 제출/ }).click()
  await page.waitForURL('**/result', { timeout: 8000 })
  await checkResult(page, 'g5-s1-perimeter')
})

/**
 * 5학년 1학기 문제 시각적 QA 스펙
 * 온보딩 완료 후 React Router state로 각 유형별 문제를 직접 렌더링
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

const SS = (name: string) => `e2e/screenshots/g5-qa-${name}.png`

const raw = JSON.parse(readFileSync(join(process.cwd(), 'public/data/problems-v1.json'), 'utf-8'))
const allProblems: Record<string, unknown>[] = raw.problems ?? raw

/** 검수할 대표 문제 — 단원 × answerType 대표 샘플 */
const TARGETS = [
  { id: 'g5-s1-u1-mixed-order-001', label: 'U1-integer' },
  { id: 'g5-s1-u1-mixed-order-002', label: 'U1-multiple_choice' },
  { id: 'g5-s1-u2-factors-001',     label: 'U2-integer' },
  { id: 'g5-s1-u2-factors-002',     label: 'U2-multiple_choice' },
  { id: 'g5-s1-u3-correspond-001',  label: 'U3-text' },
  { id: 'g5-s1-u3-correspond-002',  label: 'U3-multiple_choice' },
  { id: 'g5-s1-u4-simplify-001',    label: 'U4-fraction' },
  { id: 'g5-s1-u4-simplify-002',    label: 'U4-multiple_choice' },
  { id: 'g5-s1-u5-add-diff-001',    label: 'U5-fraction' },
  { id: 'g5-s1-u5-add-mixed-001',   label: 'U5-multi_blank' },
  { id: 'g5-s1-u6-polygon-perimeter-001', label: 'U6-integer' },
  { id: 'g5-s1-u6-unit-conv-001',   label: 'U6-multiple_choice' },
]

async function clearDB(page: Page) {
  await page.evaluate(() =>
    new Promise<void>(resolve => {
      const req = indexedDB.deleteDatabase('IDoMathDB')
      req.onsuccess = req.onerror = req.onblocked = () => resolve()
    })
  )
}

/** 온보딩 완료 → /home 까지 */
async function completeOnboarding(page: Page) {
  await page.goto('/')
  await clearDB(page)
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')

  // 이름 입력
  await page.locator('input').fill('QA테스트')
  await page.getByRole('button', { name: /다음/ }).click()

  // 학년 선택 — 5학년이 없으면 4학년으로 (앱에 따라 다름)
  const grade5Btn = page.getByRole('button', { name: '5학년' })
  const grade4Btn = page.getByRole('button', { name: '4학년' })
  if (await grade5Btn.isVisible().catch(() => false)) {
    await grade5Btn.click()
  } else {
    await grade4Btn.click()
  }
  await page.getByRole('button', { name: /다음/ }).click()

  // 캐릭터 선택
  await page.locator('.grid').first().locator('> *').first().click()
  await page.getByRole('button', { name: /시작하기/ }).click()
  await page.waitForURL('**/home', { timeout: 8000 })
  await page.waitForLoadState('networkidle')
}

/** /home 에서 React Router v6 state로 /problem 진입 */
async function goToProblem(page: Page, problemId: string): Promise<boolean> {
  const problem = allProblems.find(p => p.id === problemId)
  if (!problem) {
    console.warn(`건너뜀: ${problemId} — 데이터 없음`)
    return false
  }

  // React Router v6 history state 형식: { usr: {...}, key: '...', idx: N }
  await page.evaluate((prob) => {
    const routerState = { usr: { problem: prob, isRemind: false }, key: `qa-${Date.now()}`, idx: 2 }
    window.history.pushState(routerState, '', '/problem')
    window.dispatchEvent(new PopStateEvent('popstate', { state: routerState }))
  }, problem)

  // 문제 렌더링 대기
  await page.waitForTimeout(1500)
  return true
}

// ─────────────────────────────────────────────────────
// 테스트 실행
// ─────────────────────────────────────────────────────
test.describe('5학년 1학기 문제 화면 검수', () => {

  test('단원별 대표 문제 9종 시각 검수', async ({ page }) => {
    await completeOnboarding(page)

    for (const { id, label } of TARGETS) {
      const problem = allProblems.find(p => p.id === id)
      if (!problem) {
        console.log(`  ⚠ 건너뜀: ${id}`)
        continue
      }

      const ok = await goToProblem(page, id)
      if (!ok) continue

      const bodyText = await page.locator('body').innerText()
      const isError = bodyText.includes('오류가 발생') || bodyText.toLowerCase().includes('undefined')
      const isLoading = bodyText.trim() === '로딩 중...' || bodyText.trim() === ''

      await page.screenshot({ path: SS(label), fullPage: false })

      console.log(`  ${isError || isLoading ? '✗' : '✓'} [${label}] ${id} | answerType: ${problem.answerType}`)

      expect(isError, `${id} — 오류 화면`).toBe(false)
      expect(isLoading, `${id} — 로딩만 표시됨 (문제 미전달)`).toBe(false)
    }
  })
})

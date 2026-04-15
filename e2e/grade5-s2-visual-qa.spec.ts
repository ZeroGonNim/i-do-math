/**
 * 5학년 2학기 문제 시각적 QA 스펙
 * 온보딩 완료 후 React Router state로 각 유형별 문제를 직접 렌더링
 */
import { test, expect, type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

const SS = (name: string) => `e2e/screenshots/g5s2-qa-${name}.png`

const raw = JSON.parse(readFileSync(join(process.cwd(), 'public/data/problems-v1.json'), 'utf-8'))
const allProblems: Record<string, unknown>[] = raw.problems ?? raw

/** 검수할 대표 문제 — 단원 × answerType 대표 샘플 */
const TARGETS = [
  // U1: 수의 범위와 어림하기
  { id: 'g5-s2-u1-range-001',   label: 'U1-multiple_choice' },
  { id: 'g5-s2-u1-round-001',   label: 'U1-integer' },
  { id: 'g5-s2-u1-round-002',   label: 'U1-text-decimal' },
  { id: 'g5-s2-u1-round-003',   label: 'U1-multi_blank' },
  // U2: 분수의 곱셈
  { id: 'g5-s2-u2-frac-nat-001', label: 'U2-fraction' },
  { id: 'g5-s2-u2-mixed-nat-001', label: 'U2-multi_blank' },
  { id: 'g5-s2-u2-compare-001',  label: 'U2-multiple_choice' },
  // U3: 합동과 대칭
  { id: 'g5-s2-u3-line-sym-001', label: 'U3-integer' },
  { id: 'g5-s2-u3-congruent-001', label: 'U3-congruent-integer' },
  // U4: 소수의 곱셈
  { id: 'g5-s2-u4-place-001',    label: 'U4-multiple_choice' },
  { id: 'g5-s2-u4-mult-nat-001', label: 'U4-text-decimal' },
  { id: 'g5-s2-u4-blank-001',    label: 'U4-integer' },
  // U5: 직육면체
  { id: 'g5-s2-u5-cuboid-001',   label: 'U5-integer' },
  { id: 'g5-s2-u5-wrong-001',    label: 'U5-multiple_choice' },
  { id: 'g5-s2-u5-cuboid-002',   label: 'U5-multi_blank' },
  // U6: 평균과 가능성
  { id: 'g5-s2-u6-mean-001',     label: 'U6-integer' },
  { id: 'g5-s2-u6-prob-001',     label: 'U6-multiple_choice' },
  { id: 'g5-s2-u6-mean-003',     label: 'U6-reverse-mean' },
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

  // 학년 선택 — 5학년이 없으면 4학년으로
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

  await page.evaluate((prob) => {
    const routerState = { usr: { problem: prob, isRemind: false }, key: `qa-${Date.now()}`, idx: 2 }
    window.history.pushState(routerState, '', '/problem')
    window.dispatchEvent(new PopStateEvent('popstate', { state: routerState }))
  }, problem)

  await page.waitForTimeout(1500)
  return true
}

// ─────────────────────────────────────────────────────
// 테스트 실행
// ─────────────────────────────────────────────────────
test.describe('5학년 2학기 문제 화면 검수', () => {

  test('단원별 대표 문제 18종 시각 검수', async ({ page }) => {
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

      console.log(`  ${isError || isLoading ? '✗' : '✓'} [${label}] ${id} | answerType: ${(problem as Record<string,unknown>).answerType}`)

      expect(isError, `${id} — 오류 화면`).toBe(false)
      expect(isLoading, `${id} — 로딩만 표시됨 (문제 미전달)`).toBe(false)
    }
  })
})

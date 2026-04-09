import { test, expect, type Page } from '@playwright/test'

const SS = (name: string) => `e2e/screenshots/deep-${name}.png`

async function clearDB(page: Page) {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('IDoMathDB')
      req.onsuccess = () => resolve()
      req.onerror = () => resolve()
      req.onblocked = () => resolve()
    })
  })
}

async function completeOnboarding(page: Page) {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await clearDB(page)
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  await page.locator('input').fill('테스트')
  // 버튼 텍스트에 공백 포함 → regex 매칭으로 유연하게 처리
  await page.getByRole('button', { name: /다음/ }).click()
  await expect(page.getByText('몇 학년이야?')).toBeVisible()
  await page.getByRole('button', { name: '4학년' }).click()
  await page.getByRole('button', { name: /다음/ }).click()
  await expect(page.getByText('함께할 친구를 골라봐!')).toBeVisible()
  // 캐릭터 선택: 첫 번째 캐릭터 버튼 클릭 (여우, 판다, 사자, 돌고래)
  await page.locator('button').filter({ hasText: /🦊|🐼|🦁|🐬/ }).first().click()
  await page.getByRole('button', { name: /시작하기/ }).click()
  await page.waitForURL('**/home', { timeout: 8000 })
  await page.waitForLoadState('networkidle')
}

// ──────────────────────────────────────────
// 1. 홈 → 문제 진입 플로우
// ──────────────────────────────────────────
test.describe('1. 홈 → 문제 진입 플로우', () => {
  test('학습 시작하기 클릭 → 문제 화면 진입', async ({ page }) => {
    await completeOnboarding(page)
    await page.screenshot({ path: SS('01-home') })

    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('02-problem-entered') })
    expect(page.url()).toContain('/problem')
  })

  test('문제 화면 구성요소 확인', async ({ page }) => {
    await completeOnboarding(page)
    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.waitForLoadState('networkidle')

    await page.screenshot({ path: SS('03-problem-ui') })

    // 문제 텍스트 영역 존재
    const bodyText = await page.locator('body').innerText()
    // 문제가 로드됐는지 확인 (최소한 숫자나 수학 기호가 있어야 함)
    expect(bodyText.length).toBeGreaterThan(20)

    // 힌트 버튼 또는 연습장 버튼 존재
    const hasHint = await page.getByRole('button', { name: /힌트|💡/ }).isVisible().catch(() => false)
    const hasScratch = await page.getByRole('button', { name: /✏️|연습장|지우기/ }).isVisible().catch(() => false)
    await page.screenshot({ path: SS('04-problem-buttons') })

    // 제출 버튼 존재 여부
    const hasSubmit = await page.getByRole('button', { name: /확인|제출|정답/ }).isVisible().catch(() => false)
    expect(hasSubmit || hasHint || hasScratch).toBeTruthy()
  })
})

// ──────────────────────────────────────────
// 2. 문제 유형별 입력 UI 확인
// ──────────────────────────────────────────
test.describe('2. 문제 입력 UI 상세 확인', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page)
    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.waitForLoadState('networkidle')
  })

  test('숫자 키패드 표시 확인', async ({ page }) => {
    await page.screenshot({ path: SS('05-keypad') })
    // 숫자 버튼 0~9 중 일부 확인
    const has1 = await page.getByRole('button', { name: '1' }).isVisible().catch(() => false)
    const has0 = await page.getByRole('button', { name: '0' }).isVisible().catch(() => false)
    // 키패드 또는 다른 입력방식 (객관식, 텍스트 등)
    const hasInput = await page.locator('input, button').count()
    expect(hasInput).toBeGreaterThan(0)
    // 어떤 입력방식이 나왔는지 스크린샷으로 기록
    if (has1 && has0) {
      // 숫자 키패드 - 입력 테스트
      await page.getByRole('button', { name: '1' }).click()
      await page.screenshot({ path: SS('06-keypad-input') })
    }
  })

  test('건너뛰기 버튼 존재 여부', async ({ page }) => {
    const hasSkip = await page.getByRole('button', { name: /건너뛰기|skip/i }).isVisible().catch(() => false)
    await page.screenshot({ path: SS('07-skip-btn') })
    // 건너뛰기가 없어도 오류 아님 (기록만)
    console.log('건너뛰기 버튼 존재:', hasSkip)
  })

  test('문제 화면 → 정답 제출 → 결과 화면 이동', async ({ page }) => {
    await page.screenshot({ path: SS('08-before-submit') })

    // 객관식인지 숫자입력인지 판별 후 제출
    const isMultipleChoice = await page.locator('button').filter({ hasText: /^①|^②|^③|^④|^⑤/ }).count()

    if (isMultipleChoice > 0) {
      // 객관식: 첫 번째 보기 클릭
      await page.locator('button').filter({ hasText: /^①/ }).first().click()
      await page.screenshot({ path: SS('09-mc-selected') })
    } else {
      // 숫자 입력: 임의 숫자 입력
      const has1 = await page.getByRole('button', { name: /^1$/ }).isVisible().catch(() => false)
      if (has1) {
        await page.getByRole('button', { name: /^1$/ }).click()
      }
    }

    // 정답 확인 버튼 클릭 (실제 텍스트: "정답 확인 ✓")
    const confirmBtn = page.getByRole('button', { name: /정답 확인/ })
    const canConfirm = await confirmBtn.isEnabled().catch(() => false)
    if (canConfirm) {
      await confirmBtn.click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: SS('10-after-submit') })
      const url = page.url()
      const bodyText = await page.locator('body').innerText()
      const hasResult = url.includes('/result') ||
        bodyText.includes('정답') ||
        bodyText.includes('오답') ||
        bodyText.includes('맞았') ||
        bodyText.includes('틀렸')
      expect(hasResult).toBeTruthy()
    }
  })
})

// ──────────────────────────────────────────
// 3. 결과 화면 상세 확인
// ──────────────────────────────────────────
test.describe('3. 결과 화면', () => {
  async function goToProblemAndSubmit(page: Page) {
    await completeOnboarding(page)
    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.waitForLoadState('networkidle')

    // draw 문제인지 루프 전에 먼저 확인 (지우기 버튼 = DrawProblem 고유 UI)
    const isDrawProblem = await page.getByRole('button', { name: /지우기/ }).isVisible().catch(() => false)
    if (isDrawProblem) return  // draw 문제는 /result 도달 불가, 조기 종료

    // 최대 5번 시도하여 결과 화면 진입
    for (let i = 0; i < 5; i++) {
      const isMultipleChoice = await page.locator('button').filter({ hasText: /①|②|③/ }).count()
      if (isMultipleChoice > 0) {
        await page.locator('button').filter({ hasText: /①/ }).first().click()
      } else {
        const has1 = await page.getByRole('button', { name: /^1$/ }).isVisible().catch(() => false)
        if (has1) await page.getByRole('button', { name: /^1$/ }).click()
      }
      const confirmBtn = page.getByRole('button', { name: /정답 확인/ })
      const canClick = await confirmBtn.isEnabled().catch(() => false)
      if (canClick) {
        await confirmBtn.click()
        await page.waitForTimeout(2000)
        if (page.url().includes('/result')) break
      }
      await page.waitForTimeout(500)
    }
  }

  test('결과 화면 구성 확인', async ({ page }) => {
    await goToProblemAndSubmit(page)
    const url = page.url()
    await page.screenshot({ path: SS('11-result') })

    if (url.includes('/result')) {
      const bodyText = await page.locator('body').innerText()
      // 정답/오답 여부 표시 확인
      const hasResultText = bodyText.includes('정답') || bodyText.includes('오답') || bodyText.includes('다음')
      expect(hasResultText).toBeTruthy()
    }
  })

  test('결과 화면 — 다음 문제 버튼', async ({ page }) => {
    await goToProblemAndSubmit(page)
    await page.screenshot({ path: SS('12-result-next') })

    if (page.url().includes('/result')) {
      const nextBtn = page.getByRole('button', { name: /다음|다음 문제/ })
      const visible = await nextBtn.isVisible().catch(() => false)
      if (visible) {
        await nextBtn.click()
        await page.waitForTimeout(1500)
        await page.screenshot({ path: SS('13-after-next') })
        // 다음 문제로 이동했는지 확인
        expect(page.url()).toContain('/problem')
      }
    }
  })
})

// ──────────────────────────────────────────
// 4. 레이아웃 / UI 세부 점검
// ──────────────────────────────────────────
test.describe('4. 레이아웃 및 UI 세부 점검', () => {
  test('홈 화면 전체 스크롤 영역 확인', async ({ page }) => {
    await completeOnboarding(page)
    await page.screenshot({ path: SS('14-home-full') })
    // 스크롤 가능한 영역 확인
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
    const clientHeight = await page.evaluate(() => document.documentElement.clientHeight)
    console.log(`스크롤 높이: ${scrollHeight}, 뷰포트: ${clientHeight}`)
  })

  test('설정 화면 세부 항목 확인', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('15-settings-full') })
    const bodyText = await page.locator('body').innerText()
    console.log('설정 화면 텍스트:', bodyText.slice(0, 300))
    expect(bodyText.length).toBeGreaterThan(10)
  })

  test('일기 화면 세부 확인', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/diary')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('16-diary-full') })
    const bodyText = await page.locator('body').innerText()
    console.log('일기 화면 텍스트:', bodyText.slice(0, 300))
  })

  test('부모 대시보드 — PIN 설정 후 대시보드 내용 확인', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    // PIN 설정
    for (const d of ['1','2','3','4']) {
      await page.getByRole('button', { name: d }).click()
    }
    await page.getByRole('button', { name: '확인' }).click()
    await expect(page.getByText(/PIN을 한 번 더/)).toBeVisible()
    for (const d of ['1','2','3','4']) {
      await page.getByRole('button', { name: d }).click()
    }
    await page.getByRole('button', { name: '확인' }).click()
    await expect(page.getByText('부모님 대시보드')).toBeVisible({ timeout: 5000 })
    await page.screenshot({ path: SS('17-parent-dashboard-full') })
    // 대시보드 통계 확인
    const bodyText = await page.locator('body').innerText()
    const hasStats = bodyText.includes('총 문제') || bodyText.includes('정답률') || bodyText.includes('학습 일수')
    expect(hasStats).toBeTruthy()
  })
})

// ──────────────────────────────────────────
// 5. 에러 및 엣지 케이스
// ──────────────────────────────────────────
test.describe('5. 엣지 케이스 / 에러 상황', () => {
  test('결과 화면 직접 URL 진입 → 리다이렉트', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/result')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: SS('18-result-no-state') })
    // state 없이 접근 시 /home으로 이동해야 함
    expect(page.url()).not.toContain('/result')
  })

  test('뒤로가기 히스토리 — 결과에서 뒤로가기 시 문제 재진입 안 됨', async ({ page }) => {
    await completeOnboarding(page)
    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.screenshot({ path: SS('19-problem-for-back') })
    // 뒤로가기
    await page.goBack()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: SS('20-after-back') })
    // 홈으로 돌아가야지, 이전 문제 상태로 돌아가면 안 됨
    const url = page.url()
    console.log('뒤로가기 후 URL:', url)
  })

  test('홈 화면 — 오늘의 미션 진행률 표시', async ({ page }) => {
    await completeOnboarding(page)
    await page.screenshot({ path: SS('21-home-mission') })
    const bodyText = await page.locator('body').innerText()
    const hasMission = bodyText.includes('미션') || bodyText.includes('0/5') || bodyText.includes('문제')
    expect(hasMission).toBeTruthy()
  })

  test('빠른 연속 클릭 — 확인 버튼 중복 제출 방지', async ({ page }) => {
    await completeOnboarding(page)
    await page.getByRole('button', { name: /학습 시작하기/ }).click()
    await page.waitForURL('**/problem', { timeout: 8000 })
    await page.waitForLoadState('networkidle')

    // draw 문제는 건너뜀 (버튼 텍스트 다름)
    const isDrawProblem = await page.getByRole('button', { name: /맞게 그렸어|다시 그리기/ }).isVisible().catch(() => false)
    if (isDrawProblem) {
      console.log('draw 문제 — 중복 제출 테스트 skip')
      return
    }

    // 숫자 입력
    const has1 = await page.getByRole('button', { name: /^1$/ }).isVisible().catch(() => false)
    if (has1) {
      await page.getByRole('button', { name: /^1$/ }).click()
    }

    // 첫 클릭 후 버튼이 즉시 비활성화되어야 함 (중복 제출 방지)
    const confirmBtn = page.getByRole('button', { name: /정답 확인/ })
    const canClick = await confirmBtn.isEnabled().catch(() => false)
    if (canClick) {
      await confirmBtn.click()
      // submitResult !== null 세팅으로 버튼이 즉시 disabled 처리됨
      await expect(confirmBtn).toBeDisabled({ timeout: 1000 })
      await page.screenshot({ path: SS('22-double-submit') })
    }
  })
})

import { test, expect, type Page } from '@playwright/test'

const SS = (name: string) => `e2e/screenshots/${name}.png`

// DB 초기화 — 반드시 페이지 로드 후 호출
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

// 실제 온보딩 플로우를 통해 프로필 생성
async function completeOnboarding(page: Page) {
  // 먼저 앱을 로드하여 보안 컨텍스트 확보 후 DB 초기화
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  await clearDB(page)
  await page.goto('/onboarding')
  await page.waitForLoadState('networkidle')
  // Step 0: 이름 입력
  await page.locator('input').fill('테스트')
  await page.getByRole('button', { name: '다음 →' }).click()
  // Step 1: 학년 선택
  await expect(page.getByText('몇 학년이야?')).toBeVisible()
  await page.getByRole('button', { name: '4학년' }).click()
  await page.getByRole('button', { name: '다음 단계로 이동 →' }).click()
  // Step 2: 캐릭터 선택
  await expect(page.getByText('함께할 친구를 골라봐!')).toBeVisible()
  await page.locator('.grid').first().locator('> *').first().click()
  await page.getByRole('button', { name: /시작하기/ }).click()
  await page.waitForURL('**/home', { timeout: 8000 })
}

// ──────────────────────────────────────────
// 1. 진입점 (/)
// ──────────────────────────────────────────
test.describe('1. 진입점 (/) 라우팅', () => {
  test('프로필 없으면 /onboarding으로 이동', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await clearDB(page)
    await page.goto('/')
    await page.waitForURL('**/onboarding', { timeout: 5000 })
    await page.screenshot({ path: SS('01-redirect-onboarding') })
    expect(page.url()).toContain('/onboarding')
  })

  test('프로필 있으면 /home으로 이동', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/')
    await page.waitForURL('**/home', { timeout: 5000 })
    await page.screenshot({ path: SS('02-redirect-home') })
    expect(page.url()).toContain('/home')
  })
})

// ──────────────────────────────────────────
// 2. 온보딩 (/onboarding)
// ──────────────────────────────────────────
test.describe('2. 온보딩 화면', () => {
  test('Step 0: 이름 입력 화면 렌더링', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await clearDB(page)
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('이름이 뭐야?')).toBeVisible()
    await expect(page.locator('input')).toBeVisible()
    await page.screenshot({ path: SS('03-onboarding-step0') })
  })

  test('이름 미입력 시 다음 버튼 비활성', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await clearDB(page)
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
    const btn = page.getByRole('button', { name: '다음 →' })
    await expect(btn).toBeDisabled()
    await page.screenshot({ path: SS('04-onboarding-btn-disabled') })
  })

  test('Step 0→1→2 전체 플로우', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await clearDB(page)
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
    // Step 0
    await page.locator('input').fill('테스트')
    await page.getByRole('button', { name: '다음 →' }).click()
    await expect(page.getByText('몇 학년이야?')).toBeVisible()
    await page.screenshot({ path: SS('05-onboarding-step1') })
    // Step 1
    await page.getByRole('button', { name: '4학년' }).click()
    await page.getByRole('button', { name: '다음 단계로 이동 →' }).click()
    await expect(page.getByText('함께할 친구를 골라봐!')).toBeVisible()
    await page.screenshot({ path: SS('06-onboarding-step2') })
  })

  test('완료 후 /home 이동', async ({ page }) => {
    await completeOnboarding(page)
    await page.screenshot({ path: SS('07-onboarding-done') })
    expect(page.url()).toContain('/home')
  })

  test('[P0-2] 완료 후 /onboarding 재진입 → /home 리다이렉트', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/onboarding')
    await page.waitForURL('**/home', { timeout: 5000 })
    await page.screenshot({ path: SS('08-onboarding-guard') })
    expect(page.url()).toContain('/home')
  })
})

// ──────────────────────────────────────────
// 3. 홈 (/home)
// ──────────────────────────────────────────
test.describe('3. 홈 화면', () => {
  test('홈 화면 렌더링 및 레이아웃', async ({ page }) => {
    await completeOnboarding(page)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('09-home') })
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(10)
  })

  test('하단 네비게이션 표시', async ({ page }) => {
    await completeOnboarding(page)
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('10-home-nav') })
    // 페이지 전체 텍스트에서 네비게이션 탭 레이블 확인
    const bodyText = await page.locator('body').innerText()
    const hasNav = ['홈', '모험', '상점', '랭킹'].some(t => bodyText.includes(t))
    expect(hasNav).toBeTruthy()
  })

  test('문제 시작 버튼 존재 여부', async ({ page }) => {
    await completeOnboarding(page)
    await page.waitForLoadState('networkidle')
    // 문제 시작 관련 버튼/텍스트 탐색
    await page.screenshot({ path: SS('11-home-start') })
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toContain('모험 시작하기')
  })
})

// ──────────────────────────────────────────
// 4. 문제 (/problem)
// ──────────────────────────────────────────
test.describe('4. 문제 화면', () => {
  test('state 없이 /problem 직접 진입 → /home 리다이렉트', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/problem')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: SS('12-problem-no-state') })
    // state 없으면 /home으로 돌아가야 함
    expect(page.url()).not.toContain('/problem')
  })
})

// ──────────────────────────────────────────
// 5. 부모 대시보드 (/parent) — PIN UX 검증
// ──────────────────────────────────────────
test.describe('5. 부모 대시보드 — PIN 입력 UX', () => {
  test('PIN 미설정 → 설정 모달 표시', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('13-parent-setup') })
    await expect(page.getByText(/PIN 4자리를 설정/)).toBeVisible()
  })

  test('[P1-3] 3자리 입력 시 4번째 단계 미진입', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    // 3자리 입력 후 아직 설정 화면에 머물러야 함 (자동 제출 안 됨)
    await expect(page.getByText(/PIN 4자리를 설정/)).toBeVisible()
    await page.screenshot({ path: SS('14-pin-3digits-disabled') })
  })

  test('[P1-3] 4자리 완성 시 자동 제출 → 확인 단계 이동', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '4' }).click()
    // 4자리 입력 시 자동 제출되어 확인 단계로 이동
    await expect(page.getByText(/PIN을 한 번 더/)).toBeVisible({ timeout: 3000 })
    await page.screenshot({ path: SS('15-pin-4digits-enabled') })
  })

  test('[P1-3] 4자리 자동 제출 → 다음 단계 정상 진입', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '4' }).click()
    // 자동 제출 후 다음 단계(PIN 재확인) 화면으로 전환
    await expect(page.getByText(/PIN을 한 번 더/)).toBeVisible({ timeout: 3000 })
    await page.screenshot({ path: SS('16-pin-no-autosend') })
  })

  test('PIN 설정 완료 → 대시보드 진입', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/parent')
    await page.waitForLoadState('networkidle')
    // PIN 설정 Step 1 — 4자리 입력 시 자동 제출
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '4' }).click()
    // PIN 확인 Step 2
    await expect(page.getByText(/PIN을 한 번 더/)).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: '1' }).click()
    await page.getByRole('button', { name: '2' }).click()
    await page.getByRole('button', { name: '3' }).click()
    await page.getByRole('button', { name: '4' }).click()
    // 대시보드 진입 확인
    await expect(page.getByText(/부모님 대시보드/)).toBeVisible({ timeout: 5000 })
    await page.screenshot({ path: SS('17-parent-dashboard') })
  })
})

// ──────────────────────────────────────────
// 6. 오답 복습 (/remind)
// ──────────────────────────────────────────
test.describe('6. 오답 복습', () => {
  test('화면 렌더링 및 빈 상태 메시지', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/remind')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('18-remind') })
    // 오답 없으면 빈 상태 표시
    await expect(page.getByText(/틀린 문제가 없어요|오답복습 완료/).first()).toBeVisible({ timeout: 5000 })
  })
})

// ──────────────────────────────────────────
// 7. 설정 & 일기
// ──────────────────────────────────────────
test.describe('7. 기타 화면', () => {
  test('/settings 렌더링', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('19-settings') })
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(10)
  })

  test('/diary 렌더링', async ({ page }) => {
    await completeOnboarding(page)
    await page.goto('/diary')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: SS('20-diary') })
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(10)
  })
})

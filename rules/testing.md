# 테스트 규칙

---

## 1. 도구

- 단위/통합: **Vitest** + **Testing Library**
- E2E: **Playwright** (필요 시)
- API 모킹: **MSW (Mock Service Worker)**

---

## 2. 필수 테스트 범위

| 대상 | 필수 여부 | 비고 |
|---|---|---|
| 유틸 함수 | ✅ 필수 | 순수 함수 — 입력/출력 기반 테스트 |
| 커스텀 훅 | ✅ 필수 | `renderHook`으로 상태 변화 검증 |
| API 서비스 | ✅ 필수 | MSW로 모킹하여 요청/응답 검증 |
| UI 컴포넌트 | 🔶 선택 | 사용자 인터랙션이 복잡한 경우에 작성 |
| E2E | 🔶 선택 | 핵심 비즈니스 플로우에 한정 |

---

## 3. 테스트 컨벤션

### 3-1. 파일 위치

`__tests__/대상파일명.test.ts(x)` 또는 동일 디렉토리 내 `대상.test.ts`

### 3-2. 구조

```ts
// ❌ BAD — 모호한 테스트 서술
describe('utils', () => {
  it('works', () => { /* ... */ });
  it('test 1', () => { /* ... */ });
});

// ✅ GOOD — 대상 + 행위 기반 서술
describe('formatCurrency', () => {
  it('양수 금액을 원화 형식으로 변환한다', () => {
    expect(formatCurrency(1000)).toBe('₩1,000');
  });

  it('0이면 "₩0"을 반환한다', () => {
    expect(formatCurrency(0)).toBe('₩0');
  });

  it('음수 금액에 마이너스 기호를 포함한다', () => {
    expect(formatCurrency(-500)).toBe('-₩500');
  });
});
```

### 3-3. 커스텀 훅 테스트

```ts
// ✅ GOOD — renderHook으로 상태 변화 검증
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increment 호출 시 count가 1 증가한다', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### 3-4. API 서비스 테스트 (MSW)

```ts
// ✅ GOOD — MSW로 API 모킹
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

describe('userApi.getUsers', () => {
  it('사용자 목록을 정상적으로 반환한다', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json([{ id: '1', name: '홍길동' }])
      )
    );

    const users = await userApi.getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('홍길동');
  });

  it('서버 에러 시 ApiError를 throw한다', async () => {
    server.use(
      http.get('/api/users', () =>
        HttpResponse.json({ code: 'SERVER_ERROR', message: '서버 오류' }, { status: 500 })
      )
    );

    await expect(userApi.getUsers()).rejects.toMatchObject({
      code: 'SERVER_ERROR',
    });
  });
});
```

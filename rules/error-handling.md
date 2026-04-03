# 에러 핸들링 규칙

---

## 1. 기본 원칙

- 모든 비동기 호출은 `try/catch`로 감싸며, 에러 타입을 구분한다.
- 엣지 케이스(null, undefined, 빈 배열 등)를 방어적으로 처리한다.

---

## 2. API 에러 표준 구조

```ts
interface ApiError {
  code: string;        // 'AUTH_EXPIRED' | 'VALIDATION_FAILED' | ...
  message: string;     // 사용자에게 표시할 메시지
  details?: unknown;   // 디버깅용 추가 정보 (로깅 전용, UI 노출 금지)
}
```

```ts
// ❌ BAD — 에러 타입 미구분, 사용자에게 raw 에러 노출
try {
  await api.createUser(data);
} catch (e) {
  alert(e.message); // 서버 에러 메시지 그대로 노출
}

// ✅ GOOD — 에러 타입 구분 + 사용자 친화 메시지
try {
  await api.createUser(data);
} catch (error) {
  if (isApiError(error)) {
    switch (error.code) {
      case 'VALIDATION_FAILED':
        toast.error('입력 정보를 확인해주세요.');
        break;
      case 'AUTH_EXPIRED':
        await refreshToken();
        break;
      default:
        toast.error('문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  } else {
    toast.error('네트워크 연결을 확인해주세요.');
    console.error('[UnexpectedError]', error);
  }
}
```

---

## 3. Error Boundary

- **페이지 단위**: 각 라우트 최상단에 배치.
- **섹션 단위**: 독립적인 위젯/카드 영역에 개별 Boundary를 적용하여 부분 장애를 격리.
- fallback UI는 **"다시 시도" 버튼**을 반드시 포함한다.

```tsx
// ❌ BAD — 앱 전체에 단일 Error Boundary만 존재
<ErrorBoundary>
  <App />       {/* 어디서든 에러 발생 시 전체 앱 다운 */}
</ErrorBoundary>

// ✅ GOOD — 페이지 + 섹션 단위 격리
<ErrorBoundary fallback={<PageErrorFallback />}>
  <DashboardPage>
    <ErrorBoundary fallback={<WidgetErrorFallback />}>
      <RevenueChart />   {/* 차트 에러 시 차트만 fallback */}
    </ErrorBoundary>
    <ErrorBoundary fallback={<WidgetErrorFallback />}>
      <UserActivity />   {/* 독립적으로 격리 */}
    </ErrorBoundary>
  </DashboardPage>
</ErrorBoundary>
```

---

## 4. TanStack Query 에러 전략

| 설정 | GET 요청 | 뮤테이션 |
|---|---|---|
| `retry` | 최대 2회 | 0회 |
| 에러 피드백 | `onError`에서 토스트/알림 | `onError`에서 토스트/알림 |
| 401 처리 | 글로벌 인터셉터에서 토큰 갱신 → 실패 시 로그아웃 | 동일 |

```ts
// ... (기존 코드 생략)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        if (isApiError(error)) {
          toast.error(error.message);
        }
      },
    },
  },
});
```

---

## 5. 과학적 디버깅 (Scientific Debugging)

버그 수정 요청 시 AI는 반드시 아래 4단계를 거친다:

1.  **Hypothesis (가설 수립)**: 에러 로그와 코드를 분석하여 발생 원인에 대한 가설을 세운다.
2.  **Reproduction (재현 테스트 작성)**: 가설을 증명하기 위해 실패하는 테스트 케이스(`Red`)를 작성한다. 테스트에서 재현되지 않으면 가설을 수정한다.
3.  **Root Cause Analysis (근본 원인 분석)**: 테스트가 실패하는 지점을 추적하여 정확한 문제의 원인을 파악한다.
4.  **Fix & Verify (수정 및 검증)**: 문제를 수정하고 작성한 재현 테스트가 통과(`Green`)하는지 확인한다. 관련된 다른 테스트에 영향이 없는지 전수 검사한다.

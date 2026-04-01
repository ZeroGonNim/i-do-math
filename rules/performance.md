# 성능 최적화 규칙

> 핵심 원칙: **측정 후 적용**. 무분별한 최적화는 오히려 성능을 해친다.

---

## 1. React 렌더링

### 1-1. 메모이제이션 판단 기준

| 도구 | 적용 대상 | 비적용 대상 |
|---|---|---|
| `React.memo` | 리스트 아이템, props 빈번히 동일 | 항상 다른 props를 받는 컴포넌트 |
| `useMemo` | 연산 비용 큰 파생 데이터 (필터, 정렬, 집계) | 단순 값 참조 |
| `useCallback` | 자식에 전달하는 핸들러 함수 | 로컬에서만 사용하는 함수 |

```tsx
// ❌ BAD — 불필요한 메모이제이션
const userName = useMemo(() => user.name, [user.name]); // 연산 비용 없음
const handleClick = useCallback(() => setOpen(true), []); // 자식에 전달하지 않음

// ✅ GOOD — 측정 근거가 있는 메모이제이션
// 1000+ 아이템 목록에서 필터링 연산
const filteredItems = useMemo(
  () => items.filter(item => item.name.includes(search)).sort((a, b) => a.price - b.price),
  [items, search]
);

// memo된 자식 컴포넌트에 전달하는 핸들러
const handleItemClick = useCallback((id: string) => {
  navigate(`/items/${id}`);
}, [navigate]);
```

---

## 2. 번들 & 로딩

### 2-1. 코드 스플리팅

라우트 단위로 `React.lazy` + `Suspense` 적용.

```tsx
// ✅ GOOD
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</Suspense>
```

### 2-2. 이미지 최적화

- `loading="lazy"` 기본 적용.
- WebP/AVIF 포맷 우선.
- 반응형 `srcset` 적용.

### 2-3. 서드파티 관리

- tree-shaking 가능 여부 확인 후 도입.
- `vite-plugin-visualizer` 등으로 번들 크기 주기적 점검.

---

## 3. 캐싱

- TanStack Query `staleTime` → `rules/state.md` §2-2 참조.
- 정적 에셋: 빌드 해시 + `Cache-Control: immutable` 활용.

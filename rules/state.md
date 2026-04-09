# 상태 관리 규칙

> ⚠️ **[프로젝트 오버라이드]** 이 프로젝트는 외부 API 서버 없음. TanStack Query 미사용.
> - "서버 상태" = Dexie.js (IndexedDB)에서 읽어온 로컬 데이터
> - DB 조작은 Repository 패턴 (`src/shared/db/`) 으로만 접근. Zustand에 복제 금지.
> - 아래 TanStack Query 예제는 패턴 참고용으로만 활용한다.

> 서버 상태와 클라이언트 상태를 **절대 혼용하지 않는다.**

---

## 1. 핵심 경계

| 구분 | 도구 | 대상 |
|---|---|---|
| 서버 상태 | TanStack Query | API 데이터, 캐싱, 뮤테이션 |
| 클라이언트 상태 | Zustand | 모달, 사이드바, 테마, 로컬 필터 |

---

## 2. TanStack Query — 서버 상태 전용

### 2-1. 기본 규칙

- `staleTime`, `gcTime`을 도메인별로 적절히 설정한다.
- Query Key는 배열 형태로 계층 구조를 유지한다.
- 뮤테이션 후 관련 쿼리 `invalidateQueries`를 반드시 호출한다.

```ts
// ✅ GOOD — 계층적 Query Key
const userKeys = {
  all:    ['users'] as const,
  lists:  () => [...userKeys.all, 'list'] as const,
  list:   (filters: Filters) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

// 뮤테이션 후 invalidate
const updateUser = useMutation({
  mutationFn: api.updateUser,
  onSuccess: (_, { id }) => {
    queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  },
});
```

### 2-2. staleTime 가이드

| 도메인 | staleTime | 근거 |
|---|---|---|
| 사용자 프로필 | 5분 | 자주 변경되지 않음 |
| 설정/환경 | 30분 | 거의 변경되지 않음 |
| 실시간 데이터 (알림 등) | 0 | 항상 최신 필요 |
| 목록 (게시글, 상품) | 1~2분 | 적절한 균형 |

---

## 3. Zustand — 클라이언트 UI 상태 전용

### 3-1. 기본 규칙

- **서버와 무관한 UI 상태**만 관리한다.
- 스토어는 도메인별로 분리한다.
- `persist` 미들웨어 사용 시, `partialize`로 저장 대상을 명시한다.

### 3-2. Bad/Good 패턴

```ts
// ❌ BAD — 서버 데이터를 Zustand에 복제
const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  fetchUsers: async () => {
    set({ isLoading: true });
    const data = await api.getUsers();
    set({ users: data, isLoading: false }); // 서버 상태를 클라이언트 스토어에 복제
  },
}));

// ✅ GOOD — 서버 상태는 TanStack Query, UI 상태만 Zustand
// hooks/useUsers.ts (서버 상태)
export const useUsers = () =>
  useQuery({
    queryKey: userKeys.lists(),
    queryFn: api.getUsers,
    staleTime: 2 * 60 * 1000,
  });

// stores/useUIStore.ts (클라이언트 상태)
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
```

### 3-3. persist 사용 시

```ts
// ❌ BAD — 전체 스토어를 persist
const useSettingsStore = create(
  persist((set) => ({ theme: 'light', tempFilter: '' }), {
    name: 'settings',
  })
);

// ✅ GOOD — partialize로 필요한 필드만 persist
const useSettingsStore = create(
  persist<SettingsStore>(
    (set) => ({
      theme: 'light',
      tempFilter: '', // 이건 persist 불필요
    }),
    {
      name: 'settings',
      partialize: (state) => ({ theme: state.theme }), // theme만 저장
    }
  )
);
```

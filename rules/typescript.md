# TypeScript & 코드 스타일 규칙

---

## 1. TypeScript 핵심 규칙

### 1-1. `any` 금지

```ts
// ❌ BAD
function parseData(data: any) {
  return data.name.toUpperCase();
}

// ✅ GOOD — unknown + 타입 가드
function parseData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    const { name } = data as { name: string }; // ASSERT: 타입 가드 통과 후 안전한 단언
    return name.toUpperCase();
  }
  throw new Error('Invalid data format');
}
```

### 1-2. `as` 타입 단언 최소화

사용이 불가피한 경우 반드시 `// ASSERT: 사유` 주석을 단다.

```ts
// ❌ BAD — 근거 없는 단언
const user = response.data as User;

// ✅ GOOD — Zod로 런타임 검증 후 타입 추론
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(response.data);
```

### 1-3. Enum 대신 `as const`

```ts
// ❌ BAD
enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

// ✅ GOOD
const STATUS = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
} as const;
type Status = typeof STATUS[keyof typeof STATUS]; // 'ACTIVE' | 'INACTIVE'
```

### 1-4. 유틸리티 타입 활용

```ts
// ❌ BAD — 중복 타입 정의
interface UserCreate {
  name: string;
  email: string;
}
interface UserUpdate {
  name?: string;
  email?: string;
}

// ✅ GOOD — 유틸리티 타입으로 파생
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
type UserCreate = Pick<User, 'name' | 'email'>;
type UserUpdate = Partial<UserCreate>;
```

---

## 2. 코드 스타일

### 2-1. 단일 책임 원칙 (SRP)

하나의 파일/함수는 하나의 역할만 수행한다.

### 2-2. 컴포넌트 파일 최대 200줄

초과 시 하위 컴포넌트 또는 커스텀 훅으로 분리한다.

```tsx
// ❌ BAD — 300줄짜리 컴포넌트에 fetch + form + table 로직 혼재
export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({});
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  // ... 300줄의 로직과 JSX
}

// ✅ GOOD — 훅과 컴포넌트 분리
// hooks/useUserList.ts
export function useUserList() {
  return useQuery({ queryKey: ['users'], queryFn: api.getUsers });
}

// components/UserTable.tsx
export function UserTable({ users }: { users: User[] }) { /* 테이블만 */ }

// components/UserFilter.tsx
export function UserFilter({ onFilter }: { onFilter: (v: string) => void }) { /* 필터만 */ }
```

### 2-3. 커스텀 훅 분리 기준

로직이 **3개 이상의 상태(state)** 를 관리하면 훅으로 추출한다.

### 2-4. 깊은 중첩 ≤ 3단계

```ts
// ❌ BAD — 4단계 중첩
if (user) {
  if (user.role === 'admin') {
    if (user.permissions.includes('edit')) {
      if (item.status === 'draft') {
        // 실행 코드
      }
    }
  }
}

// ✅ GOOD — early return
if (!user) return;
if (user.role !== 'admin') return;
if (!user.permissions.includes('edit')) return;
if (item.status !== 'draft') return;
// 실행 코드
```

### 2-5. 주석 원칙

"무엇(what)"이 아닌 **"왜(why)"** 위주로 작성한다.

```ts
// ❌ BAD — what
// 사용자 목록을 필터링한다
const filtered = users.filter(u => u.active);

// ✅ GOOD — why
// 비활성 계정은 과금 대상에서 제외하기 위해 필터링
const filtered = users.filter(u => u.active);
```

---

## 3. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `UserProfileCard.tsx` |
| 커스텀 훅 | useCamelCase | `useAuthSession.ts` |
| 유틸 함수 | camelCase | `formatCurrency.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 타입/인터페이스 | PascalCase | `UserProfile`, `ApiResponse` |
| 디렉토리 | kebab-case | `user-profile/` |

---

## 4. Import 순서

`외부 라이브러리 → 내부 모듈(절대경로) → 타입(import type) → 스타일/에셋`

```ts
// 1. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

// 2. 내부 모듈
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

// 3. 타입
import type { User } from '@/types/user';

// 4. 스타일/에셋
import './styles.css';
```

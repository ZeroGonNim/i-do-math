# Project Structure

> 에이전트는 이 구조를 준수하여 파일을 생성/배치한다.
> 구조 변경은 **파괴적 작업**에 해당하며, 사용자 승인이 필요하다.

---

## 디렉토리 구조

```
project-root/
├── CLAUDE.md              # AI 에이전트 진입점
├── AGENTS.md              # 에이전트 행동 규칙
├── rules/                 # 코드 규칙 (도메인별 분리)
│   ├── typescript.md
│   ├── state.md
│   ├── error-handling.md
│   ├── security.md
│   ├── performance.md
│   ├── testing.md
│   └── git.md
├── docs/                  # 프로젝트 문서
│   ├── ARCHITECTURE.md
│   ├── FOLDER_STRUCTURE.md
│   └── SKILLS_GUIDE.md
├── src/
│   ├── app/               # 라우팅, 프로바이더, 레이아웃
│   │   ├── routes/
│   │   ├── providers/
│   │   └── App.tsx
│   ├── features/          # 도메인별 기능 모듈
│   │   └── [domain]/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api/
│   │       ├── types/
│   │       └── __tests__/
│   ├── shared/            # 공용 모듈
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── services/
│   └── types/             # 글로벌 타입 정의
├── public/
└── package.json
```

---

## Structure Principles

### Feature-Based Structure

각 feature 모듈은 독립적으로 다음을 포함한다:

- **components/** — 해당 도메인의 UI 컴포넌트
- **hooks/** — 비즈니스 로직 훅
- **api/** — API 서비스 및 TanStack Query 훅
- **types/** — 도메인 타입 정의
- **__tests__/** — 테스트 파일

### Shared

여러 feature에서 공통으로 사용하는 모듈:

- **components/** — Button, Modal, Input 등 공용 UI
- **hooks/** — useDebounce, useMediaQuery 등 범용 훅
- **utils/** — formatCurrency, dateUtils 등 유틸 함수
- **services/** — axios 인스턴스, 인터셉터 등

### 파일 배치 원칙

- 하나의 feature에서만 사용 → `features/[domain]/` 내부
- 2개 이상 feature에서 사용 → `shared/`로 이동
- 글로벌 타입 → `types/`

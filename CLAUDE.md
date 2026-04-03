# Project: I Do Math (AI-Partner-Harness v2.5)

> **[RULE PRIORITY]**: `CLAUDE.md §2 (Hard Rules)` > `docs/` > `rules/*.md` > `AGENTS.md` (Process)
> AI 에이전트는 이 계층을 준수하여 충돌을 해결한다.

---

## 1. 프로젝트 요약 & 워크플로우

- **프로젝트**: I Do Math — 초등학생 대상 수학 학습 앱 (4학년 1학기 기준, 200문제)
- **스택**: React 19, TypeScript (strict), Tailwind v4, Dexie.js (IndexedDB), Zustand v5, Yarn
- **진입점**: `CLAUDE.md` → `AGENTS.md` → `rules/hook.md` (Before Hook)
- **핵심**: 모든 T1+ 작업은 **"질문 + 계획"을 한 번에 제시**하여 턴 수를 최소화한다.
- **언어**: 한국어 고정.
- **세션 시작 시** `docs/PROJECT_NAVIGATOR.md`를 반드시 읽는다. 현재 진행 상태, 다음 작업, 주요 의사결정이 기록되어 있다.
- **Phase**: MVP 개발 중 (문제 데이터 완성, Figma 와이어프레임 완성, Phase A 디자인 적용 예정)

---

## 2. 절대 금지 사항 (HARD RULES)

1. **`any` 타입 사용 금지** → `unknown` + 타입 가드로 대체
2. **서버 데이터를 Zustand에 복제 금지** → TanStack Query 전용
3. **`dangerouslySetInnerHTML` 사용 금지** → 불가피 시 DOMPurify + PR 리뷰
4. **환경 변수에 시크릿 노출 금지** → `VITE_` 접두사 변수에 비밀값 금지
5. **운영 배포 임의 실행 금지** → 반드시 명시적 승인 필요
6. **파괴적 작업 무단 실행 금지** → 패키지 설치, 파일 삭제, 대규모 리팩토링 시 승인 대기

---

## 3. 작업 유형별 규칙 라우팅 (JIT)

> 필요한 규칙만 선택적으로 읽어 토큰을 절약한다.

| 유형 | 참조 파일 | 핵심 |
|---|---|---|
| 공통/Hook | `rules/hook.md` | 시작/종료 HOOK, 작업 기억 |
| 시스템 최적화 | `rules/meta.md` | JIT 컨텍스트, 스택 적응, 자가 최적화 |
| 컴포넌트 | `rules/typescript.md` | 200줄 제한, SRP, 네이밍 |
| 상태/API | `rules/state.md` | 서버↔클라이언트 경계 분리 |
| 에러/디버깅 | `rules/error-handling.md` | ErrorBoundary, 과학적 디버깅 |
| 보안/성능 | `rules/security.md` / `rules/performance.md` | 취약점 점검, 측정 후 적용 |
| 테스트 | `rules/testing.md` | Vitest + Testing Library, 80% 커버리지 |
| Git / PR | `rules/git.md` | Conventional Commits |
| 와이어프레임 | `docs/wireframe/wireframe-rules.md` | Figma MCP, §1-§6 규칙 |
| 디자인/UI | 스킬: `frontend-design`, `canvas-design` | `docs/SKILLS_GUIDE.md` 참조 |
| 브레인스토밍 | 스킬: `brainstorming`, `writing-plans` | `docs/SKILLS_GUIDE.md` 참조 |

---

## 4. Tech Stack

| 항목 | 스택 |
|---|---|
| Framework | React 19 (Hook 기반) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| 로컬 DB | Dexie.js (IndexedDB) — version(2) 마이그레이션 완료 |
| 클라이언트 상태 | Zustand v5 |
| 패키지 매니저 | Yarn |
| Node.js | ≥ 18 LTS |
| 테스트 | Vitest + Testing Library |
| 애니메이션 | Lottie (lottie-web) |

---

## 5. 아키텍처 & 구조

> 상세 내용은 `docs/ARCHITECTURE.md` 및 `docs/FOLDER_STRUCTURE.md` 참조.

```
src/
├── app/           # 라우팅, 프로바이더, 레이아웃
├── features/      # 도메인별 기능 모듈
│   └── [domain]/
│       ├── components/
│       ├── hooks/
│       └── (store/ or api/)
├── shared/        # 공용 컴포넌트, 훅, 유틸, DB
│   ├── components/
│   ├── db/        # Dexie DB + Repository 패턴
│   ├── hooks/
│   ├── services/  # problemLoader 등
│   └── utils/     # 정답 판별, 추천 엔진, 오답 분류
└── types/         # 글로벌 타입 정의
```

**Data Flow**: `UI → Hooks → DB(Dexie) / problemLoader → UI`

---

## 6. 하네스 자가 최적화

- **Friction Logging**: 불필요한 절차 발견 시 즉시 기록 (`rules/meta.md`).
- **Lean Goal**: AI 모델의 발전에 따라 낡은 규칙은 과감히 삭제 제안.

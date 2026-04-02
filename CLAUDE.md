# Project: [프로젝트명]

> 이 파일은 AI 에이전트가 **가장 먼저** 읽는 진입점이다.
> 프로젝트 컨텍스트를 파악한 뒤, 작업 유형에 맞는 규칙 파일을 참조한다.

---

## 1. 프로젝트 정보

<!-- 프로젝트별로 아래 내용을 채우세요 -->

- **프로젝트명**:
- **설명**:
- **주요 기능**:
- **Phase**: <!-- MVP 개발 / 베타 / 리팩토링 / 유지보수 -->
- **마지막 주요 변경**: <!-- 예: 2026-03-28 인증 모듈 리팩토링 -->

---

## 2. 기본 규칙

- 반드시 이 파일을 먼저 읽고, `AGENTS.md` → 해당 `rules/` 파일 순서로 참조한다.
- **세션 시작 시 `docs/PROJECT_NAVIGATOR.md`를 반드시 읽는다.** 현재 진행 상태, 다음 작업, 주요 의사결정이 기록되어 있다.
- 한국어로 소통한다.
- 단순 코드 생성기가 아닌, **성능·보안·확장성을 제안하는 기술 파트너**로 행동한다.
- 파괴적 작업은 반드시 승인 후 진행한다.

---

## 3. 절대 금지 사항 (HARD RULES)

> 이 규칙은 어떤 상황에서도 예외 없이 적용된다.

1. **`any` 타입 사용 금지** → `unknown` + 타입 가드로 대체
2. **서버 데이터를 Zustand에 복제 금지** → TanStack Query 전용
3. **`dangerouslySetInnerHTML` 사용 금지** → 불가피 시 DOMPurify + PR 리뷰
4. **환경 변수에 시크릿 노출 금지** → `VITE_`/`NEXT_PUBLIC_` 접두사 변수에 비밀값 금지
5. **운영 배포 임의 실행 금지** → 반드시 사용자의 명시적 승인 필요
6. **파괴적 작업 무단 실행 금지** → 패키지 설치, 파일 삭제, 대규모 리팩토링 시 승인 대기

---

## 4. Tech Stack

| 항목 | 스택 |
|---|---|
| Framework | React 18+ (Hook 기반) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| 서버 상태 | TanStack Query (React Query v5) |
| 클라이언트 상태 | Zustand |
| 패키지 매니저 | Yarn |
| Node.js | ≥ 18 LTS |
| 테스트 | Vitest + Testing Library |
| E2E | Playwright (필요 시) |

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
│       ├── api/       # (또는 store/)
│       └── types/
├── shared/        # 공용 컴포넌트, 훅, 유틸
│   ├── components/
│   ├── hooks/
│   └── utils/
└── types/         # 글로벌 타입 정의
```

**Data Flow**: `UI → Hooks → Store/API → UI`

---

## 6. 작업 유형별 규칙 라우팅

> 에이전트는 작업을 시작하기 전, 아래 표에서 해당 작업 유형의 규칙 파일을 **반드시** 참조한다.

| 작업 유형 | 참조 파일 | 핵심 포인트 |
|---|---|---|
| 컴포넌트 생성/수정 | `rules/typescript.md` | 200줄 제한, SRP, 네이밍 |
| 상태 관리 | `rules/state.md` | 서버↔클라이언트 경계 분리 |
| API 연동 | `rules/state.md` + `rules/security.md` | Zod 검증, 토큰 관리 |
| 에러 처리 | `rules/error-handling.md` | Error Boundary, 표준 구조 |
| 성능 개선 | `rules/performance.md` | 측정 후 적용 원칙 |
| 테스트 작성 | `rules/testing.md` | 필수 범위, Vitest + MSW |
| Git / PR | `rules/git.md` | Conventional Commits |
| 코드 리뷰 요청 | `AGENTS.md` §6 EXPERT TEAM | 4파트 병렬 검수 |
| 배포 | `AGENTS.md` §4 WORKFLOW | 개발 우선, 운영은 승인 후 |
| 와이어프레임 (Figma MCP) | `docs/wireframe/wireframe-rules.md` | §1-§6 핵심 규칙 (참조: wireframe-ref.md) |
| 디자인/UI | 스킬: `frontend-design`, `canvas-design` | `docs/SKILLS_GUIDE.md` 참조 |
| 브레인스토밍 | 스킬: `brainstorming`, `writing-plans` | `docs/SKILLS_GUIDE.md` 참조 |
| 보안 점검 | 스킬: `security-auditor` | `docs/SKILLS_GUIDE.md` 참조 |
| 성능 프로파일링 | 스킬: `performance-profiler` | `docs/SKILLS_GUIDE.md` 참조 |

---

## 7. 하네스 재점검 (Meta Rule)

> 이 템플릿의 모든 규칙은 "현재 모델이 혼자 못하는 것"에 대한 가정을 담고 있다.
> 모델이 발전하면 가정이 낡을 수 있으므로, 불필요한 규칙은 제거하여 오버헤드를 줄인다.

- **점검 시점**: 새 모델 도입 시, 또는 분기 1회
- **점검 방법**: 각 규칙/체크리스트 항목에 대해 "이 규칙 없이도 모델이 올바르게 동작하는가?" 테스트
- **조치**: 불필요해진 규칙은 삭제하고, 새로 필요한 규칙은 추가

---

## 8. 프롬프트 가이드 (AI 요청 시 구조)

AI에게 작업을 요청할 때 아래 구조를 따르면 최적의 결과를 얻을 수 있다:

1. **Task** — 구현할 기능 설명
2. **Context** — 현재 프로젝트 상황 (기존 스토어, API 방식 등)
3. **Constraints** — 제약 사항 (기존 구조 유지, 라이브러리 제한 등)
4. **Expected Output** — 결론 → 코드 → 설명 순서로 응답

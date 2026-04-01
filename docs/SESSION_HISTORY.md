# I Do Math — 개발 세션 히스토리

> 세션 단절 대비용 누적 작업 내역. 새 세션 시작 시 이 파일부터 읽을 것.
> 마지막 업데이트: 2026-04-01 (세션 8)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | I Do Math |
| 대상 | 초등학교 4학년 수학 학습 |
| 플랫폼 | PWA (Progressive Web App) |
| 현재 Phase | MVP 완성 + 곱셈/나눗셈 문제 추가 + 연습장 기능 |
| 빌드 상태 | ✅ `yarn build` 성공 |
| 테스트 상태 | ✅ 39/39 통과 (`yarn test --run`) |

---

## 기술 스택

| 항목 | 버전/도구 |
|------|----------|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) |
| Router | React Router v7 |
| 클라이언트 DB | Dexie.js v4 + dexie-react-hooks (IndexedDB ORM) |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand v5 |
| PWA | vite-plugin-pwa v0.21 + Workbox |
| 테스트 | Vitest v3 + fake-indexeddb |
| 패키지 매니저 | Yarn |

---

## 라우트 맵

| 경로 | 컴포넌트 | 설명 |
|------|---------|------|
| `/` | `IndexRoute` | DB 확인 후 `/onboarding` 또는 `/home` 리다이렉트 |
| `/onboarding` | `OnboardingRoute` | 3단계: 이름 → 학년 → 캐릭터 |
| `/home` | `HomeRoute` | 홈: 스트릭 배너, 미션 배너, 학습 시작, 일기/복습/보호자 버튼 |
| `/problem` | `ProblemRoute` | 문제 풀기: 분수 입력, 커스텀 키패드, 힌트 |
| `/result` | `ResultRoute` | 결과: 정답/오답 분기, 단계별 풀이, 추천 문제 |
| `/remind` | `RemindRoute` | 오답 복습: 약점 개념 표시, 이전 오답 vs 힌트 |
| `/diary` | `DiaryRoute` | 수학 일기: 날짜별 학습 기록 |
| `/parent` | `ParentRoute` | 부모님 대시보드: PIN 잠금, 통계, 약점 개념 |
| `/settings` | `SettingsRoute` | 설정: 이름/캐릭터 변경, PIN 설정, 데이터 초기화 |

---

## 전체 파일 구조

```
src/
├── __tests__/
│   └── e2e-flow.test.ts           # 통합 테스트 (17 케이스)
├── app/
│   ├── App.tsx                    # 라우트 정의 (9개 라우트)
│   ├── providers/AppProviders.tsx # QueryClientProvider + BrowserRouter
│   └── routes/
│       ├── index.tsx              # 진입점, DB 체크 후 리다이렉트
│       ├── onboarding.tsx         # 온보딩 3단계
│       ├── home.tsx               # 홈 화면
│       ├── problem.tsx            # 문제 풀기
│       ├── result.tsx             # 결과 화면
│       ├── remind.tsx             # 오답 복습
│       ├── diary.tsx              # 수학 일기
│       ├── parent.tsx             # 부모님 대시보드
│       └── settings.tsx           # 설정
├── features/
│   ├── diary/
│   │   └── hooks/useDiary.ts      # 날짜별 학습 기록 그룹핑
│   ├── onboarding/
│   │   └── hooks/useOnboarding.ts
│   ├── problem/
│   │   ├── components/
│   │   │   ├── CustomKeypad.tsx   # 3열 커스텀 키패드 (1~9, /, 0, del)
│   │   │   └── FractionInput.tsx  # 분수 입력 UI (분자/분모 필드)
│   │   └── hooks/
│   │       └── useProblemSession.ts # 입력 관리, 자동 분모이동, 타이머
│   ├── remind/
│   │   └── hooks/useRemind.ts     # 약점 개념 조회, 리마인드 트리거
│   └── result/
│       └── hooks/useResultFeedback.ts # 로그 저장, 별 증가, 스트릭/미션 업데이트
├── shared/
│   ├── components/
│   │   └── PinInputModal.tsx      # 4자리 PIN 입력 모달
│   ├── db/
│   │   ├── db.ts                  # Dexie 스키마 정의
│   │   ├── userProfileRepo.ts     # UserProfile CRUD
│   │   ├── learningLogRepo.ts     # 학습 로그 저장/조회
│   │   ├── wrongNoteRepo.ts       # 오답 노트 upsert/조회
│   │   └── templateCounterRepo.ts # 템플릿 카운터
│   ├── hooks/
│   │   ├── useUserProfile.ts      # useLiveQuery 래퍼
│   │   ├── useStreak.ts           # 연속 학습일 업데이트
│   │   └── useDailyMission.ts    # 일일 미션 상태 관리
│   ├── services/
│   │   └── problemLoader.ts       # problems-v1.json 로드 (메모리 캐시)
│   └── utils/
│       ├── fractionUtils.ts       # gcd, normalizeFraction, isFractionEqual
│       ├── mistakeClassifier.ts   # 오답 유형 분류
│       ├── difficultyUnlock.ts    # 난이도 해금 조건
│       ├── pinHasher.ts           # SHA-256 PIN 해시
│       ├── problemGenerator.ts    # 템플릿→문제 생성 (시드 난수)
│       └── recommendEngine.ts     # 추천 문제 선택
├── types/
│   ├── problem.ts                 # Problem, ProblemTemplate, FractionAnswer 등
│   ├── user.ts                    # UserProfile, CharacterId, LEVEL_TITLES
│   ├── learningLog.ts             # LearningLog
│   └── wrongNote.ts               # WrongNote
└── main.tsx                       # 진입점
```

---

## IndexedDB 스키마 (Dexie)

| 테이블 | 키 | 주요 필드 |
|--------|-----|---------|
| `userProfile` | `userId` | displayName, grade, level, totalStars, currentStreak, longestStreak, lastStudyDate, parentalPinHash/Salt, missionDate, missionProblemsSolved, missionWrongReviewed |
| `learningLogs` | `logId` | userId, problemId, concept, mistakeType, isCorrect, timeSpent, hintUsed, timestamp |
| `wrongNotes` | `id (userId::concept::mistakeType)` | wrongCount, consecutiveWrong, consecutiveCorrect, isWeak, lastWrongAnswer, lastAttemptAt |
| `templateCounters` | `templateId` | count |

---

## 핵심 비즈니스 로직

### 1. 분수 정답 판별 (`fractionUtils.ts`)
- GCD 기반 정규화 후 비교 → 동치 분수 정답 처리 (예: 2/4 === 1/2)

### 2. 오답 유형 분류 (`mistakeClassifier.ts`)
- 3초 미만 → `guess_error`
- 분모만 틀림 → `denominator_error`
- 분자만 틀림 → `numerator_error`
- 둘 다 틀림 → `concept_error`
- **주의**: 정규화 후 비교이므로 약분 가능한 오답(4/8 → 1/2)은 분모도 변경됨

### 3. 추천 문제 (`recommendEngine.ts`)
- 틀렸을 때: 같은 개념 → 낮은 난이도 → basic 순 우선
- 최근 푼 문제 ID 제외 (중복 방지)

### 4. 자동 분모 이동 (`useProblemSession.ts`)
- 분자 1자리 입력 시 자동으로 분모 필드로 포커스 이동

### 5. 스트릭 (`useStreak.ts`)
- 어제 학습 → streak+1, 이틀+ 건너뜀 → streak=1, 오늘 이미 학습 → 변화 없음

### 6. 일일 미션 (`useDailyMission.ts`)
- 목표: 문제 5개 (`DAILY_PROBLEM_GOAL`) + 오답 복습 1회
- `missionDate`가 오늘이 아니면 카운터 리셋

### 7. 약점 개념 (`wrongNoteRepo.ts`)
- `wrongCount >= 3` → `isWeak = true`
- 정답 2회 연속 → `isWeak = false`

### 8. PIN 보안 (`pinHasher.ts`)
- `crypto.subtle` SHA-256 + 16바이트 salt
- 비보안 환경 fallback: 간단한 XOR 해시

---

## 문제 데이터 (`public/data/problems-v1.json`)

### 고정 문제 3개
| ID | 개념 | 난이도 |
|----|------|--------|
| `g4-s1-u2-fraction-add-001` | `fraction_add_same_denominator` | basic |
| `g4-s1-u2-fraction-add-002` | `fraction_add_same_denominator` | basic |
| `g4-s1-u2-fraction-sub-001` | `fraction_sub_same_denominator` | basic |

### 템플릿 2개
- `g4-s1-u2-fraction-add-tpl-001`: `{a}/{b} + {c}/{b} = ?` (a+c < b 제약)
- `g4-s1-u2-fraction-sub-tpl-001`: `{a}/{b} - {c}/{b} = ?` (a > c 제약)

### ProblemStep 구조
```json
{
  "desc": "처음에 먹은 피자",
  "narrative": "피자 한 판은 8조각 → 그 중 처음 먹은 조각은 3개예요",
  "expression": "3/8"
}
```
- `narrative`: 스토리 연결 문장 (선택적), 결과 화면에서 표시

---

## 주요 UX 결정사항

| 결정 | 내용 |
|------|------|
| 자동 분모 이동 | 분자 1자리 입력 즉시 분모로 이동 (사용자 요청) |
| 결과 화면 상세화 | narrative 포함 단계별 풀이, 내 답 vs 정답 비교 |
| 오답 시 추천 문제 | 오답 화면 하단에 "비슷한 문제 풀어보기" 버튼 |
| 홈 화면 미션 배너 | 오늘 진행상황 실시간 표시 |

---

## 알려진 이슈 / 미완성 항목

| 항목 | 상태 | 메모 |
|------|------|------|
| ~~Lottie 애니메이션~~ | ✅ 완료 | `AnimationPlayer` 컴포넌트, JSON 없으면 emoji fallback |
| ~~PWA 아이콘~~ | ✅ 완료 | `scripts/generate-icons.mjs`로 192/512px 생성 |
| ~~레벨업 로직~~ | ✅ 완료 | `levelUp.ts` + `LevelUpModal` + `useResultFeedback` 연동 |
| ~~문제 수 부족~~ | ✅ 완료 | 고정 20문제(분수10+곱셈5+나눗셈5) + 템플릿 4개 |
| ~~결과 애니메이션~~ | ✅ 완료 | 정답: 컨페티 오버레이 2.4s / 오답: 붉은 펄스+흔들기 1.8s |
| ~~제출 즉각 피드백~~ | ✅ 완료 | `SubmitFeedback` — 제출 직후 400ms ✓/✗ 팝업 |
| ~~캐릭터 선택 애니메이션~~ | ✅ 완료 | `CharacterSelectCard` — 카드 팝+이모지 wiggle+뱃지 |
| **디자인 작업** | 🟡 스펙 완료 | 픽셀 블록 RPG 컨셉 확정. 아이템 시스템 스펙 작성 완료. Phase A(디자인) 구현 대기 중 |
| ~~난이도 해금 UI~~ | ✅ 완료 | `DifficultyUnlockModal` + `useResultFeedback` 연동. `UserProfile.unlockedDifficulty` 필드 추가 (DB v2 마이그레이션). 홈 화면 배지 + 문제 선택 난이도 반영 |
| 학년별 문제 분리 | ⚠️ | 현재 모두 4학년 문제만 존재 |
| 번들 크기 | ⚠️ lottie-web eval 경고 | 라이브러리 내부 이슈, 동작에 영향 없음 |

---

## 다음 세션에서 할 수 있는 작업

### 다음 작업 순서 (우선순위 순)
1. **아이 실사용 테스트** — 곱셈/나눗셈 문제 + 연습장으로 실제 반응 확인
2. **세로셈 UI (Phase 후속)** — 부분곱 입력 컴포넌트, 자릿수별 실수 분류
3. **Phase A — 디자인 구현** — 픽셀 블록 RPG 컨셉으로 전체 9개 화면 디자인 적용
4. **Phase B — 아이템 시스템 코어** — DB version(3) 마이그레이션, items-v1.json 60종, XP 로직
5. **Phase C — 신규 화면** — /inventory, /trophy, /box-open
6. **Phase D — 연동 마무리** — 홈 캐릭터 렌더링, 결과 XP 팝업, E2E 테스트
7. **학년별 문제 확장** — 현재 4학년 1학기만, 2학기(분수) + 각도 추가

### Claude Talk to Figma MCP 설정 (세션 5에서 완료)
- 소켓 서버: `cd ~/claude-talk-to-figma-mcp && bun run socket` (port 3055)
- MCP 등록: `claude mcp add claude-talk-to-figma-mcp node ~/claude-talk-to-figma-mcp/dist/talk_to_figma_mcp/server.js`
- 등록 후 Claude Code 재시작 필요
- 접속: `mcp__claude-talk-to-figma-mcp__join_channel` 호출

---

## 개발 명령어

```bash
# 개발 서버
yarn dev

# 빌드
yarn build

# 테스트
yarn test --run

# 테스트 (watch 모드)
yarn test

# 미리보기 (빌드 후)
yarn preview
```

---

## 세션 6 — 디자인 컨셉 & 아이템 시스템 스펙 (2026-04-01)

### 결정 사항

#### 디자인 컨셉: 픽셀 블록 RPG
- 대상: 로블록스를 좋아하는 초등 4학년 남자아이
- 컬러: 다크 브라운(`#1C1917`) 배경 + 옐로우(`#FCD34D`) + 그린(`#22C55E`) 포인트
- 폰트: `Courier New` (영문/숫자) + `Noto Sans KR` (한글 폴백)
- 레어도 글로우: Tailwind `extend.boxShadow` 커스텀 추가 필요

#### 아이템 시스템 핵심 결정
| 항목 | 결정 |
|------|------|
| 아이템 종류 | 장착형(모자/무기/갑옷/펫) + 컬렉션형(트로피) = 총 60종 |
| 레어도 | 일반/희귀/에픽/레전드 4등급 |
| 박스 | 일반(20% 드롭) / 레벨업(5레벨 단위 확정) / 레전드(30일 연속) |
| XP 공식 | 점진적 곡선 `Lv N→N+1 = N×100 XP` (만렙 약 1,225문제) |
| 레벨업 박스 | 5레벨 단위만 지급 (Lv.5, 10, 15...) |
| 캐릭터 렌더링 | 이모지 주변 고정 슬롯 배치 (크로스 플랫폼 이슈 대응) |
| 박스 오픈 안전성 | 진입 즉시 추첨+DB 저장 선행, 이후 애니메이션만 재생 |

#### 신규 화면 3개
- `/inventory` — 획득 아이템 그리드, 장착 인터랙션
- `/trophy` — 업적 트로피 컬렉션
- `/box-open` — 박스 오픈 인터랙션 (from= 파라미터로 복귀 화면 결정)

#### DB 변경 예정
- `version(3)` 마이그레이션
- 신규 테이블: `userItems`, `userBoxes` (drawnItemId 포함)
- `userProfile` 추가 필드: `totalXP`, `hasReceivedWelcomeBox`

### 산출물
- 스펙 문서: `docs/superpowers/specs/2026-04-01-item-system-design.md`
- 비주얼 컴패니언 목업: `.superpowers/brainstorm/58279-1775044909/`

---

---

## 세션 8 — 곱셈/나눗셈 문제 추가 + 연습장 캔버스 (2026-04-01)

### 배경
실제 아이 학습지 확인 결과 두 가지 발견:
1. 앱의 분수 문제는 **4학년 2학기** 내용 → 아이가 지금 배우는 단원(곱셈/나눗셈)과 미스매치
2. 3자리×2자리 곱셈은 암산 어려움 → 연습장(스크래치패드) 필요

### 구현 내용

#### 타입 시스템 확장
- `types/problem.ts`: `AnswerType`, `IntegerAnswer`, `Answer` 유니온, `isIntegerAnswer()` 가드 추가
- `types/learningLog.ts`, `types/wrongNote.ts`: `FractionAnswer` → `Answer`

#### 정수 입력 UI
- `IntegerInput.tsx` (신규): 큰 숫자(6자리) 표시 컴포넌트
- `CustomKeypad.tsx`: `mode` prop 추가 — 정수 모드에서 `/` → `00` 키
- `useProblemSession.ts`: 분수/정수 분기 처리
- `problem.tsx`: `answerType`에 따라 FractionInput/IntegerInput 자동 분기

#### 결과/복습 화면 정수 대응
- `result.tsx`, `remind.tsx`, `WrongOverlay.tsx`: `isIntegerAnswer()` 분기로 표시 처리

#### 오류 분류
- `mistakeClassifier.ts`: 정수 오답 → `calculation_error`

#### 문제 데이터 (problems-v1.json)
- 분수 10개 유지 (2학기 대비)
- 곱셈 5개 추가: 기본 2(375×50, 184×36), 응용 2(운동시간/주스), 역산 1
- 나눗셈 5개 추가: 기본 2(420÷70, 560÷80), 응용 2(사탕/구슬), 역산 1
- 총 20문제

#### 홈 화면 문제 선택 로직 수정
- `home.tsx`: `selectRecommendedProblem`(concept 필터) 제거 → 전체 풀에서 난이도 우선 랜덤 선택

#### 연습장 캔버스
- `Scratchpad.tsx` (신규): HTML5 Canvas, 터치/마우스, 지우기 버튼
- `problem.tsx`: `✏️ 연습장` 토글 버튼 — 애니메이션 영역과 연습장 전환

### 핵심 결정
- 연습장은 최종 답 입력과 독립 (계산 보조용, 데이터 수집 안 함)
- 세로셈 UI는 Phase 후속 과제로 분류
- 분수 문제는 2학기 대비용으로 보존

---

## 오류 해결 이력

| 오류 | 해결 방법 |
|------|----------|
| `yarn not found` | `npm install -g yarn` |
| CSS import TS 오류 | `src/vite-env.d.ts`에 `/// <reference types="vite/client" />` 추가 |
| `test` 필드 타입 충돌 | `vitest.config.ts` 별도 분리, vite.config.ts는 `from 'vite'`만 사용 |
| `__dirname` not found | `@types/node` 설치 + `/// <reference types="node" />` |
| 조건부 hooks 위반 | `ProblemRoute`를 `ProblemScreen` + `ProblemRoute` wrapper로 분리 |
| Dexie `.isWeak` 쿼리 | `.where().filter(n => n.isWeak)` 사용 (boolean 인덱스 미지원) |
| 테스트: 4/8 → concept_error | 정규화 후 1/2가 되어 분모 불일치. 테스트를 3/8 (기약분수)로 수정 |

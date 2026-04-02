# I Do Math — 프로젝트 네비게이터 (v1.0)

> **관리 원칙**: 소스 코드는 실제 파일에 맡기고, 본 파일은 "의사결정"과 "파일 위치"라는 지도 역할에 집중한다.

---

## 📍 1. 현재 개발 상태 (Session 12 기준)
- **진행 단계**: Figma 와이어프레임 구축 완료 (Phase A 디자인 진행 중)
- **코어 스택**: React 19, Tailwind v4, Dexie.js (IndexedDB), Zustand v5
- **DB 버전**: `version(2)` — `userProfile`에 난이도 해금 필드 반영 완료
- **문제 데이터**: `problems-v1.json` **200문제** (목표 달성)
  - 분수(20) + u1 큰수(30) + u2 각도(40) + u3 곱셈나눗셈(40) + u4 평면도형이동(30) + u5 막대그래프(30) + u6 규칙찾기(30)
- **Figma 와이어프레임**: Page 3 — 총 17개 화면 완성 (채널 `8o5pxs4u`)

## 🗺️ 2. 핵심 파일 맵 (주요 로직 위치)
- **비즈니스 로직**: `src/shared/utils/` (정답 판별, 오답 분류, 추천 엔진)
- **데이터 저장소**: `src/shared/db/` (Dexie 스키마 및 Repository 패턴)
- **문제 데이터**: `public/data/problems-v1.json` (200문제, ID 형식: `g4-s1-u{unit}-{concept}-{num:03d}`)
- **타입 정의**: `src/types/problem.ts` — `questionImage?`, `choiceImages?` 필드 추가됨
- **주요 UI**: `src/features/problem/components/` (커스텀 키패드, 분수/정수/다지선다/빈칸/그리기 입력)
- **연습장 기능**: `src/features/problem/components/Scratchpad.tsx` (Canvas 기반)
- **이미지 선택지**: `src/features/problem/components/MultipleChoiceInput.tsx` — `choiceImages` prop 지원

## ⛔ 3. 절대 준수 규칙 (Hard Rules)
- **학습 설계**: 3초 미만 정답은 `guess_error` 처리 및 XP 지급 제외 (찍기 방지)
- **UX 인터랙션**: 분수 입력 시 분자 1자리 입력 즉시 분모 필드로 자동 포커스 이동
- **정답 판별**: GCD 기반 기약분수 정규화 후 비교 (예: 2/4와 1/2는 동일 정답 처리)
- **문제 데이터 원칙**: 워크시트는 참고용. 문제는 이미지 없이 텍스트만으로 풀 수 있어야 함
  - 시각 자료가 필수인 경우 → `questionImage` / `choiceImages` 필드 사용
  - draw 문제 정답 이미지 → `public/data/answer-images/` 에 저장 (현재 placeholder 상태)

## 🚀 4. 다음 작업 우선순위 (Next Steps)
1. ~~**[완료] draw 문제 referenceImage 연결**~~ → 19개 연결 완료
2. ~~**[완료] u4 multiple_choice choiceImages 연결**~~ → 3문제 완료
3. ~~**[완료] draw questionImage 연결**~~ → 16개 완료
4. ~~**[완료] Figma 와이어프레임 17개 화면 구축**~~ → Page 3 완성, 팀별 검수 완료
5. **[다음] Phase A (디자인)**: 와이어프레임 기반 실제 UI 컴포넌트 스타일 적용
6. **[선택] Figma 추가 화면**: 오답복습 일반 상태 / 홈 / 문제풀이 각 타입(신규 스타일) 추가
7. **Phase B (아이템)**: `version(3)` 마이그레이션 및 아이템/박스 시스템 코어 구축
8. **이슈 해결**: `lottie-web` eval 관련 번들 경고 원인 파악 및 해결

## 📝 5. 주요 의사결정 기록
- **문제 타입 확장** (세션 9): `Problem` 인터페이스에 `questionImage?`, `choiceImages?` 추가
  - 이유: 워크시트 내 이미지 기반 선택지(무늬 패턴 등)를 앱에서 표현하기 위함
- **MultipleChoiceInput 이중 모드** (세션 9): `choices`(텍스트) 또는 `choiceImages`(이미지 그리드) 중 하나
- **u4 평면도형 문제 방향** (세션 9): 텍스트로 풀 수 없는 무늬 비교 문제는 향후 이미지 추출 후 `choiceImages`로 교체 예정 (현재는 텍스트 설명으로 대체)
- **문제 작업 워크플로우** (세션 9): 텍스트로 만들 수 있는 문제는 직접 생성, 이미지가 필수인 경우만 questionImage/choiceImages 사용
- **200문제 달성** (세션 10): u1~u6 전 단원 완료. u5 막대그래프 전체 텍스트 기반, u6 규칙찾기 24개 텍스트 + 6개 draw
- **Figma 와이어프레임 완성** (세션 11~12): Page 3에 17개 화면 구축. 온보딩 3종 / 일기(일반+빈) / 설정 / 부모님 PIN 3종+대시보드 / 오답복습 빈상태 / CorrectOverlay·WrongOverlay / LevelUp·DifficultyUnlock 모달 / DrawProblem 그리기·채점
  - Figma 채널: `8o5pxs4u`, Page 3 (프레임 x=2130~9611)
  - 미포함: 오답복습 일반 상태, 홈, 문제풀이 각 타입(신규 스타일) → 추후 추가 예정

---
*마지막 업데이트: 2026-04-02 (세션 12)*
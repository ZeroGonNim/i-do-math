# I Do Math — 프로젝트 네비게이터 (v1.6)

> **관리 원칙**: 소스 코드는 실제 파일에 맡기고, 본 파일은 "의사결정"과 "파일 위치"라는 지도 역할에 집중한다.

---

## 📍 1. 현재 개발 상태 (Session 21 기준)
- **진행 단계**: Phase A~D 완료 — 픽셀 블록 RPG 디자인 + XP/박스 아이템 시스템 코어 통합
- **완성도**: 98% (핵심 루프 + 디자인 + 아이템 시스템 연동 완료)
- **주요 성과**:
  - **[Session 21 - Phase A]** CSS 토큰 스톤/브라운 RPG 팔레트 전환 (Courier New 게임 폰트, 레어도 글로우 토큰).
  - **[Session 21 - Phase A]** 전 화면 구 색상 hardcode 제거 (blue→stone), CharacterDisplay 컴포넌트 분리.
  - **[Session 21 - Phase B]** DB version(4) — `userBoxes` 테이블, `totalXP`/`noDropStreak` 필드 마이그레이션.
  - **[Session 21 - Phase B]** XP 획득 로직 (+20/15/10 XP), 박스 드롭 (20% + 천장 시스템), O(1) `calcLevel` 공식.
  - **[Session 21 - Phase C]** `/box-open` 화면 이중드롭 버그 수정 (`useBoxDrop` 제거, `useResultFeedback`으로 통합). XP 팝업(+N XP) 추가.
  - **[Session 21 - Phase D]** 홈 GNB XP 진행 바. 레벨업 모달 "📦 박스 열기" 버튼 (5배수 레벨). 30일 연속 → 레전드 박스 자동 지급.

---

## 🗺️ 2. 핵심 파일 지도

### [Design System]
- `src/index.css`: **[Updated]** 스톤/브라운 RPG 팔레트, Courier New 게임 폰트, 레어도 글로우 토큰.
- `src/shared/components/CharacterDisplay.tsx`: **[New]** 캐릭터 이모지 + 장착 슬롯 4개 재사용 컴포넌트.

### [XP & Box System]
- `src/types/userBox.ts`: **[New]** `UserBox` / `BoxType` 타입.
- `src/shared/db/db.ts`: **[Updated]** version(4) — `userBoxes` 테이블 + upgrade 마이그레이션.
- `src/shared/db/userBoxRepo.ts`: **[New]** 박스 CRUD + `shouldDropBox()` / `isLevelupBoxLevel()` / `drawRarity()`.
- `src/shared/utils/levelUp.ts`: **[Updated]** O(1) `calcLevel(totalXP)` + `levelProgress()` + `xpForNextLevel()`.
- `src/features/result/hooks/useResultFeedback.ts`: **[Updated]** XP 획득, 박스 드롭, 30일 레전드 박스 연동.

### [UI — Result & LevelUp]
- `src/shared/components/LevelUpModal.tsx`: **[Updated]** `hasBox`/`onOpenBox` prop — 5배수 레벨 시 박스 열기 버튼.
- `src/app/routes/result.tsx`: **[Updated]** `useBoxDrop` 제거, `boxDropped`/`xpGained` 통합, XP 팝업.
- `src/app/routes/home.tsx`: **[Updated]** GNB XP 진행 바 (current/needed XP 표시).

---

## 🛠️ 3. 기술적 의사결정 (Session 21)

1. **이중 드롭 버그 수정**
   - `useBoxDrop` 훅과 `useResultFeedback` 양쪽에서 박스 드롭 처리 중복 발견 → `useBoxDrop` 제거, `useResultFeedback`으로 단일화.
2. **O(1) 레벨 공식 도입**
   - 기존 `while` 루프 + `LEVEL_THRESHOLDS` 테이블 → 이차방정식 근의 공식으로 O(1) 계산, 만렙 50 지원.
3. **`updateStreak` 반환값 추가**
   - 30일 연속 레전드 박스 지급을 위해 `{ newStreak, streakIncremented }` 반환으로 변경.
4. **DB version(4) 누적 마이그레이션**
   - 기존 version(3) 블록 유지 + version(4) 추가. `totalXP=0`, `noDropStreak=0` 기존 사용자 마이그레이션.

---

## 📅 4. 주요 업데이트 기록

- **Phase A~D 완료** (Session 21)
  - 픽셀 블록 RPG 디자인 시스템 완전 전환.
  - XP 시스템 + 박스 드롭 + 레벨업 보상 흐름 완성.
  - 홈 화면 XP 진행 바, 결과 화면 XP 팝업, 레벨업 모달 박스 연결.

- **전체 화면 디자인 폴리시 + P3 마무리** (Session 20)
  - Pretendard Variable 폰트 전환 및 glow/float CSS 유틸리티 체계화.

---

## 📋 5. 남은 작업

### 즉시
- [ ] 실사용 테스트 (아이 피드백)

### 단기
- [ ] NCIC 교육과정 매핑 (`ncicCode` 필드 + 마스터리 진행)
- [ ] E2E 시나리오 추가 (박스 오픈 / 장비 장착 / 인벤토리)

### 중기
- [ ] 트로피/뱃지 시스템 (Phase E)
- [ ] 보호자 대시보드 NCIC 리포트

### 장기
- [ ] 전 학년 문제 콘텐츠 (~1,200문제)
- [ ] PWA 오프라인 완전 지원
- [ ] iOS/Android 앱스토어 배포

---
*마지막 업데이트: 2026-04-08 (Session 21)*

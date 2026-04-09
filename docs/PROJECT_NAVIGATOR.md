# I Do Math — 프로젝트 네비게이터 (v1.8)

> **관리 원칙**: 소스 코드는 실제 파일에 맡기고, 본 파일은 "의사결정"과 "파일 위치"라는 지도 역할에 집중한다.

---

## 📍 1. 현재 개발 상태 (Session 23 기준)
- **진행 단계**: 피그마 25개 화면 전체 정합성 체크 + 화면 디자인 폴리시 완료
- **완성도**: 99%
- **주요 성과**:
  - **[Session 23 - 피그마 정합성]** Figma 25개 화면 전수 비교 완료. 20개 구현 가능 화면 중 19개 완전 일치, 1개(CorrectOverlay) 기능 초과 구현으로 유지.
  - **[Session 23]** `DrawProblem.tsx` — 비교 단계 버튼 순서 수정 (외곽선 "다시 그려볼래" → 채운 "맞게 그렸어"), 그리기 영역 레이블 + 🗑️ 지우기 버튼 추가.
  - **[Session 23]** `diary.tsx` — 빈 상태 전면 재설계 (108px 보라색 책 아이콘 + 노란 잠금 뱃지, 시안 CTA, 팁 카드). 헤더 회귀 수정 (← 화살표 → 🎮 아이콘 유지).
  - **[Session 23]** `onboarding.tsx` — 학년 선택 스텝1 2열 이모지 버튼 + 힌트 텍스트 + CTA "다음 단계로 이동 →".
  - **[Session 23]** `PinInputModal.tsx` — 바텀시트 모달 → 전체화면 컴포넌트 전면 재작성. `headerTitle`/`showBack`/`showCancel` 프롭, 4자리 자동 제출.
  - **[Session 23]** `parent.tsx` — 새 PinInputModal 프롭스 적용 (lock/setup/confirm 3가지 컨텍스트).
  - **[Session 23]** `inventory.tsx` — "장착 중" 초록 텍스트 배지 (top-left), 아이템 테두리 항상 레어도 색상.
  - **[Session 22]** 아바타/아이템 이미지 시스템 + 특수 능력 + 레벨업 버그 수정 + E2E 테스트 (이전 세션).
  - **[Session 21 - Phase A~D]** CSS RPG 팔레트, XP/박스 드롭, 레벨업 모달 (이전 세션).

---

## 🗺️ 2. 핵심 파일 지도

### [Avatar & Item System]
- `src/types/avatar.ts`: **[New]** `AvatarId`, `AvatarDef`, `AVATARS` 4종 정의.
- `src/types/item.ts`: **[Updated]** `avatarId`, `imagePath` 필드 추가.
- `src/types/user.ts`: **[Updated]** `avatarId: AvatarId`, `unlockedAvatars: AvatarId[]` 추가.
- `src/shared/db/db.ts`: **[Updated]** version(5) — `avatarId`/`unlockedAvatars` 마이그레이션.
- `src/shared/utils/avatarAbility.ts`: **[New]** 아바타 특수 능력 유틸 (`getAvatarAbility`).
- `public/data/items.json`: **[Rewritten]** 64개 아이템 (imagePath 기반).
- `public/images/avatars/`: **[New]** warrior/mage/assassin/robot.png.
- `public/images/items/`: **[New]** 16종 아이템 이미지.

### [Design System]
- `src/index.css`: **[Updated]** 스톤/브라운 RPG 팔레트, Courier New 게임 폰트, 레어도 글로우 토큰.
- `src/shared/components/CharacterDisplay.tsx`: **[Updated]** avatarId 기반 이미지 렌더링 + 장착 슬롯 이미지.
- `src/shared/components/CharacterSelectCard.tsx`: **[Updated]** AvatarDef 기반, 이미지 렌더링.

### [XP & Box System]
- `src/types/userBox.ts`: `UserBox` / `BoxType` 타입.
- `src/shared/db/userBoxRepo.ts`: 박스 CRUD + `shouldDropBox()` / `isLevelupBoxLevel()`.
- `src/shared/utils/levelUp.ts`: O(1) `calcLevel(totalXP)` + `levelProgress()`.
- `src/features/result/hooks/useResultFeedback.ts`: **[Updated]** 아바타 능력치 적용, `starsGained`/`xpMultiplierApplied` 반환.

### [UI — Screens]
- `src/app/routes/onboarding.tsx`: **[Updated]** 스텝2 RPG 아바타 선택.
- `src/app/routes/inventory.tsx`: **[Updated]** 전면 이미지 렌더링.
- `src/app/routes/settings.tsx`: **[Updated]** 아바타 변경 섹션 (해금/장착).
- `src/app/routes/box-open.tsx`: **[Updated]** 아이템 공개 이미지 렌더링.
- `src/app/routes/result.tsx`: **[Updated]** `starsGained` 연동, 암살자 XP×2 표시.
- `src/app/routes/home.tsx`: GNB XP 진행 바.

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

### 단기
- [ ] 실사용 테스트 (아이 피드백)

### 중기
- [ ] NCIC 교육과정 매핑 (`ncicCode` 필드 + 마스터리 진행)
- [ ] 트로피/뱃지 시스템 (Phase E)
- [ ] 보호자 대시보드 NCIC 리포트

### 장기
- [ ] 전 학년 문제 콘텐츠 (~1,200문제)
- [ ] PWA 오프라인 완전 지원
- [ ] iOS/Android 앱스토어 배포

---
*마지막 업데이트: 2026-04-09 (Session 23)*

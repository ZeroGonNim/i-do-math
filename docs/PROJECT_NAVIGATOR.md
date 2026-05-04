# I Do Math — 프로젝트 네비게이터 (v2.5)

> **관리 원칙**: 소스 코드는 실제 파일에 맡기고, 본 파일은 "의사결정"과 "파일 위치"라는 지도 역할에 집중한다.

---

## 📍 1. 현재 개발 상태 (Session 26 기준)
- **진행 단계**: **전 학년(4, 5, 6학년) 통합 교육과정 완성** 및 **지능형 분석 시스템 고도화**
- **완성도**: 100% (4~6학년 핵심 문항 구축 완료)
- **주요 성과**:
  - **[콘텐츠]** 6학년 전 과정(1, 2학기) 552문항 신규 생성 및 통합 완료. 총 1,650여 문항 확보.
  - **[QA & 데이터 정화]** 
    - 5학년 분수 데이터 포맷({numerator, denominator}) 및 부등호 타입(symbol) 정규화.
    - 6학년 2단원 등 추상적이었던 `steps`를 구체적 수치 기반 수식으로 보강 (36건).
    - **수학적 검증 원칙(Verification Principle)** 도입: `node -e`를 통한 코드 기반 팩트 체크 의무화.
  - **[분석 알고리즘]** **지능형 추천 엔진 v2** 도입. 
    - **Skills 유사도**: 문항 간 필요한 기술(skills) 겹침 정도를 계산하여 연관 문제 우선 추천.
    - **자릿수 실수 감지**: 10배 차이 오답을 `precision_error`로 자동 분류.
  - **[보호자 대시보드]** **Recharts 전문 시각화** 적용.
    - **단원별 성취도(Radar)**: 육각형 차트로 학습 밸런스 시각화.
    - **실력 향상 추이(Line)**: 최근 7일 정답률 흐름 파악.
    - **성취도 분석(Pie)**: 한 번에 성공/재시도/실패 비율 도넛 차트.
    - **소요 시간 리포트**: 단원별 평균 풀이 시간(초) 데이터 제공.
  - **[피드백 시스템]** **지능형 처방 메시지** 구현. 오답 유형별 맞춤형 한글 뱃지 및 학습 조언 노출.

---

## 🗺️ 2. 핵심 파일 지도 (v2.5 업데이트)

### [Intelligent Engine]
- `src/shared/utils/recommendEngine.ts`: **[Advanced]** Skills 유사도 기반 정렬 및 지능형 난이도 조절 로직.
- `src/shared/utils/mistakeClassifier.ts`: **[Advanced]** 10배수 실수 및 수치형 텍스트 정밀 분석.
- `src/shared/utils/mistakeFeedback.ts`: **[New]** 오답 유형별 한글 레이블 및 전문가 처방 메시지 생성기.

### [Data Visualization]
- `src/features/parent/hooks/useDashboardData.ts`: **[New]** 대시보드용 통합 데이터 집계 훅 (성취도, 추세, 재시도, 소요 시간).
- `src/features/parent/components/`: **[New]** 시각화 컴포넌트군 (StatRadarChart, AccuracyLineChart, RetryPieChart, UnitAvgTimeList).

### [Problem Database]
- `public/data/problems-v1.json`: **[Updated]** 4, 5, 6학년 통합 1,650문항 마스터 데이터셋.

---

## 🛠️ 3. 기술적 의사결정 (Session 26)

1. **도구의 실용성 (Anti-Overengineering)**
   - 초등 수학 검증을 위해 무거운 SymPy 라이브러리 대신, 내장된 `node -e` 및 `python3 -c`를 활용한 가벼운 코드 기반 검산 원칙 채택.
2. **Skills 기반 연관성 분석**
   - 동일 단원 내에서도 사용되는 수학적 기술(Skills)이 다를 수 있음을 착안, 자카드 유사도(Jaccard Similarity) 개념을 응용하여 가장 연관성 높은 다음 문제 추천.
3. **데모 데이터 생성기 (Development Tools)**
   - 기록이 없는 초기 상태에서도 UI/UX 검증이 가능하도록, 버튼 하나로 정제된 학습 로그 30개를 주입하는 개발 전용 툴 임시 도입.
4. **데이터 무결성 최우선**
   - 기존의 텍스트 기반 `steps`를 수식 기반으로 마이그레이션하여 오답 노트에서의 해설 가독성 확보.

---

## 📅 4. 주요 업데이트 기록

- **6학년 전 과정 통합 및 지능형 분석 시스템 구축** (Session 26, 2026-04-16)
  - 6학년 552문항 생성 및 병합.
  - 학부모 대시보드 리팩토링 (Recharts 도입).
  - 지능형 추천 및 오답 분류 알고리즘 고도화.
  - `GEMINI.md`에 수학적 검증 원칙 명문화.

---

## 📋 5. 남은 작업

### 긴급 (보안)
- [x] **Supabase RLS 활성화** (옵션 A — 임시 차단, 2026-05-04)
  - `learning_logs`, `problem_reports`, `profiles` 3개 테이블에 RLS ON + anon insert/update만 허용
  - 트리거: Supabase 보안 경고 메일 (`rls_disabled_in_public`)
- [ ] **Supabase Auth 익명 로그인 + auth.uid() 기반 RLS 마이그레이션** (옵션 B — 정공법)
  - 온보딩 시 `signInAnonymously()` 호출 → `auth.uid()`를 `userId`로 채택
  - RLS 정책을 `auth.uid()::text = user_id` 기반으로 강화 → 본인 데이터만 read/write
  - 영향 파일: `src/shared/lib/supabase.ts`, `src/features/onboarding/hooks/useOnboarding.ts`, repo 3종 (`learningLogRepo`, `problemReportRepo`, `userProfileRepo`)

### 단기
- [ ] Figma Phase A 디자인 실제 컴포넌트 이식 (UI 고도화)
- [ ] 6학년 문항 중 고난도 문장제 수동 정밀 QA

### 중기
- [ ] 오답 노트 망각 곡선 복습 알림 (Spaced Repetition)
- [ ] 트로피/뱃지 시스템 (Phase E)

### 장기
- [ ] 앱스토어/플레이스토어 공식 배포 및 심사

---
*마지막 업데이트: 2026-05-04 (Supabase RLS 보안 조치)*

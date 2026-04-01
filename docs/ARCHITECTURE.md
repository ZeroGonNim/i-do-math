# Architecture

> 이 문서는 프로젝트의 아키텍처 결정 사항을 기록한다.
> 에이전트는 작업 전 이 문서를 참조하여 기존 설계를 존중한다.

---

## Overview

Frontend application built with:

- React 18+ (Hook 기반)
- TypeScript (strict mode)
- Zustand (클라이언트 상태)
- TanStack Query (서버 상태)
- Tailwind CSS

### Architecture Goals

- **Maintainable** — 단일 책임 원칙, 200줄 제한
- **Scalable** — Feature-based 모듈 구조
- **Testable** — 훅/유틸 분리로 독립적 테스트 가능

---

## State Management

| 구분 | 도구 | 용도 |
|---|---|---|
| 서버 상태 | TanStack Query | API 데이터, 캐싱, 뮤테이션 |
| 글로벌 UI 상태 | Zustand | 모달, 사이드바, 테마, 필터 |
| 로컬 상태 | useState / useReducer | 컴포넌트 내부 상태 |

> 상세 규칙: `rules/state.md` 참조

---

## Data Flow

```
UI → Hooks → Store/API → UI
```

1. UI가 사용자 액션을 트리거
2. 커스텀 훅이 비즈니스 로직 처리
3. Zustand(UI 상태) 또는 TanStack Query(서버 상태)가 데이터 처리
4. UI가 반응적으로 업데이트

---

## Design Principles

- **Feature-based architecture** — 도메인별 독립 모듈
- **Separation of concerns** — 뷰/로직/상태 분리
- **Reusable hooks** — 3개 이상 상태 관리 시 훅으로 추출
- **Stateless UI components** — 가능한 한 프레젠테이셔널 컴포넌트로 유지

---

## Key Architecture Decisions

<!-- 프로젝트 진행하면서 주요 결정 사항을 여기에 기록하세요 -->

| 날짜 | 결정 | 근거 |
|---|---|---|
| <!-- 예: 2026-03-29 --> | <!-- 예: Zustand 도입 --> | <!-- 예: Redux 대비 보일러플레이트 최소화 --> |

# HOOK Rules: 가볍고 강력한 시작과 끝 (v2.5)

---

## 1. [Before] 자동 매뉴얼 (Automatic Manual)
**"지도는 이미 머릿속에 있다. 지형만 확인한다."**

1.  **Hard Rules 확인**: `CLAUDE.md §2 (Absolute Hard Rules)` 6가지만 빠르게 복기한다.
2.  **Context Delta**: 현재 프로젝트의 파일 구조(`list_directory`)와 `package.json`을 읽어 실제 스택과 규칙의 차이를 확인한다.
3.  **선언**: 작업의 등급(T0-T2)과 JIT로 읽을 규칙 파일을 선언한다.

---

## 2. [During] 작업 기억 (Working Memory)
**"계획은 지도이고, 도구는 컴퍼스다."**

1.  **Step-by-Step**: `AGENTS.md`에서 수립한 Salami Slicing 계획을 한 단계씩 밟아나간다.
2.  **Periodical Check**: 대규모 로직 구현 후 또는 파일 저장 전, `rules/`의 핵심 지침(예: TypeScript, Error) 위반 여부를 빠르게 체크한다.

---

## 3. [After] 자가 검증 & 전문가 마무리 (Expert Finishing)

1.  **Done Criteria 검증**: 작업 전 합의한 완료 기준을 충족했는지 스스로 테스트(TDD)하고 보고한다.
    - **코드**: 타입 에러 없음(`tsc --noEmit`), 빌드 통과, `CLAUDE.md §2` Hard Rules 위반 없음
    - **와이어프레임**: `docs/wireframe/wireframe-checklist.md` 전체 수행
    - **문서**: 필수 섹션 존재, 기존 구조와의 정합성
2.  **전문가 피드백**: 단순히 "완료"가 아닌, **"어떤 아키텍처적 완성도를 높였는지"** 1줄로 요약한다.
3.  **Friction Logging**: 규칙이 작업 속도를 늦췄다면 `rules/meta.md`에 로그를 남긴다.

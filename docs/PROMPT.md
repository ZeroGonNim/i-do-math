# AI Development Prompt Template

> ⚠️ 이 문서의 핵심 내용은 `CLAUDE.md` §7 프롬프트 가이드에 통합되었습니다.
> 아래는 상세 참고용으로 유지합니다.

---

## AI 요청 시 권장 구조

### 1. Task

구현해야 할 기능을 설명한다.

예시:
- 사용자 로그인 기능 구현
- API 호출 후 사용자 목록 표시
- Zustand 상태 관리 적용

### 2. Context

현재 프로젝트 상황을 설명한다.

예시:
- React + Vite 프로젝트
- Zustand store 이미 존재
- API는 REST 방식

### 3. Constraints

제약 사항을 명시한다.

- 기존 구조 유지
- 파일 구조 변경 금지
- 불필요한 라이브러리 추가 금지

### 4. Expected Output

AI 응답 형식:

1. **결론** — 무엇을 했는지 요약
2. **코드** — 실행 가능한 코드 + 필요한 yarn 명령어
3. **설명** — 핵심 변경 사유 (단순 수정 시 생략 가능)

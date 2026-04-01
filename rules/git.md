# Git 컨벤션

---

## 1. 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <subject>

[body]
[footer]
```

| type | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 (기능 변화 없음) |
| `style` | 코드 포맷, 세미콜론 등 |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 패키지, 설정 변경 |

```bash
# ❌ BAD
git commit -m "수정"
git commit -m "버그 고침"
git commit -m "여러가지 변경사항"

# ✅ GOOD
git commit -m "feat(auth): 소셜 로그인 카카오 연동 추가"
git commit -m "fix(cart): 수량 0 입력 시 NaN 표시되는 버그 수정"
git commit -m "refactor(api): axios 인스턴스 싱글톤으로 변경"
```

---

## 2. 브랜치 전략

```
main ← develop ← feature/기능명
                ← fix/이슈번호-설명
                ← hotfix/긴급수정
```

```bash
# ❌ BAD
git checkout -b my-branch
git checkout -b test123

# ✅ GOOD
git checkout -b feature/social-login
git checkout -b fix/142-cart-nan-bug
git checkout -b hotfix/token-refresh-loop
```

---

## 3. PR 규칙

- PR 제목은 커밋 타입을 따른다: `feat(auth): 소셜 로그인 추가`
- 변경 파일 **10개 이하** 권장. 초과 시 PR을 분리한다.
- 셀프 리뷰 후 제출. 최소 1인 승인 후 머지.

# 보안 규칙

---

## 1. XSS 방어

### 1-1. `dangerouslySetInnerHTML` 금지

```tsx
// ❌ BAD — 사용자 입력을 그대로 HTML 렌더링
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ GOOD (불가피한 경우) — DOMPurify 적용 + PR 리뷰 필수
import DOMPurify from 'dompurify';

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(userComment),
    // ASSERT: 마크다운 에디터 출력이라 HTML 렌더링 필수. DOMPurify로 sanitize 처리.
  }}
/>
```

### 1-2. URL 파라미터 직접 주입 금지

```tsx
// ❌ BAD — URL 파라미터를 검증 없이 사용
const { query } = useParams();
return <h1>검색결과: {query}</h1>; // React가 이스케이프하지만...

// URL을 href에 넣는 경우는 위험
<a href={query}>링크</a>   // javascript: 프로토콜 공격 가능

// ✅ GOOD — URL 검증
const safeUrl = query?.startsWith('http') ? query : '#';
<a href={safeUrl}>링크</a>
```

---

## 2. 환경 변수

- `VITE_` / `NEXT_PUBLIC_` 접두사 변수에 **시크릿 절대 금지**.
- `.env` 파일은 `.gitignore`에 반드시 포함.
- `.env.example` 파일을 유지하여 필요한 변수 목록을 문서화.

```bash
# ❌ BAD — .env에 시크릿을 VITE_ 접두사로 노출
VITE_API_SECRET=sk-1234567890abcdef
VITE_DB_PASSWORD=mypassword

# ✅ GOOD — 클라이언트에 노출되어도 안전한 값만
VITE_API_BASE_URL=https://api.example.com
VITE_APP_VERSION=1.2.0
# 시크릿은 서버 사이드에서만 접근 (접두사 없이)
API_SECRET=sk-1234567890abcdef
```

---

## 3. 인증·토큰

| 토큰 | 저장 위치 | 근거 |
|---|---|---|
| Access Token | 메모리 (변수/Zustand) | XSS로 탈취 불가 |
| Refresh Token | `httpOnly` + `Secure` + `SameSite=Strict` 쿠키 | JS 접근 불가 |

```ts
// ❌ BAD — Access Token을 localStorage에 저장
localStorage.setItem('accessToken', token);

// ✅ GOOD — 메모리에만 보관
// stores/useAuthStore.ts
const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  setAccessToken: (token: string | null) => set({ accessToken: token }),
}));
```

### 토큰 자동 갱신

```ts
// ✅ Axios 인터셉터에서 자동 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post('/auth/refresh'); // httpOnly 쿠키 자동 전송
        useAuthStore.getState().setAccessToken(data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(error.config);
      } catch {
        useAuthStore.getState().setAccessToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 4. 의존성 보안

- 신규 패키지 설치 전 `yarn audit` 실행. Critical/High 취약점 있는 패키지는 **설치 금지**.
- 주 1회 `yarn audit` 실행하여 취약점 점검.
- 패키지 선택 기준: **주간 다운로드 10만+**, 최근 6개월 이내 업데이트, MIT/Apache 2.0 라이선스.

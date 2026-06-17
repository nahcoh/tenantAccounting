# Handoff: 카카오 & 구글 OAuth 로그인/회원가입 구현

## 현재 상태

현재 이메일/비밀번호 기반 JWT 인증이 구현되어 있음. 이 위에 OAuth2 소셜 로그인을 추가해야 함.

### 현재 인증 구조
- **백엔드**: `AuthController` → `AuthService` → `JwtTokenProvider` → JWT 발급
- **프론트엔드**: `TenantAuth.jsx` (로그인/회원가입 UI) → `api.js` (axios 인터셉터) → localStorage 토큰 저장
- **User 엔티티**: `id`, `email`, `password`, `name`, `createdAt`
- **SecurityConfig**: `/api/auth/**` permitAll, 나머지 authenticated
- **프론트엔드 소셜 버튼**: Google, Kakao 버튼이 이미 UI에 존재 (동작 미구현)

---

## 구현 목표

Google과 Kakao OAuth2를 통한 회원가입/로그인. 기존 이메일 로그인과 공존해야 함.

---

## 구현 가이드

### 1단계: OAuth 앱 등록 및 키 발급

#### Google
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: **Web application**
5. Authorized redirect URIs: `http://localhost:8080/api/auth/oauth2/callback/google`
6. Client ID와 Client Secret 저장

#### Kakao
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 앱 만들기
3. "앱 키" 에서 REST API 키 확인
4. "카카오 로그인" 활성화
5. Redirect URI 등록: `http://localhost:8080/api/auth/oauth2/callback/kakao`
6. "동의항목" 에서 이메일, 닉네임 필수 동의로 설정

### 2단계: application.yml에 OAuth 설정 추가

```yaml
# 기존 jwt 설정 아래에 추가
oauth2:
  google:
    client-id: ${GOOGLE_CLIENT_ID}
    client-secret: ${GOOGLE_CLIENT_SECRET}
    redirect-uri: http://localhost:8080/api/auth/oauth2/callback/google
    token-uri: https://oauth2.googleapis.com/token
    user-info-uri: https://www.googleapis.com/oauth2/v2/userinfo
  kakao:
    client-id: ${KAKAO_CLIENT_ID}
    client-secret: ${KAKAO_CLIENT_SECRET}
    redirect-uri: http://localhost:8080/api/auth/oauth2/callback/kakao
    token-uri: https://kauth.kakao.com/oauth/token
    user-info-uri: https://kapi.kakao.com/v2/user/me
```

### 3단계: User 엔티티 수정

`backend/src/main/java/com/starter/domain/User.java`에 OAuth 관련 필드 추가:

```java
// 추가할 필드들
@Column(name = "provider")
private String provider;        // "local", "google", "kakao"

@Column(name = "provider_id")
private String providerId;      // OAuth provider의 사용자 고유 ID

// password는 OAuth 사용자의 경우 null 허용 필요
// 기존: @Column(nullable = false) → 변경 필요
@Column
private String password;        // nullable로 변경 (OAuth 사용자는 비밀번호 없음)
```

**주의**: `password` 컬럼의 `nullable = false` 제약을 제거해야 함. OAuth 사용자는 비밀번호가 없음.

### 4단계: OAuth2 관련 백엔드 파일 생성

#### 4-1. OAuth2 Config 클래스
`backend/src/main/java/com/starter/config/OAuth2Config.java`

```java
// @ConfigurationProperties로 oauth2 설정을 바인딩
// google, kakao 각각의 clientId, clientSecret, redirectUri, tokenUri, userInfoUri를 보관
```

#### 4-2. AuthController에 OAuth 엔드포인트 추가

기존 `AuthController.java`에 추가할 엔드포인트:

```
GET  /api/auth/oauth2/authorize/{provider}
  → 프론트에서 소셜 로그인 버튼 클릭 시 호출
  → provider별 OAuth 인증 URL을 생성해서 redirect
  → 예: https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=email+profile&response_type=code

GET  /api/auth/oauth2/callback/{provider}?code=xxx
  → OAuth provider가 인증 후 redirect하는 콜백
  → authorization code를 받아서 access token 교환 → 사용자 정보 조회 → JWT 발급
  → 프론트엔드로 JWT를 전달하며 redirect
```

#### 4-3. OAuth2Service 생성
`backend/src/main/java/com/starter/service/OAuth2Service.java`

핵심 로직:
```
1. getAuthorizationUrl(provider)
   → provider별 OAuth 인증 URL 생성

2. processOAuthCallback(provider, authorizationCode)
   → authorization code → access token 교환 (provider token-uri에 POST)
   → access token → 사용자 정보 조회 (provider user-info-uri에 GET)
   → 사용자 정보로 회원 조회/생성
   → JWT access/refresh token 발급 후 반환
```

#### 4-4. 각 Provider별 사용자 정보 파싱

**Google 응답 구조:**
```json
{
  "id": "google-user-id",
  "email": "user@gmail.com",
  "name": "홍길동",
  "picture": "https://..."
}
```

**Kakao 응답 구조:**
```json
{
  "id": 12345678,
  "kakao_account": {
    "email": "user@kakao.com",
    "profile": {
      "nickname": "홍길동"
    }
  }
}
```

### 5단계: SecurityConfig 수정

`SecurityConfig.java`에서 OAuth 콜백 경로 허용:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()  // 기존 (이미 포함됨)
    // /api/auth/oauth2/** 는 /api/auth/** 하위이므로 추가 설정 불필요
    ...
)
```

### 6단계: 프론트엔드 수정

#### 6-1. TenantAuth.jsx 소셜 버튼에 동작 연결

현재 Google/Kakao 버튼이 UI에만 존재함. 클릭 시 백엔드 OAuth URL로 이동:

```javascript
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/api/auth/oauth2/authorize/google';
};

const handleKakaoLogin = () => {
  window.location.href = 'http://localhost:8080/api/auth/oauth2/authorize/kakao';
};
```

#### 6-2. OAuth 콜백 처리 페이지

`frontend/src/OAuthCallback.jsx` 생성:

백엔드가 OAuth 처리 후 프론트엔드로 redirect할 때 JWT를 query parameter로 전달:
```
http://localhost:5173/oauth/callback?accessToken=xxx&refreshToken=xxx
```

이 페이지에서:
1. URL query에서 토큰 추출
2. localStorage에 저장
3. `/` (메인)으로 navigate

#### 6-3. App.jsx에 OAuth 콜백 라우트 추가

```jsx
<Route path="/oauth/callback" element={<OAuthCallback />} />
```

### 7단계: 기존 로그인과의 충돌 처리

#### 같은 이메일로 소셜/일반 가입 시
- 이미 같은 이메일로 일반 가입된 계정이 있으면: 소셜 로그인 시 기존 계정에 provider 정보를 연동 (계정 병합)
- 이미 소셜로 가입된 이메일로 일반 가입 시도: "이미 {provider}로 가입된 이메일입니다" 에러 반환

#### AuthService.login() 수정
- password가 null인 사용자(OAuth 전용)가 일반 로그인 시도 시: "소셜 로그인으로 가입된 계정입니다" 에러 반환

---

## 파일 변경 목록

### 수정 필요
| 파일 | 변경 내용 |
|------|----------|
| `domain/User.java` | `provider`, `providerId` 필드 추가, `password` nullable 변경 |
| `controller/AuthController.java` | OAuth authorize/callback 엔드포인트 추가 |
| `service/AuthService.java` | OAuth 사용자 일반 로그인 시도 차단 로직 |
| `repository/UserRepository.java` | `findByProviderAndProviderId()` 메서드 추가 |
| `application.yml` | OAuth2 client 설정 추가 |
| `frontend/src/TenantAuth.jsx` | 소셜 버튼 onClick 핸들러 연결 |
| `frontend/src/App.jsx` | `/oauth/callback` 라우트 추가 |

### 신규 생성
| 파일 | 내용 |
|------|------|
| `config/OAuth2Config.java` | OAuth2 설정 바인딩 |
| `service/OAuth2Service.java` | OAuth 인증 코드 교환, 사용자 정보 조회, 계정 생성/연동 |
| `frontend/src/OAuthCallback.jsx` | OAuth 콜백 토큰 처리 페이지 |

---

## 주의사항

1. **Spring Security OAuth2 Client 라이브러리 사용 여부 결정 필요**
   - 옵션 A: `spring-boot-starter-oauth2-client` 사용 (Spring이 OAuth 흐름 자동 관리)
   - 옵션 B: 수동 구현 (RestTemplate/WebClient로 직접 token-uri, user-info-uri 호출)
   - 현재 프로젝트는 JWT 기반 stateless이므로 **옵션 B(수동 구현)**가 기존 구조와 일관성 있음
   - 옵션 A를 쓰면 세션 기반 흐름이 자동 적용되어 기존 JWT 구조와 충돌할 수 있음

2. **콜백에서 프론트로 토큰 전달 방식**
   - Query parameter: `?accessToken=xxx` (간단하지만 URL에 토큰 노출)
   - 권장: 일회용 임시 코드를 query로 전달 → 프론트가 코드로 토큰 교환하는 방식이 더 안전
   - 개발 단계에서는 query parameter로 시작해도 무방

3. **build.gradle 의존성 추가 불필요**
   - 수동 구현 시 기존 `spring-boot-starter-web`의 `RestTemplate`만으로 충분
   - `WebClient` 사용 시 `spring-boot-starter-webflux` 추가 필요

4. **CORS 설정**: 현재 `localhost:5173`만 허용 중. OAuth callback은 서버 간 통신이므로 CORS 영향 없음.

---

## 미해결 사항 (이전 PR 리뷰에서 보류된 것들)

프로덕션 배포 전 반드시 처리해야 할 항목:

- **#1**: `dataForPayments.sql` 평문 비밀번호 → BCrypt 해시로 변경
- **#3**: localStorage JWT 저장 → httpOnly 쿠키 방식 전환
- **#10**: `ddl-auto: update` → 프로덕션에서 `validate` 또는 `none`으로 변경

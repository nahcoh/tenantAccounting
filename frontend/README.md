# Ziplog Frontend

React/Vite 기반 Ziplog 웹 클라이언트입니다.

## 역할

- 랜딩, 로그인, OAuth2 리다이렉트 처리
- 계약 전 서류/특약/체크리스트 화면
- 비용 관리 화면: 납부 캘린더, 개요, 계약, 공과금, 대출
- 입주 중 유지보수 기록 화면
- 퇴거 체크리스트 화면
- 문의 작성, 내 문의, 관리자 문의함 화면

## 기술 스택

- React 18
- Vite 5
- React Router 7
- Axios
- Tailwind CSS
- lucide-react

## 주요 구조

```text
frontend/
├── src/
│   ├── App.jsx                         # 라우팅 구성
│   ├── api.js                          # Axios 인스턴스와 401 refresh 처리
│   ├── main.jsx                        # 앱 진입점
│   ├── contexts/AuthContext.jsx        # 인증 상태 관리
│   ├── components/                     # 공통 레이아웃, 라우트 가드, 모달, 지도
│   ├── hooks/useContract.js            # 계약 데이터 훅
│   ├── lib/                            # 라우팅/상수/유틸
│   └── pages/                          # 도메인별 페이지
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 라우트

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩 페이지 |
| `/auth` | 이메일 로그인/회원가입 및 OAuth 시작 |
| `/oauth/redirect` | OAuth2 로그인 완료 후 후처리 |
| `/terms`, `/privacy` | 약관, 개인정보처리방침 |
| `/before/documents` | 계약 전 서류 |
| `/before/terms` | 특약 |
| `/before/checklist` | 입주 전 체크리스트 |
| `/cost/calendar` | 납부 일정 캘린더 |
| `/cost/overview` | 비용 개요 |
| `/cost/contract` | 계약/보증금 정보 |
| `/cost/utilities` | 공과금 |
| `/cost/loan` | 대출 |
| `/during/maintenance` | 유지보수 기록 |
| `/after/checklist` | 퇴거 체크리스트 |
| `/support/inquiry` | 문의 작성 |
| `/support/my-inquiries` | 내 문의 |
| `/admin/inquiries` | 관리자 문의함 |

## 로컬 실행

```bash
npm install
npm run dev
```

기본 Vite 주소는 `http://localhost:5173`입니다.

`vite.config.js`에서 `/api` 요청은 `http://localhost:8080`으로 프록시됩니다. 백엔드가 먼저 실행되어 있어야 API 화면이 정상 동작합니다.

## API 호출 규칙

`src/api.js`의 Axios 인스턴스가 공통 API 클라이언트입니다.

- `baseURL`: `/api`
- `withCredentials`: `true`
- 응답이 `401`이면 `/api/auth/refresh`를 한 번 호출한 뒤 원 요청을 재시도
- refresh 실패 시 `/auth`로 이동

새 API 호출은 가능하면 이 인스턴스를 재사용합니다.

## 인증/권한

- `AuthContext`가 현재 사용자 상태를 관리합니다.
- `PrivateRoute`는 로그인된 사용자만 접근 가능한 화면을 보호합니다.
- `AdminRoute`는 관리자 화면을 보호합니다.
- `www.ziplog.kr` 접속은 앱 시작 시 `ziplog.kr`로 리다이렉트합니다.

## 스크립트

```bash
npm run dev       # 개발 서버
npm run lint      # ESLint
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
```

## 배포

`.github/workflows/frontend-deploy.yml`에서 `main` 브랜치의 `frontend/**` 변경 시 배포합니다.

배포 단계:

1. Node 20 설치
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `frontend/dist`를 S3 버킷에 동기화
6. CloudFront 캐시 무효화

workflow는 `VITE_API_BASE_URL`에 `PROD_API_URL` secret을 주입하지만, 현재 클라이언트의 공통 Axios 설정은 same-origin `/api`를 사용합니다. API origin 변경이 필요하면 `src/api.js`와 배포 라우팅 정책을 함께 확인해야 합니다.

## 개발 메모

- 화면은 `pages/{domain}` 기준으로 나뉩니다.
- 비용 관리 캘린더는 화면 계산량을 줄이기 위해 월별 데이터 매핑과 카운트를 메모이제이션합니다.
- 라우트 추가 시 `App.jsx`, 네비게이션을 제공하는 레이아웃 컴포넌트, 인증 요구사항을 함께 확인합니다.

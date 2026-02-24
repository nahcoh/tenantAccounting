# Ziplog (Tenant Housing Record App)

세입자의 계약 전/중/후 업무를 기록/관리하는 서비스입니다.

운영 상태:
- 프로덕션 도메인: `https://ziplog.kr`
- API 도메인: `https://api.ziplog.kr`
- 현재 실제 운영 중

## 핵심 기능

- 계약/서류/특약/체크리스트/유지보수/공과금/납부 일정 관리
- JWT + OAuth2 로그인(`Google`, `Kakao`)
- 문의하기/운영진 문의함 기능
- 체크리스트 파일 업로드(S3 저장)

## 기술 스택

- Frontend: `React 18`, `Vite`, `Tailwind CSS`, `React Router`, `Axios`
- Backend: `Java 17`, `Spring Boot 3.2`, `Spring Security`, `Spring Data JPA`
- Database: `MySQL 8`
- Infra(Frontend): `S3 + CloudFront`
- Infra(Backend): `Home Server(Ubuntu) + Docker Compose + Cloudflare Tunnel`
- CI/CD: `GitHub Actions`

## 운영 아키텍처

- 사용자 -> `ziplog.kr` -> CloudFront -> S3(정적 프론트)
- 프론트 API 호출 -> `api.ziplog.kr` -> Cloudflare Tunnel -> Home Server Backend(`:8080`)
- Backend -> MySQL 컨테이너
- 파일 저장 -> S3

## 배포 파이프라인

워크플로우:
- `/Users/nahcoh/Desktop/Dev.Web/tanent_record/.github/workflows/frontend-deploy.yml`
- `/Users/nahcoh/Desktop/Dev.Web/tanent_record/.github/workflows/backend-deploy.yml`
- `/Users/nahcoh/Desktop/Dev.Web/tanent_record/.github/workflows/ci.yml`

트리거:
- `main` 브랜치 push 시 프로덕션 배포
- `frontend/**` 변경 시 프론트 배포
- `backend/**` 또는 `docker-compose.prod.yml` 변경 시 백엔드 배포
- CI는 `main`, `develop`에서 동작

프론트 배포:
- `frontend` 빌드
- S3 sync
- CloudFront invalidation

백엔드 배포:
- 원격 서버(`/home/<user>/ziplog`)에 코드 전송
- `.env` 재생성(Secrets 주입)
- `docker compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans`
- 헬스체크 및 런타임 검증

## 로컬 실행

프론트:
```bash
cd frontend
npm install
npm run dev
```

백엔드:
```bash
cd backend
./gradlew bootRun
```

프로덕션 유사(Docker):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 주요 환경변수(백엔드)

- DB: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`
- JWT: `JWT_SECRET`
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- CORS/Cookie: `CORS_ALLOWED_ORIGINS`, `AUTH_COOKIE_DOMAIN`
- S3: `STORAGE_S3_ENABLED`, `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_S3_PREFIX`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## 운영 점검 커맨드

컨테이너 상태:
```bash
docker compose -f docker-compose.prod.yml ps
```

백엔드 로그:
```bash
docker compose -f docker-compose.prod.yml logs backend --since=10m | tail -n 300
```

API 상태 점검:
```bash
curl -i https://api.ziplog.kr/api/auth/me
```

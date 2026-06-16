# Ziplog

Ziplog는 세입자의 임대차 계약 전, 입주 중, 퇴거 후 기록을 한 곳에서 관리하는 주거 기록 서비스입니다.

## 현재 운영 구조

- 서비스 도메인: `https://ziplog.kr`
- API 도메인: `https://api.ziplog.kr`
- Frontend: React/Vite 정적 빌드, S3 + CloudFront 배포
- Backend: Spring Boot Docker 이미지, 운영 서버의 Docker Compose로 배포
- Database: MySQL 8 컨테이너
- File storage: 로컬 업로드 디렉터리 또는 S3
- API ingress: Cloudflare Tunnel 또는 API 도메인 라우팅
- CI/CD: GitHub Actions

## 주요 기능

- 이메일/JWT 로그인, Google/Kakao OAuth2 로그인
- 임대차 계약, 보증금 원천, 대출, 공과금, 납부 일정 관리
- 계약 전 서류, 특약, 체크리스트 관리
- 입주 중 유지보수 기록, 첨부파일 업로드/미리보기/다운로드
- 퇴거 체크리스트 관리
- 사용자 문의 및 관리자 답변

## 저장소 구조

```text
.
├── frontend/                 # React 18 + Vite 클라이언트
├── backend/                  # Java 17 + Spring Boot API 서버
├── terraform/                # AWS ECS/RDS 기반 Terraform 구성
├── docs/                     # 배포, OIDC, GitHub Secrets 운영 문서
├── .github/workflows/        # CI/CD 워크플로우
├── docker-compose.prod.yml   # 운영 백엔드 + MySQL Compose
├── docker-compose.yml        # 로컬 MySQL Compose
└── README.md                 # 프로젝트 전체 개요
```

역할별 상세 문서는 아래 README를 기준으로 관리합니다.

- Frontend: [frontend/README.md](./frontend/README.md)
- Backend: [backend/README.md](./backend/README.md)
- Infrastructure: [terraform/README.md](./terraform/README.md)
- Operations docs: [docs/README.md](./docs/README.md)

## 기술 스택

| 영역 | 스택 |
| --- | --- |
| Frontend | React 18, Vite 5, React Router 7, Axios, Tailwind CSS, lucide-react |
| Backend | Java 17, Spring Boot 3.2.10, Spring Security, Spring Data JPA, Springdoc OpenAPI |
| Data | MySQL 8, H2(test), Redis optional |
| Auth | JWT access/refresh cookie, Google OAuth2, Kakao OAuth2 |
| Storage | Local filesystem, AWS S3 optional |
| Infra | S3, CloudFront, Docker Compose, Cloudflare Tunnel, Terraform AWS modules |
| CI/CD | GitHub Actions, npm, Gradle, AWS CLI, SSH/SCP deploy |

## 로컬 실행

### 1. 데이터베이스

```bash
docker compose up -d mysql
```

`docker-compose.yml`은 로컬 개발용 MySQL만 실행합니다. 프론트와 백엔드는 각각 `npm run dev`, `./gradlew bootRun`으로 실행합니다.

### 2. 백엔드

```bash
cd backend
JWT_SECRET=localJwtSecretKeyThatIsAtLeast256BitsLongForHS256Token ./gradlew bootRun
```

기본 프로파일은 `local`이며 기본 DB URL은 `jdbc:mysql://localhost:3306/tenantAccounting`입니다.

### 3. 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

Vite 개발 서버는 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## 검증 명령

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend
./gradlew clean build
```

## 배포 흐름

프론트 배포는 `.github/workflows/frontend-deploy.yml`에서 관리합니다.

- `main` 브랜치의 `frontend/**` 변경 또는 수동 실행
- Node 20에서 `npm ci`, `npm run lint`, `npm run build`
- `frontend/dist`를 S3에 동기화
- CloudFront 캐시 무효화

백엔드 배포는 `.github/workflows/backend-deploy.yml`에서 관리합니다.

- `main` 브랜치의 `backend/**` 또는 `docker-compose.prod.yml` 변경 또는 수동 실행
- 운영 서버 `/home/<user>/ziplog`로 소스 복사
- GitHub Secrets 기반 `.env` 생성
- 기존 MySQL 컨테이너가 있으면 배포 전 덤프 백업 생성
- `docker compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans`
- `/api/auth/me` 런타임 검증

CI는 `.github/workflows/ci.yml`에서 프론트와 백엔드 변경 경로를 분리해 실행합니다.

## 운영 점검

운영 서버에서:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --since=10m
```

외부에서:

```bash
curl -i https://api.ziplog.kr/api/auth/me
```

인증되지 않은 요청은 정상적으로 `401`을 반환할 수 있습니다.

## 환경 변수

운영 백엔드의 주요 변수는 `.env.prod.example`과 `docker-compose.prod.yml`을 기준으로 합니다.

- `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- `CORS_ALLOWED_ORIGINS`, `AUTH_COOKIE_DOMAIN`
- `STORAGE_S3_ENABLED`, `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_S3_PREFIX`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## 참고 사항

- 실제 API prefix는 `/api`입니다. 오래된 `/api/v1` 문서는 현재 코드 기준과 다를 수 있습니다.
- `terraform/`은 AWS ECS/RDS 기반 인프라 구성이며, 현재 운영 Docker Compose 구조와 별개로 관리됩니다.
- 문서가 실제 동작과 어긋나면 README보다 소스 코드, workflow, compose 설정을 우선 확인하고 README를 함께 갱신합니다.

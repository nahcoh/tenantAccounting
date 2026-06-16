# Getting Started

Ziplog 로컬 개발 환경을 처음 실행하기 위한 최소 절차입니다.

## 사전 요구사항

- Node.js 20 권장
- Java 17
- Docker
- Git

## 1. 의존성 설치

프론트엔드:

```bash
cd frontend
npm install
```

백엔드는 Gradle wrapper를 사용하므로 별도 Gradle 설치가 필요 없습니다.

## 2. MySQL 실행

루트 디렉터리에서:

```bash
docker compose up -d mysql
```

기본 접속 정보:

- Host: `localhost`
- Port: `3306`
- Database: `tenantAccounting`
- Username: `root`
- Password: `password`

## 3. 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

기본 `local` 프로파일은 `backend/src/main/resources/application-local.yml`을 사용합니다.

로컬 기본값:

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Health: `http://localhost:8080/actuator/health`
- CORS: `http://localhost:5173`, `http://127.0.0.1:5173`

## 4. 프론트엔드 실행

새 터미널에서:

```bash
cd frontend
npm run dev
```

기본 주소는 `http://localhost:5173`입니다.

`frontend/vite.config.js`가 `/api` 요청을 `http://localhost:8080`으로 프록시합니다.

## 5. 검증

```bash
cd frontend
npm run lint
npm run build
```

```bash
cd backend
./gradlew clean build
```

## 자주 확인할 파일

- 전체 개요: [../README.md](../README.md)
- 프론트: [../frontend/README.md](../frontend/README.md)
- 백엔드: [../backend/README.md](../backend/README.md)
- 로컬 DB: [../docker-compose.yml](../docker-compose.yml)
- 운영 compose: [../docker-compose.prod.yml](../docker-compose.prod.yml)

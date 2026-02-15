# Tenant Housing Record App (Ziplog)

세입자의 계약 전/중/후 업무를 기록하고 관리하는 웹 서비스입니다.  
현재 프로덕션은 `ziplog.kr`에서 운영 중이며, 프론트/백엔드 모두 GitHub Actions로 자동 배포합니다.

## 핵심 기능

- 계약/서류/특약/체크리스트/유지보수/공과금/납부일정 관리
- JWT + OAuth2(Google, Kakao) 인증
- 파일 업로드/다운로드(체크리스트는 S3 저장)
- 체크리스트 파일 업로드 시 계약 단계별 S3 폴더 분리
  - `입주전`: `PRE_CONTRACT`, `ON_CONTRACT`
  - `입주중`: `POST_CONTRACT`
  - `입주후`: `MOVE_OUT`

## 기술 스택

- Frontend: React 18, Vite, Tailwind CSS, React Router v7, Axios
- Backend: Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, OAuth2 Client
- Data: MySQL 8
- Infra: EC2, Docker Compose, S3, CloudFront
- CI/CD: GitHub Actions

## 운영 아키텍처

- 사용자 요청
  - 정적 파일: `CloudFront -> S3(frontend bucket)`
  - API: `CloudFront -> EC2(backend container)`
- 백엔드
  - Spring Boot 컨테이너에서 MySQL 컨테이너 연결
  - 체크리스트 파일은 S3 버킷에 저장
- 데이터 보존
  - MySQL 데이터는 Docker named volume(`ziplog_mysql_data`) 사용
  - 배포 시 DB 백업(`mysqldump`) 자동 생성

## 배포 파이프라인 요약

워크플로우 파일: `.github/workflows/deploy.yml`

- `main`, `develop` push 시 실행
- 변경 경로 필터링
  - `backend/**`, `docker-compose.prod.yml` 변경 시 백엔드 배포
  - `frontend/**` 변경 시 프론트 배포
- 백엔드 배포
  - EC2로 코드 전송
  - `.env` 재생성(시크릿 주입)
  - `docker compose up -d --build --force-recreate`
  - 컨테이너 헬스체크/기동 검증
- 프론트 배포
  - 빌드 결과를 S3 동기화
  - CloudFront invalidation

## 최근 반영 사항 (운영 안정화)

- Actuator 기반 헬스체크 경로 정리 및 인증 이슈 보정
- 필수 시크릿 누락 시 배포 단계에서 즉시 실패 처리
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update` 주입으로 스키마 누락 이슈 완화
- MySQL 볼륨 이름 고정(`ziplog_mysql_data`)으로 재기동 시 데이터 유지 강화
- 체크리스트 업로드를 S3 저장으로 전환
- S3 버킷 값 정규화/검증 로직 추가
- S3 dotted bucket 대응(path-style access) 적용
- 업로드 실패 시 서버 로그 강화(운영 디버깅 속도 개선)

## 로컬 실행

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
./gradlew bootRun
```

### Docker (프로덕션 유사)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 필수 환경변수 (백엔드)

- DB: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`
- Auth: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`
- CORS/Cookie: `CORS_ALLOWED_ORIGINS`, `AUTH_COOKIE_DOMAIN`
- S3(체크리스트 업로드):
  - `STORAGE_S3_ENABLED`
  - `AWS_S3_BUCKET`
  - `AWS_REGION`
  - `AWS_S3_PREFIX`
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (또는 EC2 IAM Role)

## 장애 대응 시 빠른 점검

- 컨테이너 상태:
  - `docker ps --format "table {{.Names}}\t{{.Status}}"`
- 백엔드 최근 로그:
  - `docker compose -f docker-compose.prod.yml logs backend --since=10m | tail -n 300`
- 체크리스트 업로드 에러 필터:
  - `docker compose -f docker-compose.prod.yml logs backend --since=10m | grep -E "Checklist file upload failed|Caused by" -A4 -B2`

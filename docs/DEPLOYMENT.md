# Deployment

Ziplog의 현재 운영 배포 기준 문서입니다.

## 운영 구조

- Frontend: `frontend/dist` 정적 파일을 S3에 업로드하고 CloudFront 캐시를 무효화합니다.
- Backend: GitHub Actions가 운영 서버로 소스를 복사한 뒤 Docker Compose로 재기동합니다.
- Database: 운영 서버의 MySQL 8 컨테이너와 `ziplog_mysql_data` volume을 사용합니다.
- Files: `STORAGE_S3_ENABLED=true`이면 S3에 저장합니다.

## Workflow

| Workflow | Trigger | 역할 |
| --- | --- | --- |
| `.github/workflows/ci.yml` | `main`, `develop`, PR | 프론트 lint/build, 백엔드 build |
| `.github/workflows/frontend-deploy.yml` | `main` + `frontend/**`, 수동 실행 | S3/CloudFront 프론트 배포 |
| `.github/workflows/backend-deploy.yml` | `main` + `backend/**` 또는 `docker-compose.prod.yml`, 수동 실행 | 운영 서버 백엔드 배포 |

## Frontend 배포

GitHub Actions 단계:

1. Node 20 설정
2. `npm ci`
3. `npm run lint`
4. `npm run build`
5. `frontend/dist`를 `PROD_S3_BUCKET`에 업로드
6. `PROD_CLOUDFRONT_ID` 캐시 무효화

필요 secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `PROD_S3_BUCKET`
- `PROD_CLOUDFRONT_ID`
- `PROD_API_URL`

## Backend 배포

GitHub Actions 단계:

1. 운영 서버의 `/home/<user>/ziplog` 디렉터리 생성
2. `backend/**`, `docker-compose.prod.yml` 복사
3. Secrets로 운영 서버 `.env` 재생성
4. 기존 MySQL 컨테이너가 있으면 `mysqldump` 백업 생성
5. `docker compose -f docker-compose.prod.yml down --remove-orphans`
6. `docker compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans`
7. 컨테이너 상태와 `http://localhost:8080/api/auth/me` 응답 검증

필요 secrets:

- `PROD_EC2_HOST`
- `PROD_EC2_USER`
- `SSH_PORT`
- `EC2_SSH_KEY`
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `AUTH_COOKIE_DOMAIN`
- `STORAGE_S3_ENABLED`
- `AWS_S3_BUCKET`
- `AWS_S3_PREFIX`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## 운영 서버 점검

```bash
cd ~/ziplog
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs backend --since=10m
```

외부 API 점검:

```bash
curl -i https://api.ziplog.kr/api/auth/me
```

인증되지 않은 요청은 `401`을 반환할 수 있습니다. API 서버와 라우팅이 살아있는지 확인하는 용도입니다.

## 수동 재배포

운영 서버에서 직접 재기동해야 할 때:

```bash
cd ~/ziplog
docker compose -f docker-compose.prod.yml up -d --build --force-recreate --remove-orphans
```

## 롤백

현재 workflow는 서버에 최근 소스를 복사해 compose build를 수행합니다. 자동 이미지 태그 기반 롤백은 없습니다.

문제 발생 시 선택지는 다음과 같습니다.

- Git에서 이전 정상 커밋으로 되돌린 뒤 `main`에 반영해 재배포
- 운영 서버의 `~/ziplog/backups/mysql_*.sql`로 DB 복구 검토
- 프론트만 문제이면 이전 빌드를 다시 S3에 업로드하고 CloudFront를 무효화

## Terraform과의 관계

[../terraform](../terraform)은 AWS ECS/RDS 기반 인프라 코드입니다. 현재 production 배포 경로는 SSH + Docker Compose이며 Terraform과 직접 연결되어 있지 않습니다.

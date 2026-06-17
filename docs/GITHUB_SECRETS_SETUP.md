# GitHub Secrets Setup

현재 GitHub Actions workflow에서 사용하는 repository/environment secrets 목록입니다.

## Frontend Deploy

`.github/workflows/frontend-deploy.yml`에서 사용합니다.

| Secret | 설명 |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | S3/CloudFront 배포용 AWS access key |
| `AWS_SECRET_ACCESS_KEY` | S3/CloudFront 배포용 AWS secret key |
| `PROD_S3_BUCKET` | 정적 프론트 파일을 업로드할 S3 버킷 |
| `PROD_CLOUDFRONT_ID` | 캐시 무효화 대상 CloudFront distribution ID |
| `PROD_API_URL` | 프론트 빌드 시 주입되는 운영 API URL |

## Backend Deploy

`.github/workflows/backend-deploy.yml`에서 사용합니다.

| Secret | 설명 |
| --- | --- |
| `PROD_EC2_HOST` | 운영 서버 host |
| `PROD_EC2_USER` | 운영 서버 SSH 사용자 |
| `SSH_PORT` | SSH 포트 |
| `EC2_SSH_KEY` | 운영 서버 접속 private key |
| `MYSQL_ROOT_PASSWORD` | 운영 MySQL root password |
| `MYSQL_DATABASE` | 운영 DB 이름 |
| `JWT_SECRET` | JWT 서명 키 |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `KAKAO_CLIENT_ID` | Kakao OAuth2 client id |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth2 client secret |
| `CORS_ALLOWED_ORIGINS` | 백엔드 CORS 허용 origin 목록 |
| `AUTH_COOKIE_DOMAIN` | 인증 쿠키 domain |
| `STORAGE_S3_ENABLED` | S3 파일 저장 활성화 여부 |
| `AWS_S3_BUCKET` | 업로드 파일 저장 S3 버킷 |
| `AWS_S3_PREFIX` | 업로드 파일 prefix |
| `AWS_REGION` | S3 region |
| `AWS_ACCESS_KEY_ID` | S3 파일 저장용 AWS access key |
| `AWS_SECRET_ACCESS_KEY` | S3 파일 저장용 AWS secret key |

## CI

`.github/workflows/ci.yml`에서 사용합니다.

| Secret | 설명 |
| --- | --- |
| `PROD_API_URL` | `main` 브랜치 프론트 빌드 시 API URL |
| `DEV_API_URL` | `develop` 브랜치 프론트 빌드 시 API URL |

## 설정 위치

GitHub repository에서:

```text
Settings -> Secrets and variables -> Actions
```

운영 environment를 사용하는 경우:

```text
Settings -> Environments -> production -> Environment secrets
```

## 점검 기준

- secret 이름은 workflow 파일의 `${{ secrets.NAME }}`와 정확히 일치해야 합니다.
- `JWT_SECRET`은 HS256에 충분한 길이의 임의 문자열을 사용합니다.
- `CORS_ALLOWED_ORIGINS`는 쉼표 구분 문자열입니다. 예: `https://ziplog.kr,https://www.ziplog.kr`
- `AUTH_COOKIE_DOMAIN`은 운영에서 `.ziplog.kr` 형식을 권장합니다.
- `STORAGE_S3_ENABLED=true`이면 `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`가 필요합니다.

# Ziplog Backend

Ziplog의 Spring Boot API 서버입니다.

## 역할

- 이메일/JWT 인증과 Google/Kakao OAuth2 로그인
- 계약, 보증금 원천, 대출, 공과금, 납부 일정 API
- 서류, 특약, 체크리스트, 유지보수 기록 API
- 문의/관리자 답변 API
- 첨부파일 로컬 저장 또는 S3 저장
- Swagger/OpenAPI 문서 제공

## 기술 스택

- Java 17
- Spring Boot 3.2.10
- Spring Security
- Spring Data JPA / Hibernate
- Spring OAuth2 Client
- Spring Actuator
- MySQL 8
- H2(test)
- Redis optional
- AWS SDK for S3
- JJWT
- Springdoc OpenAPI
- Gradle 8.10 wrapper

## 주요 구조

```text
backend/
├── src/main/java/com/starter/
│   ├── advice/              # 전역 예외 처리
│   ├── config/              # Security, Redis, S3, OpenAPI, multipart 설정
│   ├── controller/          # REST API
│   ├── domain/              # JPA 엔티티
│   ├── dto/                 # 요청/응답 DTO
│   ├── enums/               # 도메인 enum
│   ├── repository/          # JPA repository
│   ├── security/            # JWT, UserDetails, OAuth2 지원
│   ├── service/             # 비즈니스 로직
│   ├── utils/               # 쿠키 유틸
│   └── StarterApplication.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-prod.yml
│   ├── application-test.yml
│   └── db/migration/
├── Dockerfile
├── build.gradle
└── README.md
```

## 로컬 실행

### 1. MySQL 실행

루트 디렉터리에서:

```bash
docker compose up -d mysql
```

기본 DB 설정:

- URL: `jdbc:mysql://localhost:3306/tenantAccounting`
- Username: `root`
- Password: `password`

### 2. 애플리케이션 실행

```bash
JWT_SECRET=localJwtSecretKeyThatIsAtLeast256BitsLongForHS256Token ./gradlew bootRun
```

기본 프로파일은 `local`입니다. `application.yml`의 `spring.profiles.default`가 `local`로 설정되어 있습니다.

### 3. API 문서 확인

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`
- Health check: `http://localhost:8080/actuator/health`

## 테스트와 빌드

```bash
./gradlew test
./gradlew clean build
./gradlew clean build -x test
```

`application-test.yml`은 H2 메모리 DB를 사용합니다.

## 주요 API

기본 prefix는 `/api`입니다.

| 영역 | 엔드포인트 |
| --- | --- |
| 인증 | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `DELETE /api/users/me` |
| OAuth2 | `GET /oauth2/authorize/{provider}`, `GET /login/oauth2/code/{provider}` |
| 계약 | `/api/contracts` |
| 서류 | `/api/contracts/{contractId}/documents`, `/api/documents/{id}` |
| 특약 | `/api/contracts/{contractId}/special-terms`, `/api/special-terms/{id}` |
| 체크리스트 | `/api/contracts/{contractId}/checklists`, `/api/checklists/{id}` |
| 유지보수 | `/api/contracts/{contractId}/maintenances`, `/api/maintenances/{id}` |
| 납부 | `/api/payments`, `/api/payments/calendar/{year}/{month}`, `/api/payments/overview/{year}/{month}` |
| 공과금 | `/api/utilities` |
| 대출 | `/api/loans` |
| 문의 | `/api/inquiries`, `/api/inquiries/mine` |
| 관리자 문의 | `/api/admin/inquiries` |

파일 업로드/다운로드/미리보기 API는 서류, 특약, 체크리스트, 유지보수 도메인에 각각 포함되어 있습니다.

## 인증과 보안

- 기본 인증 방식은 JWT access/refresh token입니다.
- 토큰은 쿠키 기반으로 주고받습니다.
- `SecurityConfig`에서 `/api/auth/signup`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/check-email`, OAuth2 경로, actuator health, Swagger 경로만 공개합니다.
- `/api/admin/inquiries/**`는 `ADMIN` 역할이 필요합니다.
- CORS 허용 origin은 `CORS_ALLOWED_ORIGINS`로 쉼표 구분 설정합니다.

## 환경 변수

`application.yml`, `application-prod.yml`, `.env.prod.example`, `docker-compose.prod.yml`을 기준으로 관리합니다.

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/tenantAccounting` |
| `SPRING_DATASOURCE_USERNAME` | DB 사용자 | `root` |
| `SPRING_DATASOURCE_PASSWORD` | DB 비밀번호 | `password` |
| `JWT_SECRET` | JWT 서명 키 | 없음, 실행 시 필요 |
| `JWT_ACCESS_TOKEN_EXPIRATION` | access token 만료 ms | `3600000` |
| `JWT_REFRESH_TOKEN_EXPIRATION` | refresh token 만료 ms | `604800000` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth2 | `not-set` |
| `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET` | Kakao OAuth2 | `not-set` |
| `GOOGLE_REDIRECT_URI`, `KAKAO_REDIRECT_URI` | OAuth2 provider redirect URI | `https://ziplog.kr/login/oauth2/code/*` |
| `OAUTH2_REDIRECT_URI` | 로그인 성공 후 프론트 이동 URI | `https://ziplog.kr/oauth/redirect` |
| `CORS_ALLOWED_ORIGINS` | 허용 origin 목록 | `https://ziplog.kr` |
| `AUTH_COOKIE_DOMAIN` | 인증 쿠키 domain | prod: `.ziplog.kr` |
| `AUTH_COOKIE_SECURE` | secure cookie 여부 | `true` |
| `AUTH_COOKIE_SAME_SITE` | SameSite 정책 | local: `Lax`, prod: `None` |
| `FILE_UPLOAD_DIR` | 로컬 업로드 경로 | `./uploads` |
| `STORAGE_S3_ENABLED` | S3 저장 활성화 | `false` |
| `AWS_S3_BUCKET` | S3 버킷 | 빈 값 |
| `AWS_REGION` | AWS region | `ap-northeast-2` |
| `AWS_S3_PREFIX` | S3 object prefix | `checklists` |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_ENABLED` | Redis 설정 | optional |

## Docker 운영

루트 디렉터리에서:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

운영 compose는 다음 서비스를 띄웁니다.

- `mysql`: MySQL 8, volume `ziplog_mysql_data`
- `backend`: Spring Boot API, `SPRING_PROFILES_ACTIVE=prod`, 포트 `8080`

운영 배포 workflow는 서버에서 `.env`를 재생성하고, 기존 DB 컨테이너가 있으면 배포 전 `mysqldump` 백업을 생성합니다.

## 데이터베이스와 마이그레이션

- 기본 JPA ddl-auto는 `validate`입니다.
- 운영 compose는 `SPRING_JPA_HIBERNATE_DDL_AUTO`를 환경 변수로 주입하며 기본값은 `update`입니다.
- Flyway는 설정상 활성화되어 있고 migration 파일은 `src/main/resources/db/migration/`에 있습니다.

스키마 변경 시 운영 영향이 있으므로 엔티티, migration, `ddl-auto` 전략을 함께 확인합니다.

## 개발 규칙

- Entity를 컨트롤러 응답으로 직접 노출하지 않고 DTO를 사용합니다.
- 인증이 필요한 API는 `UserPrincipal` 기준으로 현재 사용자를 확인합니다.
- 파일 API 변경 시 로컬 저장과 S3 저장 경로를 모두 확인합니다.
- 새 API 추가 시 Swagger 어노테이션 또는 명확한 DTO 이름으로 문서성을 유지합니다.

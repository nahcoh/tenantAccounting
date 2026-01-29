# AI Native Developer Starter Kit - Backend

Spring Boot 기반 백엔드 API 서버입니다.

## 기술 스택

- **Framework**: Spring Boot 3.2.10
- **Language**: Java 17
- **Build Tool**: Gradle 8.10
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA (Hibernate)
- **Documentation**: Springdoc OpenAPI 3 (Swagger)

## 프로젝트 구조

```
backend/
├── src/main/java/com/starter/
│   ├── config/           # 설정 클래스 (Swagger, CORS 등)
│   ├── controller/       # REST API 컨트롤러
│   ├── service/          # 비즈니스 로직
│   ├── repository/       # 데이터 액세스 레이어
│   ├── domain/           # JPA 엔티티
│   ├── dto/              # Data Transfer Objects
│   └── StarterApplication.java
├── src/main/resources/
│   ├── application.yml        # 기본 설정
│   ├── application-local.yml  # 로컬 개발 환경 설정
│   └── application-prod.yml   # 프로덕션 환경 설정
├── src/test/             # 테스트 코드
├── build.gradle          # Gradle 빌드 설정
└── README.md             # 이 파일
```

## 시작하기

### 사전 요구사항

- Java 17 이상
- PostgreSQL 15 이상 권장 (선택 사항 - Health Check API는 DB 없이 동작)

### 환경 변수 설정

로컬 개발 환경에서는 환경 변수를 설정할 필요가 없습니다. `application-local.yml`에 기본 설정이 포함되어 있습니다.

**프로덕션 환경**에서는 다음 환경 변수를 설정하세요:

```bash
# 필수 설정
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_db_name
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_secure_password

# 선택 설정 (프로젝트별 추가)
# CLAUDE_API_KEY=your_anthropic_api_key
# SENTRY_DSN=your_sentry_dsn
# LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
# LANGFUSE_SECRET_KEY=your_langfuse_secret_key
```

### 애플리케이션 실행

```bash
# 빌드
./gradlew clean build

# 실행 (local 프로파일)
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# 또는 JAR 파일로 실행
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

서버가 시작되면 http://localhost:8080 에서 접근 가능합니다.

## API 문서

애플리케이션 실행 후 Swagger UI를 통해 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

### API 문서 작성 가이드

새로운 API를 추가할 때는 다음 어노테이션을 사용하여 문서화하세요:

#### Controller 레벨
```java
@Tag(name = "API 그룹명", description = "API 그룹 설명")
@RestController
@RequestMapping("/api/v1/...")
public class YourController {
    // ...
}
```

#### 메서드 레벨
```java
@Operation(summary = "API 요약", description = "API 상세 설명")
@ApiResponses(value = {
    @ApiResponse(
        responseCode = "200",
        description = "성공",
        content = @Content(schema = @Schema(implementation = ResponseDto.class))
    ),
    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
    @ApiResponse(responseCode = "500", description = "서버 오류")
})
@PostMapping("/endpoint")
public ResponseEntity<ResponseDto> yourMethod(@Valid @RequestBody RequestDto request) {
    // ...
}
```

#### DTO 레벨
```java
@Schema(description = "요청/응답 DTO 설명")
public class YourDto {

    @Schema(description = "필드 설명", example = "예시 값", required = true)
    private String field;

    // ...
}
```

## 주요 엔드포인트

### Health Check

서버 상태를 확인합니다.

```bash
GET /api/v1/health
```

**응답 예시:**
```json
{
  "status": "UP",
  "message": "Backend API 서버가 정상적으로 실행 중입니다.",
  "timestamp": "2025-10-20T09:30:00.000000",
  "version": "0.0.1-SNAPSHOT"
}
```

## 개발 가이드

### 코드 스타일

- Java 17 features 사용
- Lombok 어노테이션 활용
- RESTful API 규칙 준수
- DTO 패턴 사용 (Entity 직접 반환 금지)

### 테스트 실행

```bash
./gradlew test
```

### 빌드 (테스트 제외)

```bash
./gradlew clean build -x test
```

## 배포

### Docker

```bash
# Docker 이미지 빌드
docker build -t backend:latest .

# 컨테이너 실행
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/your_db_name \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  backend:latest
```

### AWS ECS / Kubernetes

배포 관련 설정은 `terraform/` 디렉토리 및 `.github/workflows/` 파일을 참고하세요.

## 문의 및 지원

- **문서**: [프로젝트 README](../README.md)
- **Frontend**: [Frontend 가이드](../frontend/CLAUDE.md)
- **Issues**: GitHub Issues에 버그 또는 기능 요청 등록

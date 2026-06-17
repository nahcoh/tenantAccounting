# 코스 생성 API 문서

## 개요

Claude AI를 활용하여 사용자 입력(지역, 유형, 예산)을 기반으로 데이트 코스 3개를 자동 생성하는 API입니다.

## API Endpoint

### POST /api/v1/courses/generate

데이트 코스 3개를 생성합니다.

**Request Body:**

```json
{
  "region": "홍대",
  "dateType": "문화데이트",
  "budget": 100000
}
```

**Request Fields:**

| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| region | String | Yes | 데이트 지역 | 비어있지 않아야 함 |
| dateType | String | Yes | 데이트 유형 | 비어있지 않아야 함 |
| budget | Integer | Yes | 예산 (원) | 최소 10,000원 이상 |

**Response (200 OK):**

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "generatedAt": "2025-10-13T14:30:00",
  "courses": [
    {
      "courseId": "c1",
      "title": "홍대 감성 문화 코스",
      "places": [
        {
          "placeId": "p1",
          "name": "홍대 앞 카페거리",
          "category": "카페",
          "estimatedCost": 15000,
          "estimatedDuration": 60,
          "description": "감성적인 분위기의 카페에서 여유로운 시간"
        },
        {
          "placeId": "p2",
          "name": "상수동 맛집",
          "category": "식당",
          "estimatedCost": 40000,
          "estimatedDuration": 90,
          "description": "분위기 좋은 레스토랑에서 식사"
        }
      ],
      "totalCost": 95000,
      "totalTime": "4.5시간"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request**: 유효하지 않은 요청 (필수 필드 누락, 예산 범위 초과 등)
- **500 Internal Server Error**: 서버 오류 (Claude API 호출 실패, 파싱 오류 등)

## 기술 스택

### 핵심 기능

1. **Claude AI 연동**
   - Model: claude-sonnet-4-20250514
   - Timeout: 30초
   - Max Tokens: 4096

2. **Redis 캐싱**
   - Cache Key: MD5(region + dateType + budget)
   - TTL: 24시간
   - 캐시 히트 시 즉시 응답

3. **Circuit Breaker (Resilience4j)**
   - Sliding Window: 10 calls
   - Failure Threshold: 50%
   - Wait Duration (Open): 10초
   - Fallback: 룰 베이스 추천

4. **Langfuse Tracing**
   - AI 요청/응답 추적
   - 성능 모니터링
   - 디버깅 지원

### 아키텍처

```
Client Request
    ↓
CourseGenerationController
    ↓
CourseGenerationService
    ├─→ CourseCacheService (Redis)
    │   └─→ Cache Hit? → Return
    ├─→ LangfuseTraceService (Start Trace)
    ├─→ ClaudeApiService (with Circuit Breaker)
    │   ├─→ Claude API Call
    │   └─→ Fallback (룰 베이스 추천)
    ├─→ CourseCacheService (Save to Cache)
    └─→ LangfuseTraceService (Record Trace)
```

## 성능 요구사항

| 지표 | 목표값 |
|------|-------|
| P50 | < 3초 |
| P95 | < 8초 |
| Timeout | 30초 |
| Cache Hit Rate | > 70% |

## 로컬 개발 환경

### 환경 변수

```bash
# Claude API
CLAUDE_API_KEY=your_anthropic_api_key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Langfuse (Optional)
LANGFUSE_PUBLIC_KEY=your_public_key
LANGFUSE_SECRET_KEY=your_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# PostgreSQL
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ddalkkak
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

### Docker Compose 실행

```bash
# PostgreSQL + Redis 실행
docker-compose up -d postgres redis

# 애플리케이션 실행
./gradlew bootRun
```

### Swagger UI

API 문서는 다음 URL에서 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

## 테스트

### 단위 테스트 실행

```bash
./gradlew test
```

### 수동 API 테스트

```bash
curl -X POST http://localhost:8080/api/v1/courses/generate \
  -H "Content-Type: application/json" \
  -d '{
    "region": "홍대",
    "dateType": "문화데이트",
    "budget": 100000
  }'
```

## Circuit Breaker 동작

### 정상 상태 (Closed)
- 모든 요청이 Claude API로 전달됨
- 실패율 50% 이하 유지

### 열림 상태 (Open)
- Claude API 호출 중단
- Fallback 메서드로 룰 베이스 추천 제공
- 10초 후 Half-Open 전환

### 반열림 상태 (Half-Open)
- 3개의 테스트 요청 전송
- 성공 시 Closed 전환
- 실패 시 다시 Open

## Fallback 로직

Claude API 실패 시 룰 베이스 추천을 제공:

```
1. {지역} 인기 카페 (예산의 20%)
2. {지역} 맛집 (예산의 40%)
3. {지역} 산책로 (무료)
```

## 모니터링

### Langfuse 대시보드

- Trace ID로 요청 추적
- AI 응답 시간 분석
- 비용 모니터링
- 에러율 확인

### Actuator Endpoints

```bash
# Circuit Breaker 상태 확인
curl http://localhost:8080/actuator/health

# Metrics 확인
curl http://localhost:8080/actuator/metrics
```

## 배포

### Docker 빌드

```bash
docker build -t ddalkkak-backend .
docker run -p 8080:8080 ddalkkak-backend
```

### 환경별 설정

- **Local**: application.yml
- **Dev**: application-dev.yml (예정)
- **Prod**: application-prod.yml (예정)

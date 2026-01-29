# 프로젝트 문서 관리

이 디렉토리는 프로젝트의 작업 컨텍스트, 의사결정, 기술 명세를 관리합니다.

## 디렉토리 구조

```
docs/
├── README.md                    # 이 파일
├── decisions/                   # 기술적 의사결정 (ADR)
│   └── ADR-YYYY-MM-DD-{제목}.md
├── context/                     # 작업 컨텍스트 (JIRA 티켓별)
│   └── SCRUM-{번호}-{제목}.md
├── specs/                       # API/기능 명세
│   └── {기능명}.md
├── operations/                  # 운영 가이드
│   └── {주제}.md
└── [기타 인프라/배포 문서들]
```

## 문서 유형별 가이드

### 1. 기술적 의사결정 (ADR - Architecture Decision Records)

**위치**: `docs/decisions/ADR-YYYY-MM-DD-{제목}.md`

**작성 시점**:
- 새로운 기술 스택이나 라이브러리를 선택할 때
- 아키텍처 패턴이나 설계 방식을 결정할 때
- 중요한 기술적 트레이드오프가 발생할 때

**템플릿**:
```markdown
# ADR-YYYY-MM-DD: {제목}

## 상태
제안됨 | 승인됨 | 대체됨 | 폐기됨

## 컨텍스트
{어떤 문제를 해결하려고 했는가?}

## 결정 사항
{어떤 선택을 했는가?}

## 근거
{왜 이 선택을 했는가?}

## 대안
{고려했던 다른 옵션들}

## 결과
{이 결정의 긍정적/부정적 영향}

## 관련 티켓
- JIRA: SCRUM-XX
- GitHub PR: #YY
```

### 2. 작업 컨텍스트 (Work Context)

**위치**: `docs/context/SCRUM-{번호}-{제목}.md`

**작성 시점**:
- 복잡한 버그를 해결했을 때
- 새로운 기능을 구현하면서 중요한 학습이 있었을 때
- 향후 유사한 작업에 참고할 만한 내용이 있을 때

**템플릿**:
```markdown
# SCRUM-{번호}: {티켓 제목}

## 작업 개요
{티켓 요약}

## 기술적 도전 과제
{구현 중 직면한 어려움}

## 해결 방법
{문제를 어떻게 해결했는가}

## 학습 내용
{이 작업을 통해 배운 것}

## 향후 개선 사항
{리팩토링이나 최적화가 필요한 부분}

## 관련 자료
- 참고 문서
- 외부 링크
- 관련 코드
```

### 3. API/기능 명세 (Specifications)

**위치**: `docs/specs/{기능명}.md`

**작성 시점**:
- 새로운 API 엔드포인트를 추가할 때
- 데이터 모델이나 인터페이스를 정의할 때
- 프론트엔드-백엔드 간 계약을 명확히 해야 할 때

**템플릿**:
```markdown
# {기능명} API 명세

## 개요
{API의 목적과 기능 설명}

## 엔드포인트

### POST /api/v1/{endpoint}

**요청**:
\```json
{
  "field1": "string",
  "field2": 123
}
\```

**응답**:
\```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "result": "string"
  }
}
\```

**에러**:
\```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
\```

## 데이터 모델

### Entity 구조
\```typescript
interface Entity {
  id: string;
  field1: string;
  field2: number;
  createdAt: Date;
}
\```

## 비즈니스 로직
{주요 비즈니스 규칙과 제약사항}

## 보안
{인증/인가 요구사항}

## 성능
{응답 시간 목표, 처리량 제한}
```

### 4. 운영 가이드 (Operations)

**위치**: `docs/operations/{주제}.md`

**작성 시점**:
- 배포 절차가 변경되었을 때
- 새로운 모니터링 도구를 추가했을 때
- 장애 대응 프로세스를 정의할 때

**템플릿**:
```markdown
# {주제} 운영 가이드

## 개요
{이 가이드의 목적}

## 사전 요구사항
{필요한 도구, 권한, 환경}

## 절차

### 1. {단계 제목}
{상세 설명}

\```bash
# 명령어 예시
command --option value
\```

### 2. {단계 제목}
{상세 설명}

## 모니터링
{모니터링 방법, 메트릭, 알림}

## 트러블슈팅
{자주 발생하는 문제와 해결 방법}

## 롤백 절차
{문제 발생 시 롤백 방법}
```

## 문서 작성 가이드라인

### 작성 원칙

1. **명확성**: 누구나 이해할 수 있도록 명확하게 작성
2. **간결성**: 핵심만 담아서 빠르게 파악 가능하도록
3. **최신성**: 변경사항 발생 시 즉시 업데이트
4. **추적성**: 관련 JIRA 티켓, GitHub PR, 참고 자료 링크

### 문서 업데이트 시점

- JIRA 티켓 완료 시 (`/jira-complete` 실행 중)
- 중요한 기술적 결정을 내렸을 때
- 기능 명세가 변경되었을 때
- 운영 절차가 업데이트되었을 때

### 문서 관리

- **파일명 규칙**: 날짜, 티켓 번호, 간단한 설명 포함
- **버전 관리**: Git으로 문서 변경 이력 추적
- **정기 검토**: 분기별로 문서 최신성 검토

## 기존 문서

현재 저장된 문서들:

- `AWS_OIDC_SETUP.md` - AWS OIDC 설정 가이드
- `DEPLOYMENT.md` - 배포 가이드
- `GITHUB_SECRETS_SETUP.md` - GitHub Secrets 설정 가이드

## 문서 검색

필요한 문서를 찾는 방법:

```bash
# 특정 키워드로 검색
grep -r "keyword" docs/

# 티켓 번호로 검색
grep -r "SCRUM-42" docs/

# 최근 수정된 문서 확인
ls -lt docs/**/*.md | head -10
```

## 참고 자료

- [Architecture Decision Records (ADR)](https://adr.github.io/)
- [Documentation Best Practices](https://documentation.divio.com/)

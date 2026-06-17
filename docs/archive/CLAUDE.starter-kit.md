# CLAUDE.md - AI Native Developer Starter Kit

**Claude Code 개발 워크플로우 완전 가이드**

이 파일은 Claude Code (`claude.ai/code`)와 함께 작업할 때 최상의 결과를 얻기 위한 가이드입니다.

---

## 📦 프로젝트 구조

```
ai-native-developer-starter-kit/
├── frontend/              # Next.js 14 웹 애플리케이션
│   ├── app/              # App Router 페이지
│   ├── components/       # 재사용 가능 컴포넌트
│   ├── instrumentation.ts # Sentry 설정
│   └── CLAUDE.md         # Frontend 개발 가이드
├── backend/               # Spring Boot API 서버
│   ├── src/
│   │   ├── main/java/    # Java 소스 코드
│   │   └── test/java/    # 테스트 코드
│   ├── build.gradle      # Gradle 빌드 설정
│   └── README.md         # Backend 개발 가이드
├── docs/                  # 프로젝트 문서 및 템플릿
├── examples/              # PRD, 기능 명세 예시
├── .github/workflows/     # CI/CD 파이프라인
├── docker-compose.yml     # 로컬 개발 환경
├── .env.example           # 환경 변수 템플릿
├── CLAUDE.md              # 이 파일
└── README.md              # 프로젝트 소개
```

---

## 🤖 AI Native 개발 워크플로우

이 스타터 킷의 핵심은 **Claude Code + JIRA + GitHub**를 활용한 체계적인 개발 프로세스입니다.

### 워크플로우 개요

```
1. JIRA 티켓 조회 및 시작
   ↓
2. 작업 브랜치 생성
   ↓
3. Definition of Done 확인
   ↓
4. Claude Code로 구현
   ↓
5. 통합 테스트 (필수)
   ↓
6. 커밋 및 푸시
   ↓
7. Pull Request 생성
   ↓
8. JIRA 티켓 업데이트
   ↓
9. 코드 리뷰 및 머지
   ↓
10. JIRA 티켓 완료
```

---

## 🎯 Git 브랜치 전략

### 브랜치 규칙

**메인 브랜치:**
- `main`: 프로덕션 배포 브랜치 (보호됨)
- `develop`: 개발 통합 브랜치

**작업 브랜치 네이밍:**
```
feature/SCRUM-{번호}-{간단한-설명}
bugfix/SCRUM-{번호}-{간단한-설명}
hotfix/SCRUM-{번호}-{간단한-설명}
```

**예시:**
```
feature/SCRUM-42-user-authentication
bugfix/SCRUM-43-login-validation-error
hotfix/SCRUM-44-api-timeout-fix
```

---

## 📋 JIRA 티켓 작업 프로세스

### 필수 워크플로우

모든 JIRA 티켓 작업 시 다음 순서를 **반드시** 따라야 합니다:

#### 1️⃣ 티켓 시작 및 브랜치 생성

```bash
# JIRA MCP를 사용하여 티켓 조회
mcp__atlassian__getJiraIssue(issueIdOrKey: "SCRUM-XX")

# 티켓 상태를 "진행 중"으로 변경
mcp__atlassian__transitionJiraIssue(issueIdOrKey: "SCRUM-XX", transition: "진행 중")

# GitHub CLI를 사용하여 작업 브랜치 생성
gh repo set-default  # 최초 1회만 실행 (리포지토리 선택)
gh pr create --draft --base develop --head feature/SCRUM-XX-brief-description \
  --title "[SCRUM-XX] 작업 제목" --body "Draft PR"

# 또는 로컬에서 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/SCRUM-XX-brief-description

# 예시:
# git checkout -b feature/SCRUM-42-user-authentication
```

#### 2️⃣ Definition of Done 확인

- 티켓 description의 "Definition of Done" 섹션을 **반드시** 확인
- 모든 체크리스트 항목을 작업 목록으로 추적
- 완료 기준이 불명확하면 PM/PO에게 확인

#### 3️⃣ 구현 작업

- Claude Code를 활용하여 코드 작성
- 로컬에서 지속적으로 테스트 수행
- 코드 리뷰 가능한 품질 유지

#### 4️⃣ 통합 테스트 (필수)

**프론트엔드 변경사항:**

```bash
# 1. 개발 서버 실행 확인
cd frontend
npm run dev

# 2. Playwright MCP를 사용한 브라우저 자동화 테스트
mcp__playwright__browser_navigate(url: "http://localhost:3000")
mcp__playwright__browser_snapshot()  # UI 상태 확인
mcp__playwright__browser_click()     # 인터랙션 테스트

# 3. 빌드 성공 확인
npm run build

# 4. Lint & Format 검증
npm run lint
npm run format
```

**백엔드 변경사항:**

```bash
# API 호출 테스트 (실제 HTTP 요청)
cd backend

# 1. 서버 실행 확인
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# 2. curl로 API 테스트
curl -X GET http://localhost:8080/api/v1/health
curl -X POST http://localhost:8080/api/v1/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# 3. Swagger UI에서 테스트
# http://localhost:8080/swagger-ui.html
```

#### 5️⃣ Definition of Done 검증

모든 체크리스트 항목이 완료되었는지 확인:

**프론트엔드 예시:**
- [ ] 기능이 정상적으로 동작하는가?
- [ ] `npm run build`가 에러 없이 성공하는가?
- [ ] `npm run lint`가 통과하는가?
- [ ] 브라우저에서 실제 테스트를 수행했는가?
- [ ] 모바일 반응형이 정상 동작하는가?
- [ ] 접근성(a11y) 요구사항을 충족하는가?
- [ ] README 또는 문서가 업데이트되었는가?

**백엔드 예시:**
- [ ] API가 정상적으로 응답하는가?
- [ ] 단위 테스트가 작성되었는가?
- [ ] 통합 테스트가 통과하는가?
- [ ] API 문서(Swagger)가 업데이트되었는가?
- [ ] 에러 핸들링이 적절한가?
- [ ] 데이터베이스 마이그레이션이 필요한 경우 작성되었는가?

#### 6️⃣ 커밋 및 푸시

```bash
# 변경사항 커밋 (git 명령어 사용)
git add .
git commit -m "feat(component): 작업 내용 요약

- 상세 변경사항 1
- 상세 변경사항 2
- 상세 변경사항 3

JIRA: SCRUM-XX"

# GitHub CLI를 사용하여 푸시 및 PR 업데이트
git push origin feature/SCRUM-XX-brief-description

# Draft PR을 Ready for Review로 변경 (테스트 완료 후)
gh pr ready [PR번호]
```

#### 7️⃣ JIRA 업데이트 (진행 상황)

```bash
# 1. 작업 진행 코멘트 작성
mcp__atlassian__addCommentToJiraIssue(
  issueIdOrKey: "SCRUM-XX",
  commentBody: "## 진행 상황\n\n- 구현 완료 항목\n- 테스트 완료 여부\n- 브랜치: feature/SCRUM-XX-brief-description"
)

# 2. 티켓 상태를 "검토 중"으로 변경 (아직 완료 아님)
mcp__atlassian__transitionJiraIssue(
  issueIdOrKey: "SCRUM-XX",
  transition: "검토 중"
)
```

#### 8️⃣ 최종 검증 및 머지 (완료 확인 후)

```bash
# Definition of Done 모든 항목 재확인
# - [ ] 모든 체크리스트 완료
# - [ ] 빌드/린트 통과
# - [ ] 통합 테스트 완료
# - [ ] 문서 업데이트 완료

# GitHub CLI를 사용하여 PR 머지
gh pr merge [PR번호] --squash --delete-branch

# 또는 머지 옵션 선택
# --merge: 일반 머지 (모든 커밋 유지)
# --squash: 스쿼시 머지 (하나의 커밋으로 합침, 권장)
# --rebase: 리베이스 머지

# 수동으로 머지하는 경우
git checkout develop
git pull origin develop
git merge --no-ff feature/SCRUM-XX-brief-description
git push origin develop
git branch -d feature/SCRUM-XX-brief-description
```

#### 9️⃣ JIRA 티켓 완료 처리

```bash
# 최종 완료 코멘트 작성
mcp__atlassian__addCommentToJiraIssue(
  issueIdOrKey: "SCRUM-XX",
  commentBody: "## ✅ 완료

### 구현 내역
- 항목1
- 항목2

### 테스트 결과
- 통합 테스트: ✅ PASS
- 빌드: ✅ SUCCESS
- 린트: ✅ PASS

### 브랜치 정보
- 작업 브랜치: feature/SCRUM-XX-brief-description
- 머지됨: develop
- 커밋: [커밋 해시]"
)

# 티켓 상태를 "완료"로 변경
mcp__atlassian__transitionJiraIssue(
  issueIdOrKey: "SCRUM-XX",
  transition: "완료"
)
```

---

## 🧪 통합 테스트 체크리스트

### 프론트엔드 (Playwright MCP 사용)

```typescript
// 필수 테스트 시나리오
1. 페이지 로드 테스트
   - URL 접속 성공
   - 기본 UI 요소 표시 확인
   - 로딩 상태 확인

2. 사용자 인터랙션 테스트
   - 버튼 클릭 동작
   - 폼 입력 및 제출
   - 네비게이션 이동

3. 데이터 표시 테스트
   - API 응답 데이터 렌더링
   - 에러 메시지 표시
   - 로딩 인디케이터

4. 반응형 테스트
   - 모바일 뷰포트 (375px)
   - 태블릿 뷰포트 (768px)
   - 데스크톱 뷰포트 (1024px+)

5. 접근성 테스트
   - 키보드 네비게이션
   - 스크린 리더 호환성
   - ARIA 레이블
```

### 백엔드 (실제 API 호출)

```bash
# 필수 테스트 시나리오
1. 성공 케이스
   curl -X GET http://localhost:8080/api/v1/health
   # 예상: 200 OK

2. 인증 테스트
   curl -X GET http://localhost:8080/api/v1/protected \
     -H "Authorization: Bearer <token>"
   # 예상: 200 OK (유효한 토큰) 또는 401 Unauthorized

3. 유효성 검증 테스트
   curl -X POST http://localhost:8080/api/v1/resource \
     -H "Content-Type: application/json" \
     -d '{"invalid": "data"}'
   # 예상: 400 Bad Request + 에러 메시지

4. 에러 핸들링 테스트
   curl -X GET http://localhost:8080/api/v1/nonexistent
   # 예상: 404 Not Found

5. 성능 테스트 (선택)
   - 응답 시간 < 500ms (일반 API)
   - 응답 시간 < 3s (복잡한 처리)
```

---

## ❌ 금지 사항

### 절대 하지 말아야 할 것

1. **통합 테스트 없이 티켓 완료 처리**
   - 프론트엔드: Playwright 테스트 없이 완료 금지
   - 백엔드: 실제 API 호출 테스트 없이 완료 금지

2. **Definition of Done 무시**
   - 체크리스트를 확인하지 않고 완료 금지
   - 일부 항목만 완료하고 티켓 종료 금지

3. **빌드 실패 상태로 커밋**
   - `npm run build` 실패 시 커밋 금지
   - `npm run lint` 실패 시 커밋 금지
   - `./gradlew build` 실패 시 커밋 금지

4. **문서화 누락**
   - README 업데이트 없이 기능 추가 금지
   - API 변경 시 Swagger 문서 미업데이트 금지
   - 복잡한 로직에 주석 없이 커밋 금지

5. **코멘트 없이 상태 변경**
   - JIRA 티켓 상태 변경 시 항상 작업 내역 코멘트 필수

6. **브랜치 규칙 위반**
   - `main` 브랜치에 직접 커밋 금지
   - 작업 브랜치 없이 직접 `develop`에 커밋 금지
   - Definition of Done 미완료 상태로 머지 금지
   - 머지 전 빌드/테스트 검증 누락 금지

---

## 🔧 프로젝트별 가이드

### Frontend (Next.js)

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (상태 관리)
- Sentry (에러 추적)

**개발 서버:**
```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

**배포:** Vercel

### Backend (Spring Boot)

**상세 가이드:** [`backend/README.md`](./backend/README.md) 참조

**Tech Stack:**
- Spring Boot 3.2
- Java 17
- PostgreSQL 15
- Spring Data JPA
- Springdoc OpenAPI (Swagger)
- Sentry (에러 추적)
- Langfuse (LLM 모니터링, 선택)

**배포:** AWS ECS Fargate, Docker, 또는 선택한 플랫폼

---

## 🌍 환경 변수

### Frontend

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# Sentry (에러 추적, 선택)
NEXT_PUBLIC_SENTRY_DSN=your_frontend_sentry_dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=1.0

# 프로젝트별 추가 환경 변수
# NEXT_PUBLIC_YOUR_API_KEY=your_api_key
```

### Backend

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_db_name
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password

# Sentry (에러 추적, 선택)
SENTRY_DSN=your_backend_sentry_dsn
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0

# Langfuse (LLM 모니터링, 선택)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# 프로젝트별 추가 환경 변수
# CLAUDE_API_KEY=your_anthropic_api_key
```

---

## 📝 Git 커밋 메시지 컨벤션

### 컨벤션 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정, 패키지 매니저 설정
```

### 커밋 메시지 예시

```
feat(frontend): 사용자 로그인 UI 구현

- 로그인 폼 컴포넌트 추가
- 유효성 검증 로직 구현
- API 연동 및 에러 핸들링
- 반응형 디자인 적용

JIRA: SCRUM-42
```

```
fix(backend): PostgreSQL 연결 타임아웃 문제 수정

- HikariCP connection pool 설정 최적화
- maximum-pool-size 10 → 20 증가
- connection-timeout 30000ms → 20000ms 감소

JIRA: SCRUM-43
```

---

## 📚 참고 문서

### 프로젝트 문서
- **README.md**: 프로젝트 소개 및 Quick Start 가이드
- **CLAUDE.md**: 이 파일 - AI Native 개발 워크플로우 완전 가이드
- **backend/README.md**: Spring Boot 프로젝트 상세 가이드

### 템플릿 및 예시
- **docs/**: 프로젝트 문서 템플릿
- **examples/**: PRD, 기능 명세 예시

### API 문서
- **Swagger UI**: http://localhost:8080/swagger-ui.html (실행 후 접속)
- **OpenAPI JSON**: http://localhost:8080/api-docs

---

## 🤖 Claude Code 활용 팁

### MCP 서버 활용

**JIRA 통합 (Atlassian MCP):**
```bash
# 티켓 조회
mcp__atlassian__getJiraIssue(issueIdOrKey: "SCRUM-XX")

# 티켓 상태 변경
mcp__atlassian__transitionJiraIssue(issueIdOrKey: "SCRUM-XX", transition: "진행 중")

# 코멘트 추가
mcp__atlassian__addCommentToJiraIssue(issueIdOrKey: "SCRUM-XX", commentBody: "내용")
```

**브라우저 테스트 (Playwright MCP):**
```bash
# 페이지 이동
mcp__playwright__browser_navigate(url: "http://localhost:3000")

# 스냅샷 캡처
mcp__playwright__browser_snapshot()

# 클릭 인터랙션
mcp__playwright__browser_click(element: "버튼 설명", ref: "element_ref")
```

**코드 분석 (Serena MCP):**
```bash
# 심볼 찾기
mcp__serena__find_symbol(name_path: "ClassName/methodName", relative_path: "src/")

# 참조 찾기
mcp__serena__find_referencing_symbols(name_path: "functionName", relative_path: "file.ts")
```

### 효율적인 작업 방법

1. **작은 단위로 커밋하기**
   - 한 번에 하나의 기능만 구현
   - 논리적으로 분리 가능한 단위로 커밋

2. **지속적으로 테스트하기**
   - 코드 작성 후 즉시 로컬 테스트
   - 통합 테스트는 PR 전에 필수

3. **문서와 함께 작업하기**
   - 복잡한 로직에는 주석 필수
   - README와 API 문서 동시 업데이트

4. **Definition of Done 활용하기**
   - 작업 시작 전 반드시 확인
   - 체크리스트를 TodoWrite로 관리

---

## 🔗 문의 및 지원

### 프로젝트 리소스
- **JIRA Board**: 프로젝트별 JIRA 링크
- **GitHub Repository**: 프로젝트별 GitHub 링크
- **Slack/Discord**: 팀 커뮤니케이션 채널

### 이슈 보고
- 버그: GitHub Issues에 등록
- 기능 요청: JIRA 티켓 생성
- 문서 개선: Pull Request 제출

---

**AI Native 개발의 시작, Claude Code와 함께! 🚀**

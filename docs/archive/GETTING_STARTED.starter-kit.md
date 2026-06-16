# 🚀 Getting Started - AI Native Developer Starter Kit

이 문서는 **처음으로 이 프로젝트를 세팅하는 개발자**를 위한 완전한 가이드입니다.

---

## 📋 목차

1. [사전 요구사항](#-사전-요구사항)
2. [레포지토리 클론 및 기본 설정](#-레포지토리-클론-및-기본-설정)
3. [로컬 개발 환경 구축](#-로컬-개발-환경-구축)
4. [Claude Code MCP 서버 설정](#-claude-code-mcp-서버-설정)
5. [첫 실행 및 테스트](#-첫-실행-및-테스트)
6. [AWS 배포 (선택사항)](#-aws-배포-선택사항)
7. [트러블슈팅](#-트러블슈팅)

---

## 📌 사전 요구사항

### 필수 도구 설치

#### 1. 개발 도구
```bash
# Node.js 18+ (프론트엔드)
node --version  # v18.0.0 이상 확인

# Java 17+ (백엔드)
java -version   # 17.0.0 이상 확인

# Docker & Docker Compose (데이터베이스)
docker --version
docker-compose --version
```

#### 2. Git
```bash
git --version  # 2.30.0 이상 권장
```

#### 3. Claude Code (AI 개발 도구)
```bash
# Claude CLI 설치
npm install -g @anthropic/claude-cli

# 또는 Homebrew (macOS)
brew install claude-cli

# 설치 확인
claude --version
```

#### 4. GitHub CLI (선택사항, PR 자동화)
```bash
# macOS
brew install gh

# 인증
gh auth login
```

### 계정 준비 (선택사항)

**로컬 개발만 할 경우 필요 없음**. AWS 배포를 계획 중이라면:

- [ ] AWS 계정 (무료 티어 가능)
- [ ] JIRA Cloud 계정 (MCP 서버 연동용, 선택)
- [ ] Sentry 계정 (에러 추적, 선택)
- [ ] Langfuse 계정 (LLM 모니터링, 선택)

---

## 📂 레포지토리 클론 및 기본 설정

### 1. 레포지토리 클론

```bash
# HTTPS로 클론
git clone https://github.com/dingcodingco/ai-native-developer-starter-kit.git
cd ai-native-developer-starter-kit

# 또는 SSH로 클론
git clone git@github.com:dingcodingco/ai-native-developer-starter-kit.git
cd ai-native-developer-starter-kit
```

### 2. 브랜치 전략 확인

```bash
# 현재 브랜치 확인
git branch -a

# develop 브랜치가 있다면 체크아웃
git checkout develop
```

**브랜치 규칙**:
- `main`: 프로덕션 배포 브랜치 (보호됨)
- `develop`: 개발 통합 브랜치
- `feature/SCRUM-XX-description`: 작업 브랜치

### 3. 환경 변수 파일 생성

```bash
# 루트 디렉토리 환경 변수 (선택)
cp .env.example .env

# 프론트엔드 환경 변수 (Sentry 사용 시만 필요)
cd frontend
cp .env.example .env.local

# .env.local 파일 수정 (Sentry 설정, 선택)
# NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

**중요**: `.env` 파일은 절대 git에 커밋하지 마세요!

---

## 🛠️ 로컬 개발 환경 구축

### Step 1: 데이터베이스 시작 (Docker Compose)

```bash
# 프로젝트 루트로 이동
cd /path/to/ai-native-developer-starter-kit

# PostgreSQL 컨테이너 시작
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인 (문제 발생 시)
docker-compose logs postgres
```

**예상 출력**:
```
NAME                IMAGE                COMMAND                  SERVICE    STATUS
starter-postgres    postgres:15-alpine   "docker-entrypoint.s…"   postgres   Up 5 seconds
```

**데이터베이스 접속 정보**:
- Host: `localhost`
- Port: `5432`
- Database: `starter`
- Username: `postgres`
- Password: `postgres`

### Step 2: 백엔드 실행 (Spring Boot)

```bash
cd backend

# 의존성 다운로드 및 빌드
./gradlew clean build

# 실행 (local 프로파일)
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

**성공 확인**:
- 브라우저에서 http://localhost:8080/swagger-ui.html 접속
- Swagger UI에서 API 문서 확인
- Health Check: http://localhost:8080/api/v1/health

**예상 응답**:
```json
{
  "status": "UP",
  "message": "Backend API 서버가 정상적으로 실행 중입니다.",
  "timestamp": "2025-10-22T00:10:00.000000",
  "version": "0.0.1-SNAPSHOT"
}
```

### Step 3: 프론트엔드 실행 (Next.js)

**새 터미널 창을 열고:**

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

**성공 확인**:
- 브라우저에서 http://localhost:3000 접속
- 페이지가 정상적으로 로드되는지 확인

**빌드 테스트 (선택)**:
```bash
# 프로덕션 빌드 테스트
npm run build

# Lint 검사
npm run lint
```

---

## 🤖 Claude Code MCP 서버 설정

MCP 서버는 Claude Code가 외부 도구와 통합하여 브라우저 자동화, JIRA 연동 등을 수행할 수 있게 해줍니다.

### 1. MCP 서버 설치

```bash
# Playwright MCP (브라우저 자동화)
claude mcp add playwright npx -- @playwright/mcp@latest

# Atlassian MCP (JIRA/Confluence 연동)
claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse
```

### 2. 설치 확인

```bash
# 설치된 MCP 서버 목록 확인
claude mcp list
```

**예상 출력**:
```
playwright    npx @playwright/mcp@latest
atlassian     https://mcp.atlassian.com/v1/sse (sse)
```

### 3. 프로젝트 MCP 설정 확인

프로젝트 루트의 `.mcp.json` 파일이 자동으로 인식됩니다:

```json
{
  "mcpServers": {
    "atlassian": {
      "transport": "sse",
      "url": "https://mcp.atlassian.com/v1/sse"
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 4. Atlassian 인증 (선택)

JIRA를 사용하는 경우:

```bash
# Claude Code에서 JIRA 연동
# 브라우저가 열리면 Atlassian 계정으로 로그인
```

---

## ✅ 첫 실행 및 테스트

### 전체 스택 실행 확인

모든 서비스가 실행 중인지 확인:

```bash
# 1. PostgreSQL (포트 5432)
docker-compose ps | grep postgres

# 2. Backend (포트 8080)
curl http://localhost:8080/api/v1/health

# 3. Frontend (포트 3000)
curl http://localhost:3000
```

### 통합 테스트

#### 백엔드 API 테스트

```bash
# Health Check
curl http://localhost:8080/api/v1/health

# Sample API (Item CRUD)
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item", "description": "First test"}'

# 목록 조회
curl http://localhost:8080/api/v1/items
```

#### 프론트엔드 연동 테스트

1. http://localhost:3000 접속
2. 백엔드 API 호출이 정상적으로 작동하는지 확인
3. 브라우저 개발자 도구에서 네트워크 탭 확인

---

## ☁️ AWS 배포 (선택사항)

로컬 개발이 아닌 **AWS에 배포**하려면 추가 설정이 필요합니다.

### 1. AWS 자격 증명 설정

```bash
# AWS CLI 설치 (macOS)
brew install awscli

# 자격 증명 구성
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: ap-northeast-1
# Default output format: json
```

### 2. Terraform 인프라 배포

```bash
cd terraform

# Terraform 초기화
terraform init

# 변수 파일 생성
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvars 수정 (필수!)
# db_password = "your_secure_password_here"

# 실행 계획 확인
terraform plan

# 인프라 생성 (주의: 비용 발생)
terraform apply
```

**예상 월간 비용**: ~$150 (NAT Gateway, ALB, ECS, RDS 포함)

자세한 내용은 다음 문서를 참조하세요:
- [AWS 배포 가이드](./DEPLOYMENT.md)
- [AWS OIDC 설정](./AWS_OIDC_SETUP.md)
- [GitHub Secrets 설정](./GITHUB_SECRETS_SETUP.md)

---

## 🔧 트러블슈팅

### 문제 1: PostgreSQL 연결 실패

**증상**:
```
Connection to localhost:5432 refused
```

**해결 방법**:
```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
docker-compose down
docker-compose up -d

# 로그 확인
docker-compose logs postgres
```

### 문제 2: 백엔드 빌드 실패

**증상**:
```
Could not resolve dependencies
```

**해결 방법**:
```bash
# Gradle 캐시 정리
cd backend
./gradlew clean --refresh-dependencies

# 재빌드
./gradlew build
```

### 문제 3: 프론트엔드 빌드 실패

**증상**:
```
Module not found: Can't resolve '@/components/...'
```

**해결 방법**:
```bash
# node_modules 삭제 및 재설치
cd frontend
rm -rf node_modules package-lock.json
npm install

# 빌드 재시도
npm run build
```

### 문제 4: 포트 충돌

**증상**:
```
Port 8080 is already in use
```

**해결 방법**:
```bash
# 포트 사용 중인 프로세스 확인
lsof -ti :8080

# 프로세스 종료 (macOS/Linux)
lsof -ti :8080 | xargs kill -9

# 또는 다른 포트 사용 (backend)
SERVER_PORT=8081 ./gradlew bootRun
```

### 문제 5: Claude Code MCP 서버 연결 실패

**증상**:
```
MCP server 'playwright' failed to start
```

**해결 방법**:
```bash
# MCP 서버 재설치
claude mcp remove playwright
claude mcp add playwright npx -- @playwright/mcp@latest

# Claude Code 재시작
```

---

## 📚 다음 단계

이제 로컬 개발 환경이 준비되었습니다! 다음 문서들을 참고하세요:

### 개발 워크플로우
- **[CLAUDE.md](../CLAUDE.md)**: AI Native 개발 워크플로우 완전 가이드
  - JIRA 티켓 작업 프로세스
  - Git 브랜치 전략
  - Definition of Done 체크리스트
  - 통합 테스트 가이드

### 프로젝트 문서
- **[README.md](../README.md)**: 프로젝트 소개 및 Quick Start
- **[backend/README.md](../backend/README.md)**: Spring Boot 백엔드 가이드
- **[terraform/README.md](../terraform/README.md)**: Terraform 인프라 가이드

### 배포 관련
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: AWS 배포 상세 가이드
- **[AWS_OIDC_SETUP.md](./AWS_OIDC_SETUP.md)**: GitHub Actions OIDC 설정
- **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)**: CI/CD Secrets 설정

---

## 🆘 도움이 필요하신가요?

### 커뮤니티
- **GitHub Issues**: [이슈 등록](https://github.com/dingcodingco/ai-native-developer-starter-kit/issues)
- **GitHub Discussions**: 질문 및 토론

### 문서
- **Claude Code 공식 문서**: https://docs.claude.com/code
- **Spring Boot 문서**: https://spring.io/projects/spring-boot
- **Next.js 문서**: https://nextjs.org/docs

---

**Happy Coding! 🚀**

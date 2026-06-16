# 배포 프로세스 가이드

AI Native Developer Starter Kit의 CI/CD 자동 배포 프로세스 가이드입니다.

## 📋 목차

1. [배포 아키텍처 개요](#배포-아키텍처-개요)
2. [자동 배포 트리거](#자동-배포-트리거)
3. [배포 파이프라인 상세](#배포-파이프라인-상세)
4. [수동 배포 방법](#수동-배포-방법)
5. [배포 검증 및 롤백](#배포-검증-및-롤백)
6. [문제 해결](#문제-해결)

---

## 배포 아키텍처 개요

### 전체 흐름

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌──────────┐
│   GitHub    │ ───> │ GitHub       │ ───> │   ECR   │ ───> │   ECS    │
│   (main)    │      │   Actions    │      │ (Image) │      │ (Deploy) │
└─────────────┘      └──────────────┘      └─────────┘      └──────────┘
    코드 푸시            CI/CD 실행           이미지 저장        컨테이너 배포
```

### 기술 스택

| 구성 요소 | 기술 | 설명 |
|---------|------|------|
| **CI/CD** | GitHub Actions | 자동화된 빌드 및 배포 |
| **Container Registry** | AWS ECR | Docker 이미지 저장소 |
| **Orchestration** | AWS ECS Fargate | 컨테이너 오케스트레이션 |
| **Authentication** | AWS OIDC | 안전한 AWS 인증 |
| **Frontend** | Next.js 20 | Node.js 애플리케이션 |
| **Backend** | Spring Boot + JDK 17 | Java 애플리케이션 |

---

## 자동 배포 트리거

### Frontend 자동 배포

**트리거 조건**:
```yaml
main 브랜치에 푸시 + frontend/** 경로 변경
```

**예시**:
```bash
git push origin main   # frontend/src/app/page.tsx 변경 시
```

**배포 시간**: 약 5-7분

### Backend 자동 배포

**트리거 조건**:
```yaml
main 브랜치에 푸시 + backend/** 경로 변경
```

**예시**:
```bash
git push origin main   # backend/src/main/java/** 변경 시
```

**배포 시간**: 약 8-12분

### 배포 제외 조건

다음 변경사항은 배포를 트리거하지 않습니다:
- README.md, 문서 파일 변경
- `.github/workflows/` 외 다른 경로 변경
- `develop`, `feature/*` 브랜치 푸시

---

## 배포 파이프라인 상세

### Frontend 배포 파이프라인

#### Phase 1: 빌드 및 테스트 (2-3분)

```yaml
1. 코드 체크아웃
2. Node.js 20 환경 설정
3. 의존성 설치 (npm ci)
4. ESLint 검증 (npm run lint)
5. Next.js 프로덕션 빌드 (npm run build)
```

**주요 파일**:
- `frontend/Dockerfile` - Multi-stage 빌드 설정
- `frontend/.dockerignore` - 빌드 제외 파일
- `frontend/package.json` - 의존성 정의

#### Phase 2: Docker 이미지 빌드 (1-2분)

```yaml
1. AWS 인증 (OIDC)
2. ECR 로그인
3. Docker 이미지 빌드
   - Stage 1: npm ci + npm run build
   - Stage 2: 프로덕션 런타임 환경
4. 이미지 태그
   - git-{SHA}: 커밋 해시 기반 태그
   - latest: 최신 버전 태그
5. ECR에 이미지 푸시
```

**생성되는 이미지**:
```
123456789.dkr.ecr.ap-northeast-1.amazonaws.com/starter-frontend:git-abc1234
123456789.dkr.ecr.ap-northeast-1.amazonaws.com/starter-frontend:latest
```

#### Phase 3: ECS 배포 (2-3분)

```yaml
1. ECS Task Definition 다운로드
2. 새 이미지로 Task Definition 업데이트
3. ECS 서비스 업데이트 (Rolling Update)
4. 서비스 안정화 대기 (최대 10분)
```

**ECS 배포 전략**: Rolling Update
- 새 Task 실행 → Health Check 통과 → 기존 Task 종료

---

---

## Backend 환경 변수 설정

### 환경 변수를 통한 설정 (간소화)

Backend 애플리케이션의 모든 환경 변수는 Terraform의 `terraform.tfvars`에서 직접 관리합니다.

#### 환경 변수 분류

**데이터베이스 설정:**
- `SPRING_DATASOURCE_URL` - RDS 엔드포인트 (Terraform이 자동 주입)
- `SPRING_DATASOURCE_USERNAME` - DB 사용자명
- `SPRING_DATASOURCE_PASSWORD` - DB 비밀번호

**프로젝트별 환경 변수 (필요 시 추가):**
- `CLAUDE_API_KEY` - Anthropic Claude AI API 키 (선택)
- `LANGFUSE_PUBLIC_KEY` - Langfuse 공개 키 (선택)
- `LANGFUSE_SECRET_KEY` - Langfuse 비밀 키 (선택)
- `LANGFUSE_BASE_URL` - Langfuse API 엔드포인트 (선택)
- `SENTRY_DSN` - Sentry 에러 추적 DSN (선택)
- `SENTRY_ENVIRONMENT` - Sentry 환경 구분 (선택)
- `SENTRY_TRACES_SAMPLE_RATE` - Sentry 샘플링 비율 (선택)

#### Terraform tfvars 설정 방법

`terraform/terraform.tfvars` 파일에 다음과 같이 설정:

```hcl
backend_environment = [
  {
    name  = "SPRING_DATASOURCE_USERNAME"
    value = "postgres"
  },
  {
    name  = "SPRING_DATASOURCE_PASSWORD"
    value = "your_secure_password_here"  # Match with db_password below
  },
  {
    name  = "SPRING_PROFILES_ACTIVE"
    value = "prod"
  },
  {
    name  = "CLAUDE_API_KEY"
    value = "your_anthropic_api_key_here"  # Optional: For Claude AI integration
  },
  {
    name  = "LANGFUSE_PUBLIC_KEY"
    value = "your_langfuse_public_key_here"  # Optional: For LLM monitoring
  },
  {
    name  = "LANGFUSE_SECRET_KEY"
    value = "your_langfuse_secret_key_here"  # Optional: For LLM monitoring
  },
  {
    name  = "LANGFUSE_BASE_URL"
    value = "https://cloud.langfuse.com"  # Optional: For LLM monitoring
  },
  {
    name  = "SENTRY_DSN"
    value = "your_backend_sentry_dsn_here"  # Optional: For error tracking
  },
  {
    name  = "SENTRY_ENVIRONMENT"
    value = "production"  # Optional: For error tracking
  },
  {
    name  = "SENTRY_TRACES_SAMPLE_RATE"
    value = "0.1"  # Optional: For error tracking
  }
]
```

**Terraform 적용:**

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**주의사항:**
- `terraform.tfvars` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다
- 민감한 정보(API 키, 비밀번호)는 반드시 안전하게 보관하세요
- 프로덕션 환경에서는 더 강력한 비밀번호를 사용하세요
- 선택 항목(Claude AI, Langfuse, Sentry)은 필요에 따라 추가하세요
- `SPRING_DATASOURCE_URL`은 Terraform에서 RDS 엔드포인트를 자동으로 주입합니다

#### 환경 변수 값 업데이트

```bash
# 1. terraform.tfvars 파일 수정
# 2. Terraform 재적용
cd terraform
terraform plan
terraform apply

# 3. ECS 서비스 강제 재배포 (환경 변수 반영)
aws ecs update-service \
  --cluster starter-cluster \
  --service starter-backend-service \
  --force-new-deployment \
  --region ap-northeast-1
```

---

### Backend 배포 파이프라인

#### Phase 1: 빌드 및 테스트 (3-5분)

```yaml
1. 코드 체크아웃
2. Java 17 환경 설정
3. Gradle 테스트 실행 (./gradlew test)
4. Gradle 빌드 (./gradlew clean build -x test)
```

**주요 파일**:
- `backend/Dockerfile` - Multi-stage 빌드 설정
- `backend/.dockerignore` - 빌드 제외 파일
- `backend/build.gradle` - 프로젝트 설정

#### Phase 2: Docker 이미지 빌드 (2-3분)

```yaml
1. AWS 인증 (OIDC)
2. ECR 로그인
3. Docker 이미지 빌드
   - Stage 1: Gradle build (JAR 생성)
   - Stage 2: JRE 런타임 환경
4. 이미지 태그 및 ECR 푸시
```

**생성되는 이미지**:
```
123456789.dkr.ecr.ap-northeast-1.amazonaws.com/starter-backend:git-abc1234
123456789.dkr.ecr.ap-northeast-1.amazonaws.com/starter-backend:latest
```

#### Phase 3: ECS 배포 (3-5분)

```yaml
1. ECS Task Definition 업데이트
2. ECS 서비스 업데이트
3. 서비스 안정화 대기 (최대 15분)
4. 데이터베이스 마이그레이션 (필요 시)
```

---

## 수동 배포 방법

### GitHub Actions UI에서 수동 배포

#### Frontend 수동 배포

1. GitHub Repository → **Actions** 탭
2. **Frontend Deploy to ECS** 선택
3. **Run workflow** 버튼 클릭
4. 환경 선택:
   - `prod`: 프로덕션 환경
   - `staging`: 스테이징 환경 (선택 사항)
5. **Run workflow** 실행

#### Backend 수동 배포

1. GitHub Repository → **Actions** 탭
2. **Backend Deploy to ECS** 선택
3. **Run workflow** 버튼 클릭
4. 환경 선택 후 실행

### 로컬에서 Docker 이미지 빌드 및 테스트

#### Frontend 로컬 테스트

```bash
# 프로젝트 루트에서
cd frontend

# Docker 이미지 빌드
docker build -t starter-frontend:local .

# 로컬에서 컨테이너 실행
docker run -p 3000:3000 starter-frontend:local

# 브라우저에서 확인
open http://localhost:3000
```

#### Backend 로컬 테스트

```bash
# 프로젝트 루트에서
cd backend

# Docker 이미지 빌드
docker build -t starter-backend:local .

# 로컬에서 컨테이너 실행
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=local \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/starter \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=password \
  starter-backend:local

# API Health Check
curl http://localhost:8080/actuator/health
```

---

## 배포 검증 및 롤백

### 배포 검증 체크리스트

#### Frontend 배포 검증

```bash
# 1. 애플리케이션 접속 확인
curl -I https://date-click.com

# 2. Health Check API (Next.js)
curl https://date-click.com/api/health

# 3. 빌드 버전 확인 (브라우저 Console)
# 배포된 commit SHA 확인

# 4. 주요 기능 테스트
# - 홈페이지 로딩
# - 지역 선택 맵 동작
# - 코스 생성 기능
```

#### Backend 배포 검증

```bash
# 1. Health Check
curl https://api.date-click.com/actuator/health

# 2. API 응답 테스트
curl https://api.date-click.com/api/v1/regions/metadata

# 3. ECS Task 상태 확인 (AWS CLI)
aws ecs describe-services \
  --cluster starter-cluster \
  --services starter-backend-service \
  --region ap-northeast-1

# 4. CloudWatch 로그 확인
aws logs tail /ecs/starter-backend --follow
```

### 배포 롤백 방법

#### 방법 1: 이전 이미지로 롤백 (빠름, 권장)

```bash
# 1. ECR에서 이전 이미지 태그 확인
aws ecr describe-images \
  --repository-name starter-frontend \
  --region ap-northeast-1

# 2. ECS Task Definition을 이전 이미지로 업데이트
# AWS Console에서 수행 또는 AWS CLI 사용

# 3. ECS 서비스 강제 재배포
aws ecs update-service \
  --cluster starter-cluster \
  --service starter-frontend-service \
  --force-new-deployment \
  --region ap-northeast-1
```

#### 방법 2: Git Revert 후 재배포 (느림)

```bash
# 1. 문제가 있는 커밋 되돌리기
git revert HEAD
git push origin main

# 2. GitHub Actions가 자동으로 재배포
# (약 5-12분 소요)
```

---

## 문제 해결

### 문제 1: 빌드 실패 (ESLint/TypeScript 에러)

**증상**:
```
Error: Command failed with exit code 1: npm run lint
```

**해결 방법**:
```bash
# 로컬에서 빌드 테스트
cd frontend
npm run lint
npm run build

# 에러 수정 후 푸시
git add .
git commit -m "fix: lint errors"
git push origin main
```

### 문제 2: Docker 이미지 빌드 실패

**증상**:
```
Error: failed to push to ECR
```

**해결 방법**:
1. AWS 인증 확인 (GitHub Secrets의 AWS_ROLE_ARN)
2. IAM Role 권한 확인 (ECR Push 권한)
3. ECR Repository 존재 여부 확인

```bash
# ECR Repository 생성 (없는 경우)
aws ecr create-repository \
  --repository-name starter-frontend \
  --region ap-northeast-1
```

### 문제 3: ECS 배포 타임아웃

**증상**:
```
Error: Service did not stabilize within 10 minutes
```

**해결 방법**:
1. ECS Task Definition의 Health Check 설정 확인
2. CloudWatch Logs에서 컨테이너 에러 확인
3. Task가 실행되지 않는 경우 → 리소스 부족 (CPU/메모리)

```bash
# ECS Task 로그 확인
aws logs tail /ecs/starter-frontend --follow

# ECS Task 이벤트 확인
aws ecs describe-services \
  --cluster starter-cluster \
  --services starter-frontend-service
```

### 문제 4: OIDC 인증 실패

**증상**:
```
Error: Could not assume role with OIDC
```

**해결 방법**:
[AWS OIDC 설정 가이드](./AWS_OIDC_SETUP.md)를 참조하여 Trust Policy 확인

---

## 📚 추가 문서

- [GitHub Secrets 설정 가이드](./GITHUB_SECRETS_SETUP.md)
- [AWS OIDC 연동 설정](./AWS_OIDC_SETUP.md)
- [Terraform IaC 가이드](../terraform/README.md) (예정)

---

## ✅ 배포 전 체크리스트

### 첫 배포 준비

- [ ] AWS OIDC Identity Provider 생성 완료
- [ ] IAM Role 및 Policy 설정 완료
- [ ] GitHub Secrets 설정 완료 (AWS_ROLE_ARN, 환경 변수)
- [ ] ECR Repository 생성 완료 (frontend, backend)
- [ ] ECS Cluster 및 Service 생성 완료 (Terraform)
- [ ] RDS, Redis, ALB 설정 완료 (Terraform)

### 매 배포 전 확인

- [ ] 로컬에서 빌드 성공 확인 (`npm run build` 또는 `./gradlew build`)
- [ ] 로컬에서 Docker 이미지 빌드 성공 확인
- [ ] 테스트 통과 확인
- [ ] `main` 브랜치에 푸시 준비 완료

### 배포 후 검증

- [ ] GitHub Actions 워크플로우 성공 확인
- [ ] ECS Task가 `RUNNING` 상태인지 확인
- [ ] Health Check API 응답 확인
- [ ] 주요 기능 동작 확인
- [ ] CloudWatch 로그에서 에러 확인
- [ ] 모니터링 대시보드 확인 (Sentry, CloudWatch)

---

## 🔄 배포 히스토리 추적

### GitHub Actions 배포 이력 확인

```
GitHub → Actions 탭 → Workflow 선택 → 실행 이력 확인
```

각 배포에는 다음 정보가 포함됩니다:
- Commit SHA
- 배포 시간
- 배포 소요 시간
- 배포 성공/실패 상태
- Docker 이미지 태그

### AWS CloudWatch 로그

```bash
# 실시간 로그 모니터링
aws logs tail /ecs/starter-frontend --follow

# 특정 시간대 로그 조회
aws logs filter-log-events \
  --log-group-name /ecs/starter-frontend \
  --start-time $(date -u -d '1 hour ago' +%s)000
```

---

## 📊 배포 성공률 및 성능 지표

**목표 지표**:
- 배포 성공률: 95% 이상
- 배포 소요 시간: 10분 이내
- 배포 빈도: 주 5회 이상
- MTTR (평균 복구 시간): 15분 이내

**모니터링**:
- GitHub Actions Insights
- AWS CloudWatch Metrics
- Sentry Release Tracking

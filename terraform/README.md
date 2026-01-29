# AI Native Developer Starter Kit - Terraform Infrastructure

AWS 인프라를 코드로 관리하기 위한 Terraform 구성입니다.

## 📁 프로젝트 구조

```
terraform/
├── main.tf                 # 메인 구성 파일
├── variables.tf            # 변수 정의
├── outputs.tf              # 출력 값 정의
├── terraform.tfvars.example # 변수 값 예시 (실제 사용 시 terraform.tfvars로 복사)
├── .gitignore             # Git 제외 파일
├── modules/
│   ├── vpc/               # VPC, 서브넷, 보안 그룹, NAT
│   ├── ecr/               # ECR 리포지토리
│   ├── ecs/               # ECS 클러스터, 서비스, 태스크
│   ├── rds/               # PostgreSQL RDS
│   └── alb/               # Application Load Balancer
└── README.md              # 이 파일
```

## 🏗️ 인프라 구성

### VPC 네트워크
- **VPC**: 10.0.0.0/16
- **Public Subnets**: 2개 (가용 영역 2개)
- **Private Subnets**: 2개 (가용 영역 2개)
- **Internet Gateway**: Public 서브넷용
- **NAT Gateway**: Private 서브넷 아웃바운드용
- **보안 그룹**: ALB, ECS Tasks, RDS

### ECR (Container Registry)
- Frontend 이미지 리포지토리
- Backend 이미지 리포지토리
- 이미지 스캔 활성화
- Lifecycle 정책: 최근 10개 이미지 유지

### ECS (Container Orchestration)
- **Cluster**: Fargate 기반
- **Frontend Task**: 256 CPU / 512 MB
- **Backend Task**: 512 CPU / 1024 MB
- **CloudWatch Logs**: 7일 보관
- **Auto Scaling**: 준비됨 (추후 설정)

### RDS (Database)
- **Engine**: PostgreSQL 15.14
- **Instance**: db.t3.small
- **Multi-AZ**: 활성화
- **Storage**: 20GB (gp3, 암호화)
- **Backup**: 7일 보관

### ALB (Load Balancer)
- Public Application Load Balancer
- **Frontend**: 포트 3000 (/ 경로)
- **Backend**: 포트 8080 (/api/* 경로)
- Health Check 설정

## 🚀 사용 방법

### 1. 사전 준비

**필수 도구 설치:**
```bash
# Terraform 설치 (Homebrew)
brew install terraform

# AWS CLI 설치 및 구성
brew install awscli
aws configure
```

**AWS 자격 증명 설정:**
```bash
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: ap-northeast-1
# Default output format: json
```

### 2. 설정 파일 준비

```bash
cd terraform

# terraform.tfvars 파일 생성 (example 파일 복사)
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvars 파일 수정
nano terraform.tfvars
```

**필수 변경 사항:**
- `db_password`: 안전한 데이터베이스 비밀번호로 변경
- ~~`frontend_environment`: ALB DNS 자동 주입됨 (수동 설정 불필요)~~
- ~~`backend_environment`: RDS 엔드포인트 자동 주입됨 (수동 설정 불필요)~~

**자동 설정되는 환경 변수:**
- `NEXT_PUBLIC_API_BASE_URL`: ALB DNS로 자동 설정
- `SPRING_DATASOURCE_URL`: RDS 엔드포인트로 자동 설정

### 3. Terraform 초기화

```bash
terraform init
```

출력 예시:
```
Initializing modules...
Initializing the backend...
Initializing provider plugins...
- Reusing previous version of hashicorp/aws from the dependency lock file
- Using previously-installed hashicorp/aws v5.x.x

Terraform has been successfully initialized!
```

### 4. 인프라 계획 확인

```bash
terraform plan
```

이 명령어는 실제로 생성/변경/삭제될 리소스를 보여줍니다.

### 5. 인프라 생성

```bash
terraform apply
```

확인 메시지가 나오면 `yes`를 입력합니다.

**예상 소요 시간**: 약 10-15분

### 6. 출력 값 확인

```bash
terraform output
```

주요 출력 값:
- `alb_url`: 애플리케이션 접속 URL
- `frontend_ecr_repository_url`: Frontend 이미지 푸시 URL
- `backend_ecr_repository_url`: Backend 이미지 푸시 URL
- `db_endpoint`: RDS 엔드포인트

## 📝 상태 관리 (Local State)

이 프로젝트는 **로컬 state 파일**을 사용합니다.

### State 파일 위치
```
terraform/terraform.tfstate
```

### ⚠️ 중요 주의사항

1. **State 파일 백업 필수**
   ```bash
   # State 파일 백업 (실행 전후)
   cp terraform.tfstate terraform.tfstate.backup
   ```

2. **Git에 커밋 금지**
   - `.gitignore`에 자동으로 제외됨
   - State 파일에는 민감한 정보(DB 비밀번호 등)가 포함됨

3. **팀 협업 시 주의**
   - 여러 사람이 동시에 `terraform apply` 실행 금지
   - State 파일 충돌 방지를 위해 작업 전 공유 필요

4. **State 파일 손실 시**
   - 수동으로 인프라를 관리해야 함
   - 또는 `terraform import`로 기존 리소스 가져오기 (복잡)

### State 파일 복구 방법

만약 state 파일을 잃어버렸다면:

```bash
# 1. 새 state 파일 생성
terraform init

# 2. 기존 리소스를 state로 가져오기 (예시)
terraform import module.vpc.aws_vpc.main vpc-xxxxx
terraform import module.rds.aws_db_instance.postgres starter-postgres
# ... (모든 리소스에 대해 반복)
```

**권장**: 정기적으로 state 파일을 안전한 곳에 백업하세요.

## 🧹 인프라 삭제

**⚠️ 주의**: 이 명령어는 모든 리소스를 삭제합니다!

```bash
terraform destroy
```

확인 메시지가 나오면 `yes`를 입력합니다.

**중요**: RDS는 `skip_final_snapshot=false`로 설정되어 있어 삭제 시 최종 스냅샷이 생성됩니다.

## 🔧 일반적인 작업

### ECR에 이미지 푸시

```bash
# 1. ECR 로그인
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com

# 2. Frontend 이미지 빌드 및 푸시
cd ../frontend
docker build -t starter-frontend .
docker tag starter-frontend:latest <frontend-ecr-url>:latest
docker push <frontend-ecr-url>:latest

# 3. Backend 이미지 빌드 및 푸시
cd ../backend
docker build -t starter-backend .
docker tag starter-backend:latest <backend-ecr-url>:latest
docker push <backend-ecr-url>:latest
```

### ECS 서비스 재시작

```bash
# Frontend 서비스 재시작
aws ecs update-service --cluster starter-cluster --service starter-frontend-service --force-new-deployment --region ap-northeast-1

# Backend 서비스 재시작
aws ecs update-service --cluster starter-cluster --service starter-backend-service --force-new-deployment --region ap-northeast-1
```

### RDS 접속

```bash
# PostgreSQL 클라이언트로 접속
psql -h <db-endpoint> -U postgres -d starter
```

## 📊 비용 예상 (월간)

### 주요 리소스 비용 (ap-northeast-1 기준)
- **NAT Gateway**: ~$32/월
- **ALB**: ~$16/월
- **ECS Fargate** (Frontend + Backend, 24/7 운영):
  - Frontend (256/512): ~$14/월
  - Backend (512/1024): ~$28/월
- **RDS db.t3.small** (Multi-AZ): ~$58/월
- **데이터 전송 및 기타**: ~$10/월

**총 예상 비용**: 약 **$158/월**

**비용 절감 팁**:
- 개발 환경에서는 `db_multi_az = false` 설정 (~$29 절감)
- ECS 서비스 `desired_count`를 0으로 설정하여 미사용 시 중지
- NAT Gateway 대신 NAT Instance 사용 (복잡도 증가)

## 🐛 트러블슈팅

### Terraform init 실패
```bash
# 캐시 삭제 후 재시도
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### Provider 버전 충돌
```bash
# Lock 파일 업데이트
terraform init -upgrade
```

### State 잠금 오류
```
Error: Error acquiring the state lock
```

로컬 state 사용 시 이 오류는 발생하지 않지만, 프로세스가 중단된 경우:
```bash
# 강제로 잠금 해제 (주의!)
terraform force-unlock <lock-id>
```

### 리소스 이미 존재 오류
```bash
# 기존 리소스를 state로 가져오기
terraform import <resource-type>.<resource-name> <resource-id>
```

## 📚 참고 자료

- [Terraform AWS Provider 문서](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Fargate 가이드](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
- [Terraform 베스트 프랙티스](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

## 📞 지원

문제가 발생하면:
1. GitHub Issues 등록
2. 이 README의 트러블슈팅 섹션 참고
3. Terraform 공식 문서 확인

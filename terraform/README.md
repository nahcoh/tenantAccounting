# Ziplog Infrastructure

이 디렉터리는 AWS ECS/RDS 기반 인프라를 Terraform으로 구성하기 위한 코드입니다.

현재 운영 배포는 루트의 `docker-compose.prod.yml`과 GitHub Actions SSH 배포를 사용합니다. 이 Terraform 구성은 AWS ECS/Fargate 기반 배포 경로를 만들거나 재검토할 때 사용하는 별도 인프라 코드입니다.

## 구성 리소스

```text
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
├── modules/
│   ├── alb/      # Application Load Balancer, target group, listener
│   ├── ecr/      # frontend/backend ECR repository
│   ├── ecs/      # ECS cluster, task definition, service, CloudWatch logs
│   ├── rds/      # RDS instance and subnet group
│   └── vpc/      # VPC, public/private subnet, route table, NAT, security groups
└── README.md
```

## 아키텍처

- VPC: `10.0.0.0/16`
- Public subnets: ALB, NAT Gateway
- Private subnets: ECS tasks, RDS
- ECR: frontend/backend 이미지 저장소
- ECS Fargate: frontend task, backend task
- ALB: `/api/*`는 backend target group, 그 외 경로는 frontend target group
- RDS: PostgreSQL 15.14
- CloudWatch Logs: ECS 로그 그룹

주의: 현재 애플리케이션 백엔드는 MySQL을 기준으로 개발/운영되고 있습니다. 이 Terraform의 RDS 모듈은 PostgreSQL로 작성되어 있어 그대로 적용하면 현재 `application.yml`과 맞지 않습니다. AWS ECS 구성을 실제 운영 후보로 사용할 경우 RDS 엔진, JDBC URL, driver, DB 환경변수를 먼저 MySQL 기준으로 수정해야 합니다.

## 사전 요구사항

- Terraform `>= 1.5`
- AWS CLI
- AWS 계정과 배포 권한
- Docker/ECR 이미지 빌드 및 push 권한

```bash
terraform version
aws sts get-caller-identity
```

## 설정

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`에서 최소한 아래 값을 확인합니다.

- `aws_region`
- `project_name`
- `db_name`
- `db_username`
- `db_password`
- `db_engine_version`
- `db_instance_class`
- `db_multi_az`
- `frontend_environment`
- `backend_environment`

현재 example 기본값은 Ziplog 운영값이 아닙니다.

- `project_name = "starter"`
- `db_name = "starter"`
- RDS: PostgreSQL
- backend DB user: `postgres`

Ziplog 운영형 AWS 인프라로 사용하려면 project name과 DB 설정을 Ziplog/MySQL 기준으로 바꾼 뒤 plan을 검토합니다.

## 실행

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

생성 결과 확인:

```bash
terraform output
```

주요 output:

- `alb_url`
- `frontend_ecr_repository_url`
- `backend_ecr_repository_url`
- `ecs_cluster_name`
- `frontend_service_name`
- `backend_service_name`
- `db_endpoint`

## 이미지 배포 흐름

Terraform은 ECR repository와 ECS service를 만들지만 애플리케이션 이미지를 자동으로 빌드해서 push하지 않습니다.

일반 흐름:

```bash
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com
```

```bash
cd backend
docker build -t ziplog-backend .
docker tag ziplog-backend:latest <backend-ecr-url>:latest
docker push <backend-ecr-url>:latest
```

프론트 이미지를 ECS로 운영하려면 현재 정적 S3/CloudFront 배포 방식과 별도로 frontend Dockerfile이 필요합니다. 현재 저장소에는 프론트 Dockerfile이 없고 Vite 정적 빌드 중심으로 운영됩니다.

ECS 재배포:

```bash
aws ecs update-service \
  --cluster <cluster-name> \
  --service <service-name> \
  --force-new-deployment \
  --region ap-northeast-1
```

## State 관리

현재 Terraform backend 설정이 없으므로 local state를 사용합니다.

- state 파일: `terraform/terraform.tfstate`
- 민감정보가 포함될 수 있으므로 Git에 커밋하지 않습니다.
- 여러 사람이 동시에 `terraform apply`를 실행하지 않습니다.
- 팀 운영이 필요하면 S3 backend + DynamoDB lock 구성을 먼저 추가합니다.

백업 예:

```bash
cp terraform.tfstate terraform.tfstate.backup
```

## 삭제

```bash
terraform destroy
```

RDS 삭제 정책은 `skip_final_snapshot` 변수에 영향을 받습니다. 운영 데이터가 있는 환경에서는 destroy 전에 snapshot 정책과 state 대상을 반드시 확인합니다.

## 현재 운영 인프라와의 관계

현재 production workflow 기준:

- Frontend: `frontend/dist` -> S3 -> CloudFront
- Backend: GitHub Actions -> SSH/SCP -> 운영 서버 -> `docker-compose.prod.yml`
- Database: 운영 서버의 MySQL 컨테이너 volume
- Files: S3 optional

따라서 운영 장애 대응이나 현재 배포 수정은 우선 루트 [README.md](../README.md), [backend/README.md](../backend/README.md), [docs/README.md](../docs/README.md), GitHub Actions workflow를 확인합니다.

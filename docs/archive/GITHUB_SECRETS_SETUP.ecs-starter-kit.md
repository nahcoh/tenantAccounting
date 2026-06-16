# GitHub Secrets 설정 가이드

GitHub Actions CI/CD 파이프라인을 위한 Repository Secrets 설정 방법입니다.

## 📋 필수 Secrets 목록

### AWS 인증 (OIDC - 권장)

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ROLE_ARN` | GitHub Actions용 IAM Role ARN | `arn:aws:iam::123456789012:role/GitHubActionsRole` |

**참고**: AWS OIDC 연동 설정은 [AWS_OIDC_SETUP.md](./AWS_OIDC_SETUP.md)를 참조하세요.

---

### AWS 인증 (IAM 사용자 - 대안)

OIDC 설정이 어려운 경우에만 사용하세요.

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM 사용자 Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM 사용자 Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |

**보안 경고**: IAM 사용자 방식은 키 유출 위험이 있으므로 OIDC 방식을 권장합니다.

---

### Sentry 환경 변수 (선택)

Frontend와 Backend 배포 시 Sentry 에러 추적을 위한 설정입니다.

| Secret Name | Description | Required | Example Value |
|------------|-------------|----------|---------------|
| `SENTRY_AUTH_TOKEN` | Sentry 릴리즈 생성용 인증 토큰 | ⚠️ | `sntrys_...` |

**참고**:
- Frontend: Sentry DSN과 조직/프로젝트명은 `.github/workflows/frontend-deploy.yml`에 하드코딩되어 있습니다
- Backend: Sentry 설정은 Terraform의 `backend_environment` 변수로 관리됩니다
- Sentry를 사용하지 않는 경우 이 설정을 건너뛰어도 됩니다

---

## 🔧 GitHub Secrets 설정 방법

### 1. GitHub Repository로 이동

```
https://github.com/dingcodingco/ddalkkak-date
```

### 2. Settings → Secrets and variables → Actions

1. Repository 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 선택
3. **New repository secret** 버튼 클릭

### 3. Secret 추가

각 Secret을 다음 형식으로 추가:

```
Name: AWS_ROLE_ARN
Secret: arn:aws:iam::123456789012:role/GitHubActionsRole
```

**Add secret** 버튼을 클릭하여 저장합니다.

### 4. 추가된 Secrets 확인

모든 Secrets가 다음과 같이 표시되어야 합니다:

```
✅ AWS_ROLE_ARN (또는 AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY)
✅ SENTRY_AUTH_TOKEN (선택)
```

---

## 🔍 Secrets 사용 예시

### GitHub Actions Workflow에서 참조

```yaml
# AWS 인증 (OIDC)
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: ap-northeast-1

# Sentry 릴리즈 생성 (선택)
- name: Create Sentry release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org-name
    SENTRY_PROJECT: your-project-name
  with:
    environment: production
    version: ${{ github.sha }}
```

---

## 🛡️ 보안 Best Practices

### ✅ DO (권장사항)

1. **OIDC 인증 사용**: IAM 사용자 대신 OIDC 방식 사용
2. **최소 권한 원칙**: IAM Role에 필요한 최소 권한만 부여
3. **정기적인 키 로테이션**: API 키를 주기적으로 갱신
4. **환경별 분리**: 프로덕션/스테이징 환경에 다른 Secrets 사용
5. **Secrets 암호화**: GitHub Secrets는 자동으로 암호화되지만, AWS Secrets Manager 사용 고려

### ❌ DON'T (금지사항)

1. **코드에 직접 하드코딩**: API 키를 소스 코드에 직접 작성 금지
2. **Public 저장소에 노출**: `.env` 파일을 Git에 커밋하지 않기
3. **과도한 권한 부여**: Admin 권한이 있는 IAM 사용자 사용 금지
4. **공유 계정 사용**: 개인 AWS 계정 자격 증명 사용 금지

---

## 🧪 Secrets 테스트 방법

### 로컬에서 테스트

```bash
# Frontend 빌드 테스트
cd frontend
npm run build

# Backend 환경 변수는 terraform.tfvars에서 관리
cd ../terraform
terraform plan  # 설정 확인
```

### GitHub Actions에서 테스트

1. 워크플로우를 수동으로 실행 (workflow_dispatch)
2. Actions 탭에서 실행 결과 확인
3. Secrets가 올바르게 주입되었는지 로그 확인 (값은 `***`로 마스킹됨)

---

## 🆘 문제 해결

### Secret이 인식되지 않는 경우

```yaml
# ❌ 잘못된 사용
env:
  API_KEY: secrets.API_KEY

# ✅ 올바른 사용
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### OIDC 인증 실패

```
Error: Could not assume role with OIDC
```

**해결 방법**:
1. IAM Role의 Trust Policy 확인
2. GitHub Actions의 `id-token: write` 권한 확인
3. AWS_ROLE_ARN이 올바른지 확인

자세한 내용은 [AWS_OIDC_SETUP.md](./AWS_OIDC_SETUP.md)를 참조하세요.

### 배포 후 환경 변수 변경이 반영되지 않는 경우

Terraform으로 환경 변수를 변경한 경우, ECS 서비스를 재배포해야 합니다.

```bash
# ECS 서비스 강제 재배포
aws ecs update-service \
  --cluster starter-cluster \
  --service starter-backend-service \
  --force-new-deployment \
  --region ap-northeast-1
```

---

## 📚 추가 문서

- [AWS OIDC 연동 설정](./AWS_OIDC_SETUP.md)
- [배포 프로세스 가이드](./DEPLOYMENT.md)
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

## ✅ Checklist

배포 전에 다음 항목을 확인하세요:

- [ ] AWS_ROLE_ARN 또는 AWS 자격 증명 설정 완료
- [ ] SENTRY_AUTH_TOKEN 설정 완료 (Sentry 사용 시)
- [ ] Terraform의 `terraform.tfvars` 파일에 Backend 환경 변수 설정 완료
- [ ] GitHub Actions workflow 파일에서 Secrets 참조 확인
- [ ] 로컬 빌드 테스트 성공
- [ ] Terraform plan 실행 성공
- [ ] GitHub Actions 워크플로우 수동 실행 테스트 성공

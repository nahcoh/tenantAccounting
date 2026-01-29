# AWS OIDC 연동 설정 가이드

GitHub Actions에서 AWS 리소스에 안전하게 접근하기 위한 OIDC (OpenID Connect) 인증 설정 가이드입니다.

## 📋 목차

1. [OIDC vs IAM 사용자 비교](#oidc-vs-iam-사용자-비교)
2. [OIDC Identity Provider 생성](#step-1-oidc-identity-provider-생성)
3. [IAM Role 생성](#step-2-iam-role-생성)
4. [Trust Policy 설정](#step-3-trust-policy-설정)
5. [IAM Policy 연결](#step-4-iam-policy-연결)
6. [GitHub Secrets 설정](#step-5-github-secrets-설정)
7. [테스트 및 검증](#step-6-테스트-및-검증)

---

## OIDC vs IAM 사용자 비교

| 방식 | 보안성 | 관리 복잡도 | 권장 여부 |
|------|--------|------------|----------|
| **OIDC (OpenID Connect)** | ✅ 높음 (임시 자격 증명) | 중간 | ⭐ **권장** |
| IAM 사용자 (Access Key) | ⚠️ 낮음 (영구 자격 증명) | 낮음 | ❌ 비권장 |

**OIDC 장점**:
- ✅ AWS 자격 증명을 GitHub Secrets에 저장하지 않아도 됨
- ✅ 임시 자격 증명으로 보안 강화
- ✅ 자동으로 만료되어 키 로테이션 불필요
- ✅ GitHub 조직/저장소/브랜치 단위로 세밀한 권한 제어

---

## Step 1: OIDC Identity Provider 생성

### 1-1. AWS IAM 콘솔 접속

1. [AWS IAM Console](https://console.aws.amazon.com/iam/)로 이동
2. 왼쪽 메뉴에서 **Identity providers** 선택
3. **Add provider** 버튼 클릭

### 1-2. Provider 정보 입력

```yaml
Provider type: OpenID Connect
Provider URL: https://token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

**입력 화면**:
```
Provider URL: https://token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

### 1-3. Provider 검증

**Get thumbprint** 버튼을 클릭하여 자동으로 thumbprint를 가져옵니다.

### 1-4. Provider 생성 완료

**Add provider** 버튼을 클릭하여 Identity Provider를 생성합니다.

---

## Step 2: IAM Role 생성

### 2-1. IAM Role 생성 시작

1. AWS IAM Console에서 **Roles** 선택
2. **Create role** 버튼 클릭
3. **Trusted entity type**: **Web identity** 선택

### 2-2. Identity Provider 선택

```yaml
Identity provider: token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

**다음 단계**로 이동합니다.

---

## Step 3: Trust Policy 설정

### 3-1. Trust Relationship 편집

Role 생성 후 **Trust relationships** 탭에서 **Edit trust policy**를 클릭합니다.

### 3-2. Trust Policy JSON 작성

다음 Trust Policy를 사용하여 **특정 GitHub 저장소**만 이 Role을 사용할 수 있도록 제한합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:dingcodingco/ddalkkak-date:*"
        }
      }
    }
  ]
}
```

**중요**: `YOUR_ACCOUNT_ID`를 실제 AWS 계정 ID로 변경하세요.

**Trust Policy 설명**:
- `Federated`: OIDC Provider ARN
- `token.actions.githubusercontent.com:aud`: GitHub Actions의 Audience
- `token.actions.githubusercontent.com:sub`: GitHub 저장소 및 브랜치 제한
  - `repo:ORG/REPO:*`: 모든 브랜치/태그 허용
  - `repo:ORG/REPO:ref:refs/heads/main`: `main` 브랜치만 허용

### 3-3. 브랜치별 제한 (선택 사항)

`main` 브랜치에서만 배포를 허용하려면:

```json
"StringLike": {
  "token.actions.githubusercontent.com:sub": "repo:dingcodingco/ddalkkak-date:ref:refs/heads/main"
}
```

---

## Step 4: IAM Policy 연결

### 4-1. 필요한 권한 정의

GitHub Actions에서 ECR 및 ECS 배포를 위해 필요한 권한:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECRPermissions",
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ECSPermissions",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMPassRole",
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole"
    }
  ]
}
```

**중요**: `YOUR_ACCOUNT_ID`를 실제 AWS 계정 ID로 변경하세요.

### 4-2. Policy 생성

1. IAM Console에서 **Policies** 선택
2. **Create policy** 버튼 클릭
3. **JSON** 탭에서 위 Policy 붙여넣기
4. Policy 이름: `GitHubActionsECRandECSPolicy`
5. **Create policy** 버튼 클릭

### 4-3. Role에 Policy 연결

1. 생성한 IAM Role로 이동
2. **Permissions** 탭에서 **Add permissions** → **Attach policies** 클릭
3. `GitHubActionsECRandECSPolicy` 선택
4. **Add permissions** 버튼 클릭

---

## Step 5: GitHub Secrets 설정

### 5-1. IAM Role ARN 복사

생성한 IAM Role의 ARN을 복사합니다:

```
arn:aws:iam::123456789012:role/GitHubActionsRole
```

### 5-2. GitHub Secrets 추가

1. GitHub Repository로 이동: `https://github.com/dingcodingco/ddalkkak-date`
2. **Settings** → **Secrets and variables** → **Actions** 선택
3. **New repository secret** 클릭
4. 다음 Secret 추가:

```
Name: AWS_ROLE_ARN
Secret: arn:aws:iam::123456789012:role/GitHubActionsRole
```

---

## Step 6: 테스트 및 검증

### 6-1. GitHub Actions 워크플로우 확인

워크플로우 파일에서 OIDC 인증 설정을 확인합니다:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # ⭐ OIDC 인증을 위해 필수
      contents: read    # 코드 체크아웃을 위해 필수

    steps:
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-1
          role-session-name: GitHubActions-Deploy
```

### 6-2. 수동 워크플로우 실행

1. GitHub Actions 탭으로 이동
2. **Frontend Deploy to ECS** 또는 **Backend Deploy to ECS** 선택
3. **Run workflow** 버튼 클릭
4. 워크플로우 실행 로그 확인

### 6-3. 성공 확인

**성공 시 로그**:
```
✅ Assuming role with OIDC
✅ Successfully assumed role: arn:aws:iam::123456789012:role/GitHubActionsRole
```

**실패 시 로그**:
```
❌ Error: Could not assume role with OIDC
```

---

## 🆘 문제 해결

### 문제 1: "Could not assume role with OIDC"

**원인**: Trust Policy가 잘못 설정되었거나 저장소 이름이 일치하지 않습니다.

**해결 방법**:
1. IAM Role의 Trust Policy 확인
2. `token.actions.githubusercontent.com:sub` 값이 `repo:ORG/REPO:*` 형식인지 확인
3. GitHub 저장소 이름이 정확한지 확인 (대소문자 구분)

### 문제 2: "Access Denied" (ECR/ECS 작업 실패)

**원인**: IAM Policy에 필요한 권한이 누락되었습니다.

**해결 방법**:
1. IAM Role에 연결된 Policy 확인
2. `ecr:*` 및 `ecs:*` 권한이 있는지 확인
3. `iam:PassRole` 권한이 있는지 확인

### 문제 3: "id-token: write" 권한 누락

**원인**: GitHub Actions 워크플로우에 OIDC 인증 권한이 없습니다.

**해결 방법**:
```yaml
jobs:
  deploy:
    permissions:
      id-token: write   # ⭐ 이 권한이 필수
      contents: read
```

---

## 🔒 보안 Best Practices

### ✅ DO (권장사항)

1. **브랜치 제한**: `main` 브랜치에서만 배포 허용
2. **최소 권한 원칙**: 필요한 최소한의 권한만 부여
3. **Role Session Name**: 각 워크플로우마다 고유한 session name 사용
4. **CloudTrail 활성화**: IAM Role 사용 로그 모니터링

### ❌ DON'T (금지사항)

1. **와일드카드 남용**: `Resource: "*"` 대신 구체적인 ARN 사용
2. **Admin 권한 부여**: AdministratorAccess Policy 연결 금지
3. **Trust Policy 검증 생략**: 저장소 제한 없이 모든 GitHub 저장소 허용 금지
4. **로그 확인 생략**: CloudTrail 로그를 주기적으로 검토

---

## 📚 추가 문서

- [GitHub Secrets 설정 가이드](./GITHUB_SECRETS_SETUP.md)
- [배포 프로세스 문서](./DEPLOYMENT.md)
- [AWS OIDC 공식 문서](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [GitHub Actions OIDC 가이드](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

---

## ✅ Checklist

OIDC 연동 완료 후 다음 항목을 확인하세요:

- [ ] OIDC Identity Provider 생성 완료
- [ ] IAM Role 생성 완료
- [ ] Trust Policy에 GitHub 저장소 제한 설정 완료
- [ ] IAM Policy 연결 완료 (ECR, ECS, PassRole 권한)
- [ ] GitHub Secrets에 AWS_ROLE_ARN 추가 완료
- [ ] GitHub Actions 워크플로우에 `id-token: write` 권한 추가 완료
- [ ] 수동 워크플로우 실행 테스트 성공
- [ ] CloudTrail 로그에서 Role Assumption 확인 완료

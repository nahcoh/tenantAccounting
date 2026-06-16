# Ziplog Docs

운영, 배포, 외부 서비스 설정처럼 README에 모두 담기 어려운 절차 문서를 모아두는 디렉터리입니다.

## 문서 목록

| 문서 | 역할 |
| --- | --- |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | 로컬 개발 환경 실행 가이드 |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 배포 절차와 운영 배포 관련 가이드 |
| [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) | GitHub Actions secrets 설정 |
| [archive/](./archive/) | 현재 실행 경로와 맞지 않는 레거시 참고 문서 |

## 역할별 README

현재 프로젝트의 기본 문서는 역할별 README로 분리합니다.

- 전체 개요: [../README.md](../README.md)
- 프론트엔드: [../frontend/README.md](../frontend/README.md)
- 백엔드: [../backend/README.md](../backend/README.md)
- 인프라/Terraform: [../terraform/README.md](../terraform/README.md)

## 문서 작성 기준

- README는 각 영역의 최신 진입점으로 유지합니다.
- 세부 절차, 체크리스트, 외부 콘솔 설정처럼 길어지는 내용만 `docs/`에 둡니다.
- 배포 방식, 환경 변수, 도메인, workflow가 바뀌면 관련 README와 docs 문서를 함께 갱신합니다.
- 오래된 레거시 예시나 현재 코드에 없는 API는 새 문서에 추가하지 않습니다.

## 문서 추가 규칙

새 문서는 목적이 드러나는 파일명으로 추가합니다.

```text
docs/
├── DEPLOYMENT.md
├── GITHUB_SECRETS_SETUP.md
├── GETTING_STARTED.md
├── archive/
└── README.md
```

권장 주제:

- 배포/롤백 절차
- 장애 대응 절차
- 외부 서비스 설정
- CI/CD secrets 변경
- 데이터 백업/복구 절차

## 검색

```bash
rg "검색어" docs
```

## Archive

`docs/archive/`에는 레거시 템플릿, ECS/OIDC 초안, 과거 핸드오프, 와이어프레임처럼 현재 실행 경로와 직접 맞지 않는 참고 자료를 보관합니다. 새 작업에서 재사용하기 전에는 현재 코드와 workflow 기준으로 다시 검증해야 합니다.

# 🏠 Tenant Housing Record App (세입자 주거 기록 앱)

세입자가 임대차 계약부터 입주 중 수리 기록, 퇴거 시 보증금 정산까지 주거의 모든 과정을 체계적으로 관리할 수 있는 서비스입니다.

## 🌟 주요 기능

* **비용 관리 (Cost Management):** 월세, 관리비, 공과금, 대출 이자 납부 일정 관리 및 캘린더 뷰 제공
* **입주 전 (Before Move-in):** 임대차 계약 등록/수정/삭제, 서류 관리(파일 첨부/다운로드/미리보기), 특약사항 기록 및 확인
* **입주 중 (During Residence):** 집 수리/하자 발생 시 사진 및 영수증과 함께 기록 (집주인/세입자 부담 구분)
* **입주 후 (After Move-out):** 퇴거 체크리스트 (보증금 반환, 시설물 복구, 공과금 정산 등)

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
* **React 18** (Vite)
* **Tailwind CSS** (UI Styling)
* **React Router v7** (URL 기반 중첩 라우팅)
* **Axios** (API 통신, JWT 자동 갱신)

### Backend
* **Java 17**
* **Spring Boot 3.2**
* **Spring Data JPA**
* **Spring Security + JWT** (인증/인가)
* **OAuth2** (Google, Kakao 소셜 로그인)
* **MySQL**

## 📂 프로젝트 구조

```
tenant_record/
├── frontend/                          # React 프론트엔드
│   └── src/
│       ├── components/                # 공통 컴포넌트
│       │   ├── AppLayout.jsx          #   헤더 + 페이즈 네비게이션
│       │   ├── PrivateRoute.jsx       #   인증 보호 라우트
│       │   └── AddModal.jsx           #   계약/서류/특약 등록 모달
│       ├── hooks/
│       │   └── useContract.js         # 계약 상태 + CRUD 로직
│       ├── lib/
│       │   ├── constants.js           # 상수 (라벨 맵, 페이즈 정의)
│       │   └── utils.js              # 유틸 함수
│       ├── pages/
│       │   ├── cost/                  # 비용 관리 (달력, 요약, 계약정보, 공과금, 대출)
│       │   ├── before/                # 입주 전 (서류 관리, 특약사항)
│       │   ├── during/                # 입주 중 (유지보수 기록)
│       │   └── after/                 # 입주 후 (퇴거 체크리스트)
│       ├── App.jsx                    # 라우트 정의
│       ├── TenantAuth.jsx             # 로그인/회원가입
│       ├── OAuth2RedirectHandler.jsx  # OAuth 콜백
│       └── api.js                     # Axios 클라이언트 (JWT 갱신)
├── backend/                           # Spring Boot 백엔드
│   └── src/main/java/com/starter/
│       ├── controller/                # REST API 컨트롤러
│       │   ├── AuthController         #   인증 (로그인/회원가입/토큰갱신)
│       │   ├── ContractController     #   계약 CRUD
│       │   ├── DocumentController     #   서류 CRUD + 파일 업로드/다운로드
│       │   ├── SpecialTermController  #   특약사항 CRUD + 파일 첨부
│       │   ├── PaymentController      #   납부 일정 (캘린더)
│       │   ├── MaintenanceController  #   유지보수 기록
│       │   └── UtilityController      #   공과금
│       ├── security/                  # JWT + OAuth2 인증
│       └── ...
├── docs/                              # 기획 및 설계 문서
└── terraform/                         # 인프라 설정
```

## 🔗 URL 라우팅 구조 (Frontend)

```
/auth                    → 로그인/회원가입
/oauth/redirect          → OAuth2 콜백
/before/documents        → 입주 전 > 서류 관리
/before/terms            → 입주 전 > 특약사항
/during/maintenance      → 입주 중 > 유지보수
/after/checklist         → 입주 후 > 퇴거 체크리스트
/cost/calendar           → 비용 관리 > 납부 일정
/cost/overview           → 비용 관리 > 요약
/cost/contract           → 비용 관리 > 계약 정보
/cost/utilities          → 비용 관리 > 공과금
/cost/loan               → 비용 관리 > 대출/이자
```

## 🚀 시작하기 (Getting Started)

### Frontend 실행
```bash
cd frontend
npm install
npm run dev
```
> 브라우저에서 `http://localhost:5173` 접속

### Backend 실행
```bash
cd backend
./gradlew bootRun
```
> 서버가 `http://localhost:8080`에서 실행됩니다.

## 📝 개발 진행 상황

### ✅ 완료된 작업

- **인증 시스템:**
  - JWT 기반 로그인/회원가입/토큰 갱신
  - Google, Kakao OAuth2 소셜 로그인
  - 프론트엔드 PrivateRoute 인증 보호

- **백엔드 API:**
  - 계약 CRUD (`/api/contracts`)
  - 서류 CRUD + 파일 업로드/다운로드/미리보기 (`/api/documents`)
  - 특약사항 CRUD + 파일 첨부/확인 토글 (`/api/special-terms`)
  - 납부 일정 캘린더 조회 (`/api/payments/calendar`)
  - 유지보수, 공과금 API

- **프론트엔드 연동:**
  - 계약 등록/수정/삭제 (카카오 주소 검색 연동)
  - 서류 관리 (파일 첨부, 다운로드, 이미지/PDF 미리보기)
  - 특약사항 관리 (파일 첨부, 확인 체크)
  - 납부 달력 (월별 납부 현황, 다가오는 일정)

- **라우팅 리팩토링:**
  - 1,728줄 단일 파일을 20개 파일로 분리
  - React Router v7 중첩 라우트 기반 URL 라우팅 구현
  - 브라우저 뒤로가기/앞으로가기, URL 북마크, 직접 접속 지원

### 🚀 다음 작업

1. **입주 중/입주 후 기능 백엔드 연동:** 유지보수 기록, 퇴거 체크리스트 CRUD API 연동
2. **비용 관리 세부 기능:** 요약, 계약 정보, 공과금, 대출/이자 페이지 구현
3. **알림 기능:** 납부일 알림, 계약 만료 알림

---
**Note:** 이 프로젝트는 `com.starter` 템플릿을 기반으로 확장 개발 중입니다.

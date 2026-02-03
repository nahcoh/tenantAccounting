# 🏠 Tenant Housing Record App (세입자 주거 기록 앱)

세입자가 임대차 계약부터 입주 중 수리 기록, 퇴거 시 보증금 정산까지 주거의 모든 과정을 체계적으로 관리할 수 있는 서비스입니다.

## 🌟 주요 기능

*   **비용 관리 (Cost Management):** 월세, 관리비, 공과금, 대출 이자 납부 일정 관리 및 캘린더 뷰 제공
*   **입주 전 (Before Move-in):** 임대차 계약서, 등기부등본 등 필수 서류 체크리스트 및 특약사항 기록
*   **입주 중 (During Residence):** 집 수리/하자 발생 시 사진 및 영수증과 함께 기록 (집주인/세입자 부담 구분)
*   **입주 후 (After Move-out):** 보증금 정산 내역 관리 및 퇴거 체크리스트

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
*   **React** (Vite)
*   **Tailwind CSS** (UI Styling)
*   **React Router** (Navigation)

### Backend
*   **Java 17**
*   **Spring Boot 3.2**
*   **Spring Data JPA**
*   **Spring Security + JWT** (구현 예정)
*   **MySQL**

## 📂 프로젝트 구조

```
tenant_record/
├── frontend/             # React 프론트엔드 프로젝트
│   └── src/
├── backend/              # Spring Boot 백엔드 프로젝트
│   └── src/main/java/com/starter/
├── docs/                 # 기획 및 설계 문서
└── ...
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

## 📝 개발 진행 상황 및 다음 단계

**현재 브랜치:** `feat/connect-frontend`

### ✅ 완료된 작업
- **백엔드 API - 프론트엔드 연동:**
  - `axios`를 프론트엔드에 설치하고, `TenantHousingAppV3` 컴포넌트에서 백엔드 API (`/api/payments/calendar/{year}/{month}`)를 호출하도록 리팩토링 완료.
  - 이제 달력 데이터는 하드코딩된 데이터가 아닌, 백엔드로부터 직접 받아옵니다.
- **백엔드 서비스 로직 구현:**
  - `PaymentService`에 월별 납부 내역을 조회하는 `getMonthlyPayments` 로직을 구현했습니다.
  - `PaymentRepository`에 관련 커스텀 조회 메소드를 추가했습니다.
- **개발 환경 설정:**
  - CORS 설정을 완료하여 프론트엔드(`localhost:5173`)와 백엔드(`localhost:8080`) 간의 통신을 허용했습니다.
  - 개발용 임시 보안 설정을 적용하여 모든 API 요청을 허용했습니다.

### 🚀 다음 작업 (어디서부터 시작할까?)

**1. (가장 중요) `data.sql` 오류 해결:**
   - **문제:** 현재 `backend/src/main/resources/data.sql` 파일에 SQL 문법 오류가 있어, 서버 시작 시 더미 데이터가 정상적으로 입력되지 않고 있습니다.
   - **마지막 에러:** `[42000][1064] You have an error in your SQL syntax; ...`
   - **해결 방안:** `data.sql`의 `INSERT` 구문을 다시 한번 점검하고 수정해야 합니다. (e.g., 예약어, 따옴표, 데이터 타입, `AUTO_INCREMENT` 컬럼에 id를 직접 지정하는 문제 등) 이 문제가 해결되어야 백엔드 테스트 및 기능 확인이 원활해집니다.

**2. 기능 확인:**
   - `data.sql` 수정 후, 백엔드 서버가 에러 없이 시작되는지 확인합니다.
   - 프론트엔드(`localhost:5173`)에 접속하여, `data.sql`에 넣은 더미 데이터가 달력에 정상적으로 표시되는지 확인합니다.

**3. 전체 기능 구현:**
   - **백엔드:** 아직 구현되지 않은 다른 API들 (`POST /contracts` 등)의 서비스 로직을 마저 구현합니다.
   - **프론트엔드:** 달력 외 다른 기능(계약 정보, 서류 관리 등)들도 백엔드 API와 연동합니다.
   - **인증:** JWT를 사용한 최종 로그인/인증 기능을 구현합니다.


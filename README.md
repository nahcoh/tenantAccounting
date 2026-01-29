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

## 📝 개발 진행 상황
- [x] 프론트엔드 환경 구축 (Vite + React + Tailwind)
- [x] UI 프로토타입 통합 (V1, V2 기능을 V3로 통합)
- [x] 로그인/회원가입 UI 구현
- [x] **백엔드: 기본 환경 설정 (Spring Boot, MySQL)**
- [x] **백엔드: DB 엔티티, 리포지토리, DTO 구현 완료**
- [x] **백엔드: 핵심 서비스 및 컨트롤러 API 구현 완료**
- [ ] API 연동 (프론트-백엔드)
- [ ] 인증/인가 기능 최종 구현 (Spring Security + JWT)

> **💡 개발 참고사항**
> 현재 백엔드 API는 개발 편의를 위해 **모든 요청을 인증 없이 허용**하도록 설정되어 있습니다. (`backend/src/main/java/com/starter/config/SecurityConfig.java` 참고) 따라서 별도의 로그인 없이 모든 기능을 테스트할 수 있습니다.

---
**Note:** 이 프로젝트는 기존 `com.starter` 템플릿을 기반으로 확장 개발 중입니다.
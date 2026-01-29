# 🏠 세입자 주거 기록 앱 - 프로젝트 핸드오프 문서

> 이 문서는 IntelliJ의 Claude에게 프로젝트 컨텍스트를 전달하기 위한 문서입니다.

---

## 📋 프로젝트 개요

**프로젝트명:** 세입자 주거 기록 앱 (Tenant Housing Record App)

**목적:** 세입자가 임대차 계약, 비용 관리, 수리 기록, 서류 관리를 한 곳에서 관리할 수 있는 서비스

**기술 스택:**
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Java 17 + Spring Boot 3.x
- **Database:** MySQL 또는 PostgreSQL
- **인증:** JWT (Spring Security)

---

## 🎯 주요 기능 (4개 탭)

### 1. 입주 전 (Before Move-in)
- 필수 서류 관리 (임대차 계약서, 등기부등본, 전입신고 등)
- 특약사항 기록
- 입주 전 체크리스트

### 2. 입주 중 (During Residence)
- 수리/문제 기록 (사진, 영수증 첨부)
- 입주 당시 상태 기록 (영역별 체크리스트)
- 비용 부담자 구분 (세입자/집주인)

### 3. 입주 후 (After Move-out)
- 퇴거 체크리스트
- 보증금 정산 내역
- 입주/퇴거 상태 비교 (Before/After)

### 4. 비용 관리 (Cost Management) ⭐ 핵심 기능
- **계약 정보**: 전세/월세/반전세 구분
- **보증금 원천**: 자가자금 / 은행대출 / 정부지원 구분
- **공과금 관리**: 전기/가스/난방/수도 (한전, 도시가스 연동 예정)
- **대출/이자**: 월별 이자 납부 내역
- **📅 납부 일정 캘린더**: 정기 납부, 다가오는 납부 알림

---

## 📊 데이터 모델

### Contract (계약 정보)
```
Contract {
  id: Long
  userId: Long
  type: Enum (JEONSE | MONTHLY | SEMI_JEONSE)
  address: String
  jeonseDeposit: BigDecimal      // 전세금/보증금
  monthlyRent: BigDecimal        // 월세 (반전세/월세)
  maintenanceFee: BigDecimal     // 관리비
  startDate: LocalDate
  endDate: LocalDate
  depositSources: List<DepositSource>
}
```

### DepositSource (보증금 원천)
```
DepositSource {
  id: Long
  contractId: Long
  type: Enum (SELF | BANK | GOVERNMENT)
  amount: BigDecimal
  bankName: String               // 은행명 (대출인 경우)
  interestRate: BigDecimal       // 금리 (%)
}
```

### Payment (납부 일정)
```
Payment {
  id: Long
  userId: Long
  name: String                   // 항목명 (월세, 관리비 등)
  category: Enum (RENT | MAINTENANCE | LOAN | UTILITY)
  amount: BigDecimal
  paymentDay: Integer            // 정기 납부일 (1~28)
  isRecurring: Boolean           // 정기 납부 여부
  autoPay: Boolean               // 자동이체 여부
  dueDate: LocalDate             // 납부 예정일
  paidDate: LocalDate            // 실제 납부일
  status: Enum (UPCOMING | PAID | OVERDUE)
}
```

### Utility (공과금)
```
Utility {
  id: Long
  userId: Long
  type: Enum (ELECTRICITY | GAS | WATER | HEATING | INTERNET)
  yearMonth: String              // "2024-03"
  amount: BigDecimal
  usage: BigDecimal              // 사용량
  unit: String                   // kWh, m³
  provider: String               // 한국전력, 서울도시가스
  isSynced: Boolean              // 자동 연동 여부
  paidDate: LocalDate
}
```

### Document (서류)
```
Document {
  id: Long
  userId: Long
  name: String                   // 서류명
  category: Enum (CONTRACT | REGISTRATION | CHECKIN | OTHER)
  filePath: String
  uploadedAt: LocalDateTime
  isRequired: Boolean
}
```

### MaintenanceRecord (수리/문제 기록)
```
MaintenanceRecord {
  id: Long
  userId: Long
  title: String
  category: Enum (REPAIR | DAMAGE)
  description: String
  cost: BigDecimal
  paidBy: Enum (TENANT | LANDLORD)
  status: Enum (RECORDED | IN_PROGRESS | COMPLETED)
  recordedAt: LocalDate
  photos: List<String>           // 사진 URL
  receipts: List<String>         // 영수증 URL
}
```

---

## 🔌 API 엔드포인트 명세

### 인증 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) |
| POST | `/api/auth/refresh` | 토큰 갱신 |

### 계약 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/contracts` | 내 계약 정보 조회 |
| POST | `/api/contracts` | 계약 정보 등록 |
| PUT | `/api/contracts/{id}` | 계약 정보 수정 |
| DELETE | `/api/contracts/{id}` | 계약 정보 삭제 |

### 납부 일정 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/payments/recurring` | 정기 납부 목록 |
| POST | `/api/payments/recurring` | 정기 납부 추가 |
| PUT | `/api/payments/recurring/{id}` | 정기 납부 수정 |
| DELETE | `/api/payments/recurring/{id}` | 정기 납부 삭제 |
| GET | `/api/payments/calendar/{year}/{month}` | 월별 납부 캘린더 |
| GET | `/api/payments/upcoming?days=14` | 다가오는 납부 |
| POST | `/api/payments/{id}/complete` | 납부 완료 처리 |

### 공과금 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/utilities/{year}/{month}` | 월별 공과금 조회 |
| POST | `/api/utilities` | 공과금 등록 |
| PUT | `/api/utilities/{id}` | 공과금 수정 |
| POST | `/api/utilities/sync/kepco` | 한전 연동 |
| POST | `/api/utilities/sync/gas` | 도시가스 연동 |

### 서류 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/documents` | 서류 목록 |
| POST | `/api/documents/upload` | 서류 업로드 (multipart) |
| GET | `/api/documents/{id}/download` | 서류 다운로드 |
| DELETE | `/api/documents/{id}` | 서류 삭제 |

### 수리/문제 기록 API
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/maintenance` | 수리 기록 목록 |
| POST | `/api/maintenance` | 수리 기록 등록 |
| PUT | `/api/maintenance/{id}` | 수리 기록 수정 |
| POST | `/api/maintenance/{id}/photos` | 사진 추가 |
| DELETE | `/api/maintenance/{id}` | 수리 기록 삭제 |

---

## 📁 백엔드 패키지 구조

```
src/main/java/com/tenant/
├── TenantApplication.java
│
├── config/
│   ├── WebConfig.java              // CORS
│   ├── SecurityConfig.java         // Spring Security + JWT
│   └── SwaggerConfig.java          // API 문서
│
├── controller/
│   ├── AuthController.java
│   ├── ContractController.java
│   ├── PaymentController.java
│   ├── UtilityController.java
│   ├── DocumentController.java
│   └── MaintenanceController.java
│
├── service/
│   ├── AuthService.java
│   ├── ContractService.java
│   ├── PaymentService.java
│   ├── UtilityService.java
│   ├── DocumentService.java
│   └── MaintenanceService.java
│
├── repository/
│   ├── UserRepository.java
│   ├── ContractRepository.java
│   ├── DepositSourceRepository.java
│   ├── PaymentRepository.java
│   ├── UtilityRepository.java
│   ├── DocumentRepository.java
│   └── MaintenanceRecordRepository.java
│
├── entity/
│   ├── User.java
│   ├── Contract.java
│   ├── DepositSource.java
│   ├── Payment.java
│   ├── Utility.java
│   ├── Document.java
│   └── MaintenanceRecord.java
│
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── ContractCreateRequest.java
│   │   ├── PaymentCreateRequest.java
│   │   └── ...
│   └── response/
│       ├── ContractResponse.java
│       ├── PaymentCalendarResponse.java
│       └── ...
│
├── enums/
│   ├── ContractType.java           // JEONSE, MONTHLY, SEMI_JEONSE
│   ├── SourceType.java             // SELF, BANK, GOVERNMENT
│   ├── PaymentCategory.java        // RENT, MAINTENANCE, LOAN, UTILITY
│   ├── PaymentStatus.java          // UPCOMING, PAID, OVERDUE
│   └── UtilityType.java            // ELECTRICITY, GAS, WATER, HEATING
│
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
│
└── exception/
    ├── GlobalExceptionHandler.java
    ├── ResourceNotFoundException.java
    └── BadRequestException.java
```

---

## 🗄️ 데이터베이스 스키마 (DDL)

```sql
-- 사용자
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 계약 정보
CREATE TABLE contracts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('JEONSE', 'MONTHLY', 'SEMI_JEONSE') NOT NULL,
    address VARCHAR(500) NOT NULL,
    jeonse_deposit DECIMAL(15, 0),
    monthly_rent DECIMAL(10, 0),
    maintenance_fee DECIMAL(10, 0),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 보증금 원천
CREATE TABLE deposit_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    type ENUM('SELF', 'BANK', 'GOVERNMENT') NOT NULL,
    amount DECIMAL(15, 0) NOT NULL,
    bank_name VARCHAR(100),
    interest_rate DECIMAL(5, 2),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- 납부 일정
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('RENT', 'MAINTENANCE', 'LOAN', 'UTILITY') NOT NULL,
    amount DECIMAL(10, 0) NOT NULL,
    payment_day INT,
    is_recurring BOOLEAN DEFAULT FALSE,
    auto_pay BOOLEAN DEFAULT FALSE,
    due_date DATE,
    paid_date DATE,
    status ENUM('UPCOMING', 'PAID', 'OVERDUE') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 공과금
CREATE TABLE utilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('ELECTRICITY', 'GAS', 'WATER', 'HEATING', 'INTERNET') NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    amount DECIMAL(10, 0) NOT NULL,
    usage_amount DECIMAL(10, 2),
    unit VARCHAR(20),
    provider VARCHAR(100),
    is_synced BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 서류
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category ENUM('CONTRACT', 'REGISTRATION', 'CHECKIN', 'OTHER') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 수리/문제 기록
CREATE TABLE maintenance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('REPAIR', 'DAMAGE') NOT NULL,
    description TEXT,
    cost DECIMAL(10, 0),
    paid_by ENUM('TENANT', 'LANDLORD'),
    status ENUM('RECORDED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'RECORDED',
    recorded_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 수리 기록 사진/영수증
CREATE TABLE maintenance_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    record_id BIGINT NOT NULL,
    file_type ENUM('PHOTO', 'RECEIPT') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES maintenance_records(id) ON DELETE CASCADE
);
```

---

## 📝 API Response 예시

### 계약 정보 조회 응답
```json
{
  "id": 1,
  "type": "SEMI_JEONSE",
  "address": "서울시 강남구 역삼동 123-45, 101동 1001호",
  "jeonseDeposit": 300000000,
  "monthlyRent": 500000,
  "maintenanceFee": 150000,
  "startDate": "2024-01-15",
  "endDate": "2026-01-14",
  "depositSources": [
    {
      "type": "SELF",
      "amount": 100000000,
      "label": "자가 자금"
    },
    {
      "type": "BANK",
      "amount": 150000000,
      "label": "은행 대출",
      "bankName": "KB국민은행",
      "interestRate": 4.5
    },
    {
      "type": "GOVERNMENT",
      "amount": 50000000,
      "label": "정부 지원 (버팀목)",
      "interestRate": 2.1
    }
  ],
  "maintenanceFeeDetail": {
    "base": 150000,
    "includesItems": ["수도", "인터넷", "경비", "청소"],
    "excludesItems": ["전기", "가스", "난방"]
  }
}
```

### 납부 캘린더 응답
```json
{
  "year": 2024,
  "month": 3,
  "totalAmount": 1488000,
  "paidAmount": 838000,
  "upcomingAmount": 650000,
  "payments": [
    {
      "id": 1,
      "name": "월세",
      "category": "RENT",
      "amount": 500000,
      "day": 25,
      "status": "UPCOMING",
      "autoPay": true
    },
    {
      "id": 2,
      "name": "관리비",
      "category": "MAINTENANCE",
      "amount": 150000,
      "day": 20,
      "status": "PAID",
      "paidDate": "2024-03-20"
    }
  ]
}
```

---

## 🚀 다음 단계 (IntelliJ에서 작업할 내용)

1. **Spring Boot 프로젝트 생성**
   - Spring Initializr로 프로젝트 생성
   - 의존성: Web, JPA, Security, MySQL Driver, Lombok, Validation

2. **Entity 클래스 작성**
   - 위 데이터 모델 기반으로 JPA Entity 생성

3. **Repository 인터페이스 작성**
   - JpaRepository 상속

4. **Service 클래스 작성**
   - 비즈니스 로직 구현

5. **Controller 클래스 작성**
   - REST API 엔드포인트 구현

6. **Security 설정**
   - JWT 인증 구현

7. **CORS 설정**
   - React (localhost:5173) 허용

---

## 📎 첨부 파일

- `TenantHousingAppV3.jsx` - React 프론트엔드 코드 (캘린더 포함)
- `INTEGRATION_GUIDE.md` - 상세 연동 가이드

---

**작성일:** 2024년
**작성:** Claude (Cowork Mode)

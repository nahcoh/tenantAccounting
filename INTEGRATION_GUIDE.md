# 🏠 세입자 주거 기록 앱 - Spring Boot + React 연동 가이드

## 📁 프로젝트 구조

```
tenant-housing-app/
├── backend/                      # Spring Boot
│   ├── src/main/java/com/tenant/
│   │   ├── TenantApplication.java
│   │   ├── config/
│   │   │   ├── WebConfig.java          # CORS 설정
│   │   │   └── SecurityConfig.java     # Spring Security
│   │   ├── controller/
│   │   │   ├── ContractController.java
│   │   │   ├── PaymentController.java
│   │   │   ├── UtilityController.java
│   │   │   └── DocumentController.java
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   ├── src/main/resources/
│   │   └── application.yml
│   └── build.gradle
│
├── frontend/                     # React
│   ├── src/
│   │   ├── api/                  # API 호출 모듈
│   │   │   ├── axiosInstance.js
│   │   │   ├── contractApi.js
│   │   │   ├── paymentApi.js
│   │   │   └── utilityApi.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── useContract.js
│   │   │   └── usePayments.js
│   │   └── App.jsx
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 1️⃣ Backend (Spring Boot) 설정

### build.gradle

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.tenant'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '17'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-security'

    // JWT 인증
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'

    // Database
    runtimeOnly 'com.mysql:mysql-connector-j'
    // 또는 runtimeOnly 'org.postgresql:postgresql'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

### application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tenant_db?useSSL=false&serverTimezone=Asia/Seoul
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect

# CORS 설정
cors:
  allowed-origins: http://localhost:3000,http://localhost:5173

# JWT 설정
jwt:
  secret: your-256-bit-secret-key-here-make-it-long-enough
  expiration: 86400000  # 24시간
```

### CORS 설정 (WebConfig.java)

```java
package com.tenant.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## 2️⃣ API 엔드포인트 설계

### 계약 정보 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/contracts/{userId}` | 계약 정보 조회 |
| POST | `/api/contracts` | 계약 정보 등록 |
| PUT | `/api/contracts/{id}` | 계약 정보 수정 |

### 납부 일정 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/payments/recurring` | 정기 납부 목록 |
| GET | `/api/payments/calendar/{year}/{month}` | 월별 납부 일정 |
| GET | `/api/payments/upcoming` | 다가오는 납부 (14일) |
| POST | `/api/payments/recurring` | 정기 납부 추가 |
| POST | `/api/payments/{id}/complete` | 납부 완료 처리 |

### 공과금 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/utilities/{year}/{month}` | 월별 공과금 조회 |
| POST | `/api/utilities` | 공과금 등록 |
| POST | `/api/utilities/sync/kepco` | 한전 연동 (외부 API) |
| POST | `/api/utilities/sync/gas` | 도시가스 연동 |

### 서류 관리 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/documents` | 서류 목록 |
| POST | `/api/documents/upload` | 서류 업로드 |
| DELETE | `/api/documents/{id}` | 서류 삭제 |

---

## 3️⃣ Entity & DTO 예시

### Contract Entity

```java
package com.tenant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "contracts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractType type;  // JEONSE, MONTHLY, SEMI_JEONSE

    @Column(nullable = false)
    private String address;

    private BigDecimal jeonseDeposit;      // 전세금/보증금
    private BigDecimal monthlyRent;         // 월세 (반전세/월세인 경우)
    private BigDecimal maintenanceFee;      // 관리비

    private LocalDate startDate;
    private LocalDate endDate;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
    private List<DepositSource> depositSources;  // 보증금 원천

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }
}

enum ContractType {
    JEONSE,       // 전세
    MONTHLY,      // 월세
    SEMI_JEONSE   // 반전세
}
```

### DepositSource Entity (보증금 원천)

```java
package com.tenant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "deposit_sources")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepositSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Enumerated(EnumType.STRING)
    private SourceType type;  // SELF, BANK, GOVERNMENT

    private BigDecimal amount;
    private String bankName;           // 은행명 (대출인 경우)
    private BigDecimal interestRate;   // 금리
}

enum SourceType {
    SELF,        // 자가 자금
    BANK,        // 은행 대출
    GOVERNMENT   // 정부 지원
}
```

### Payment Entity (납부 일정)

```java
package com.tenant.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String name;              // 납부 항목명

    @Enumerated(EnumType.STRING)
    private PaymentCategory category; // RENT, MAINTENANCE, LOAN, UTILITY

    private BigDecimal amount;
    private Integer paymentDay;       // 정기 납부일 (1~28)
    private Boolean isRecurring;      // 정기 납부 여부
    private Boolean autoPay;          // 자동이체 여부

    private LocalDate dueDate;        // 납부 예정일 (비정기)
    private LocalDate paidDate;       // 실제 납부일

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;     // UPCOMING, PAID, OVERDUE
}

enum PaymentCategory {
    RENT, MAINTENANCE, LOAN, UTILITY
}

enum PaymentStatus {
    UPCOMING, PAID, OVERDUE
}
```

### Response DTO 예시

```java
package com.tenant.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContractResponseDto {
    private Long id;
    private String type;
    private String address;
    private BigDecimal jeonseDeposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    private String startDate;
    private String endDate;
    private List<DepositSourceDto> depositSources;
    private MaintenanceFeeDetailDto maintenanceFeeDetail;
}

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DepositSourceDto {
    private String type;
    private BigDecimal amount;
    private String label;
    private String bankName;
    private BigDecimal interestRate;
}

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PaymentCalendarResponseDto {
    private int year;
    private int month;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal upcomingAmount;
    private List<PaymentDto> payments;
}
```

---

## 4️⃣ Controller 예시

```java
package com.tenant.controller;

import com.tenant.dto.*;
import com.tenant.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping("/{userId}")
    public ResponseEntity<ContractResponseDto> getContract(@PathVariable Long userId) {
        return ResponseEntity.ok(contractService.getContractByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ContractResponseDto> createContract(
            @RequestBody ContractCreateDto dto) {
        return ResponseEntity.ok(contractService.createContract(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponseDto> updateContract(
            @PathVariable Long id,
            @RequestBody ContractUpdateDto dto) {
        return ResponseEntity.ok(contractService.updateContract(id, dto));
    }
}
```

```java
package com.tenant.controller;

import com.tenant.dto.*;
import com.tenant.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // 정기 납부 목록
    @GetMapping("/recurring")
    public ResponseEntity<List<PaymentDto>> getRecurringPayments() {
        return ResponseEntity.ok(paymentService.getRecurringPayments());
    }

    // 월별 캘린더 데이터
    @GetMapping("/calendar/{year}/{month}")
    public ResponseEntity<PaymentCalendarResponseDto> getCalendar(
            @PathVariable int year,
            @PathVariable int month) {
        return ResponseEntity.ok(paymentService.getPaymentCalendar(year, month));
    }

    // 다가오는 납부 일정
    @GetMapping("/upcoming")
    public ResponseEntity<List<PaymentDto>> getUpcoming(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(paymentService.getUpcomingPayments(days));
    }

    // 정기 납부 추가
    @PostMapping("/recurring")
    public ResponseEntity<PaymentDto> addRecurring(@RequestBody PaymentCreateDto dto) {
        return ResponseEntity.ok(paymentService.createRecurringPayment(dto));
    }

    // 납부 완료 처리
    @PostMapping("/{id}/complete")
    public ResponseEntity<PaymentDto> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.markAsPaid(id));
    }
}
```

---

## 5️⃣ Frontend (React) API 연동

### 패키지 설치

```bash
npm install axios
# 또는
yarn add axios
```

### Axios Instance 설정

```javascript
// src/api/axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (JWT 토큰 자동 첨부)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리, 토큰 갱신)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 시 로그아웃 또는 갱신 처리
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API 모듈 분리

```javascript
// src/api/contractApi.js
import api from './axiosInstance';

export const contractApi = {
  // 계약 정보 조회
  getContract: (userId) =>
    api.get(`/contracts/${userId}`),

  // 계약 정보 등록
  createContract: (data) =>
    api.post('/contracts', data),

  // 계약 정보 수정
  updateContract: (id, data) =>
    api.put(`/contracts/${id}`, data),
};
```

```javascript
// src/api/paymentApi.js
import api from './axiosInstance';

export const paymentApi = {
  // 정기 납부 목록
  getRecurringPayments: () =>
    api.get('/payments/recurring'),

  // 월별 캘린더
  getCalendar: (year, month) =>
    api.get(`/payments/calendar/${year}/${month}`),

  // 다가오는 납부
  getUpcoming: (days = 14) =>
    api.get(`/payments/upcoming?days=${days}`),

  // 정기 납부 추가
  addRecurring: (data) =>
    api.post('/payments/recurring', data),

  // 납부 완료
  markAsPaid: (id) =>
    api.post(`/payments/${id}/complete`),
};
```

```javascript
// src/api/utilityApi.js
import api from './axiosInstance';

export const utilityApi = {
  // 월별 공과금 조회
  getMonthly: (year, month) =>
    api.get(`/utilities/${year}/${month}`),

  // 공과금 등록
  create: (data) =>
    api.post('/utilities', data),

  // 한전 연동
  syncKepco: () =>
    api.post('/utilities/sync/kepco'),

  // 도시가스 연동
  syncGas: () =>
    api.post('/utilities/sync/gas'),
};
```

### Custom Hook으로 데이터 관리

```javascript
// src/hooks/useContract.js
import { useState, useEffect } from 'react';
import { contractApi } from '../api/contractApi';

export const useContract = (userId) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const response = await contractApi.getContract(userId);
        setContract(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchContract();
    }
  }, [userId]);

  const updateContract = async (data) => {
    try {
      const response = await contractApi.updateContract(contract.id, data);
      setContract(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { contract, loading, error, updateContract };
};
```

```javascript
// src/hooks/usePayments.js
import { useState, useEffect } from 'react';
import { paymentApi } from '../api/paymentApi';

export const usePayments = (year, month) => {
  const [calendar, setCalendar] = useState(null);
  const [recurring, setRecurring] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [calendarRes, recurringRes, upcomingRes] = await Promise.all([
          paymentApi.getCalendar(year, month),
          paymentApi.getRecurringPayments(),
          paymentApi.getUpcoming(14),
        ]);
        setCalendar(calendarRes.data);
        setRecurring(recurringRes.data);
        setUpcoming(upcomingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, month]);

  const markAsPaid = async (paymentId) => {
    const response = await paymentApi.markAsPaid(paymentId);
    // 캘린더 새로고침
    const calendarRes = await paymentApi.getCalendar(year, month);
    setCalendar(calendarRes.data);
    return response.data;
  };

  return { calendar, recurring, upcoming, loading, markAsPaid };
};
```

---

## 6️⃣ React 컴포넌트에서 사용

### 기존 하드코딩 → API 호출로 변경

**Before (현재 코드):**
```jsx
// 하드코딩된 데이터
const contractInfo = {
  type: 'semi-jeonse',
  jeonseDeposit: 300000000,
  // ...
};
```

**After (API 연동):**
```jsx
import { useContract } from '../hooks/useContract';
import { usePayments } from '../hooks/usePayments';

export default function TenantHousingApp() {
  const userId = 1; // 로그인된 사용자 ID
  const [calendarYear, setCalendarYear] = useState(2024);
  const [calendarMonth, setCalendarMonth] = useState(3);

  // API 데이터 로드
  const { contract, loading: contractLoading } = useContract(userId);
  const { calendar, recurring, upcoming, loading: paymentLoading, markAsPaid } =
    usePayments(calendarYear, calendarMonth);

  if (contractLoading || paymentLoading) {
    return <LoadingSpinner />;
  }

  // 이제 contract, calendar 등을 사용
  return (
    <div>
      <ContractSummary contract={contract} />
      <PaymentCalendar
        calendar={calendar}
        onMarkPaid={markAsPaid}
      />
      <UpcomingPayments payments={upcoming} />
    </div>
  );
}
```

---

## 7️⃣ 환경 변수 설정

### Frontend (.env)

```env
# 개발 환경
VITE_API_URL=http://localhost:8080/api

# 프로덕션
# VITE_API_URL=https://api.yourdomain.com/api
```

### Backend (application-prod.yml)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

cors:
  allowed-origins: https://yourdomain.com
```

---

## 8️⃣ 배포 체크리스트

### Backend
- [ ] CORS 설정 확인 (프로덕션 도메인)
- [ ] 환경변수 분리 (application-prod.yml)
- [ ] DB 마이그레이션 (Flyway/Liquibase 권장)
- [ ] JWT 시크릿 키 안전하게 관리
- [ ] HTTPS 설정
- [ ] 로깅 설정

### Frontend
- [ ] 환경변수 설정 (.env.production)
- [ ] 빌드 테스트 (`npm run build`)
- [ ] API URL 확인
- [ ] 에러 바운더리 추가
- [ ] 로딩 상태 UI

---

## 9️⃣ 다음 단계

1. **인증/인가**: Spring Security + JWT 로그인 구현
2. **파일 업로드**: S3 또는 로컬 스토리지 연동 (서류 업로드)
3. **외부 API 연동**: 한전, 도시가스 API (공과금 자동 연동)
4. **알림 기능**: 납부일 알림 (FCM, 이메일)
5. **테스트**: JUnit + React Testing Library

---

## 참고 자료

- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Axios 문서](https://axios-http.com/)
- [Vite 환경변수](https://vitejs.dev/guide/env-and-mode.html)

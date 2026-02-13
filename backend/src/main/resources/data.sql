-- =====================================================
-- 더미 데이터 SQL - 테넌트 레코드 앱
-- =====================================================

-- Mock User Data
INSERT INTO users ( email, password, name, role, created_at) VALUES
( 'test@test.com', 'password', '홍길동', 'USER', CURRENT_TIMESTAMP);

-- =====================================================
-- 계약 정보 (월세)
-- =====================================================
INSERT INTO contracts ( user_id, `type`, address, jeonse_deposit, monthly_rent, maintenance_fee, start_date, end_date, created_at) VALUES
( 1, 'MONTHLY', '서울시 강남구 테헤란로 123, 래미안아파트 101동 1502호', 50000000, 800000, 150000, '2024-03-01', '2026-02-28', CURRENT_TIMESTAMP);

-- Mock Deposit Source Data (for contract_id = 1)
INSERT INTO deposit_sources (id, contract_id, `type`, amount, bank_name, interest_rate) VALUES
( 1, 'SELF', 10000000, NULL, NULL),
(2, 1, 'BANK', 40000000, 'KB국민은행', 3.5);

-- =====================================================
-- 대출 정보
-- =====================================================
INSERT INTO loans (id, user_id, name, `type`, principal_amount, remaining_amount, interest_rate, repayment_type, monthly_payment, bank_name, start_date, end_date, payment_day, memo, created_at) VALUES
(1, 1, '전세자금대출', 'JEONSE', 40000000, 38500000, 3.50, 'EQUAL_PRINCIPAL_INTEREST', 395000, 'KB국민은행', '2024-03-01', '2026-02-28', 15, '버팀목 전세자금대출', CURRENT_TIMESTAMP);

-- =====================================================
-- 공과금 (2025년 1월, 2월)
-- =====================================================
INSERT INTO utilities (id, user_id, `type`, year_month, amount, usage_amount, unit, provider, is_synced, paid_date) VALUES
-- 2025년 1월 (완납)
(1, 1, 'ELECTRICITY', '2025-01', 45000, 180, 'kWh', '한국전력', TRUE, '2025-01-25'),
(2, 1, 'GAS', '2025-01', 78000, 45, 'm³', '서울도시가스', TRUE, '2025-01-25'),
(3, 1, 'WATER', '2025-01', 25000, 12, 'm³', '서울시상수도', TRUE, '2025-01-25'),
(4, 1, 'INTERNET', '2025-01', 35000, NULL, NULL, 'SKT', TRUE, '2025-01-25'),
-- 2025년 2월
(5, 1, 'ELECTRICITY', '2025-02', 52000, 210, 'kWh', '한국전력', TRUE, '2025-02-25'),
(6, 1, 'GAS', '2025-02', 65000, 38, 'm³', '서울도시가스', TRUE, '2025-02-25'),
(7, 1, 'WATER', '2025-02', 28000, 14, 'm³', '서울시상수도', TRUE, '2025-02-25'),
(8, 1, 'INTERNET', '2025-02', 35000, NULL, NULL, 'SKT', TRUE, NULL);

-- =====================================================
-- 납부 일정 (Payments) - source_type, source_id 연동
-- =====================================================
-- 월세 (정기) - CONTRACT 연동
INSERT INTO payments (id, user_id, name, category, amount, payment_day, is_recurring, auto_pay, due_date, paid_date, status, source_type, source_id, created_at) VALUES
(1, 1, '월세', 'RENT', 800000, 25, TRUE, FALSE, '2025-02-25', '2025-02-25', 'PAID', 'CONTRACT', 1, CURRENT_TIMESTAMP),
-- 관리비 (정기) - CONTRACT 연동
(2, 1, '관리비', 'MAINTENANCE', 150000, 25, TRUE, FALSE, '2025-02-25', '2025-02-25', 'PAID', 'CONTRACT', 1, CURRENT_TIMESTAMP),
-- 대출 상환 (정기) - LOAN 연동
(3, 1, '전세자금대출 상환', 'LOAN', 395000, 15, TRUE, TRUE, '2025-02-15', '2025-02-15', 'PAID', 'LOAN', 1, CURRENT_TIMESTAMP),
-- 전기요금 (2월) - UTILITY 연동
(4, 1, '전기 요금', 'UTILITY', 52000, 25, FALSE, FALSE, '2025-02-25', '2025-02-25', 'PAID', 'UTILITY', 5, CURRENT_TIMESTAMP),
-- 가스요금 (2월) - UTILITY 연동
(5, 1, '가스 요금', 'UTILITY', 65000, 25, FALSE, FALSE, '2025-02-25', '2025-02-25', 'PAID', 'UTILITY', 6, CURRENT_TIMESTAMP),
-- 수도요금 (2월) - UTILITY 연동
(6, 1, '수도 요금', 'UTILITY', 28000, 25, FALSE, FALSE, '2025-02-25', '2025-02-25', 'PAID', 'UTILITY', 7, CURRENT_TIMESTAMP),
-- 인터넷 (2월) - UTILITY 연동 (미납)
(7, 1, '인터넷 요금', 'UTILITY', 35000, 25, FALSE, FALSE, '2025-02-25', NULL, 'UPCOMING', 'UTILITY', 8, CURRENT_TIMESTAMP),
-- 유지보수 (임차인 부담) - MAINTENANCE 연동
(8, 1, '[유지보수] 화장실 변기 교체', 'MAINTENANCE', 180000, 10, FALSE, FALSE, '2025-02-10', '2025-02-10', 'PAID', 'MAINTENANCE', 3, CURRENT_TIMESTAMP),
(9, 1, '[유지보수] 에어컨 필터 교체', 'MAINTENANCE', 50000, 15, FALSE, FALSE, '2025-02-15', NULL, 'UPCOMING', 'MAINTENANCE', 4, CURRENT_TIMESTAMP);

-- =====================================================
-- 문서
-- =====================================================
INSERT INTO documents (id, user_id, name, category, file_path, is_required, uploaded_at) VALUES
(1, 1, '임대차 계약서.pdf', 'CONTRACT', '/uploads/user1/contract.pdf', TRUE, CURRENT_TIMESTAMP);

-- =====================================================
-- 유지보수 기록 (maintenances 테이블)
-- =====================================================
INSERT INTO maintenances (id, contract_id, title, category, description, status, cost, paid_by, created_at) VALUES
(1, 1, '보일러 고장 수리', 'REPAIR', '보일러 점화 불량으로 수리업체 호출', 'COMPLETED', 150000, 'LANDLORD', CURRENT_TIMESTAMP),
(2, 1, '거실 벽지 찢어짐', 'REPAIR', '가구 이동 중 벽지 10cm 가량 찢어짐', 'REQUESTED', NULL, NULL, CURRENT_TIMESTAMP),
(3, 1, '화장실 변기 교체', 'PLUMBING', '변기 노후로 인한 교체 - 임차인 과실로 부담', 'COMPLETED', 180000, 'TENANT', CURRENT_TIMESTAMP),
(4, 1, '에어컨 필터 교체', 'APPLIANCE', '에어컨 필터 교체 및 청소', 'IN_PROGRESS', 50000, 'TENANT', CURRENT_TIMESTAMP);

-- =====================================================
-- 완료! 테스트 계정: test@test.com / password
-- =====================================================

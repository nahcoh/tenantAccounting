-- Mock User Data
-- Note: The password is plain text and not hashed. For actual login, signup via the API is required.
INSERT INTO users (id, email, password, name, created_at) VALUES
(1, 'test@test.com', 'password', '테스트계정', CURRENT_TIMESTAMP);

-- Mock Contract Data (for user_id = 1)
INSERT INTO contracts (id, user_id, `type`, address, jeonse_deposit, monthly_rent, maintenance_fee, start_date, end_date, created_at) VALUES
(1, 1, 'SEMI_JEONSE', '서울시 강남구 역삼동 123-45, 101동 1001호', 300000000, 500000, 150000, '2024-01-15', '2026-01-14', CURRENT_TIMESTAMP);

-- Mock Deposit Source Data (for contract_id = 1)
INSERT INTO deposit_sources (id, contract_id, `type`, amount, bank_name, interest_rate) VALUES
(1, 1, 'SELF', 100000000, NULL, NULL),
(2, 1, 'BANK', 150000000, 'KB국민은행', 4.5),
(3, 1, 'GOVERNMENT', 50000000, '주택도시기금 (버팀목)', 2.1);

-- Mock Payment Data (for user_id = 1)
-- Recurring Payments for testing POST /api/payments/recurring
INSERT INTO payments (id, user_id, name, category, amount, payment_day, is_recurring, auto_pay, status, created_at) VALUES
(1, 1, '월세', 'RENT', 500000, 25, TRUE, TRUE, 'UPCOMING', CURRENT_TIMESTAMP),
(2, 1, '관리비', 'MAINTENANCE', 150000, 20, TRUE, FALSE, 'UPCOMING', CURRENT_TIMESTAMP),
(3, 1, '은행 대출이자', 'LOAN', 562500, 15, TRUE, TRUE, 'UPCOMING', CURRENT_TIMESTAMP);

-- Single Payment for a specific date
INSERT INTO payments (id, user_id, name, category, amount, due_date, is_recurring, auto_pay, status, created_at) VALUES
(4, 1, '벽지 수리비', 'MAINTENANCE', 75000, '2024-04-10', FALSE, FALSE, 'UPCOMING', CURRENT_TIMESTAMP);


-- Mock Utility Data (for user_id = 1)
-- Assuming 'created_at' column exists in utilities table as well
-- INSERT INTO utilities (id, user_id, `type`, year_month, amount, usage_amount, unit, provider, is_synced, created_at) VALUES
-- (1, 1, 'ELECTRICITY', '2024-03', 38000, 250, 'kWh', '한국전력', FALSE, CURRENT_TIMESTAMP),
-- (2, 1, 'GAS', '2024-03', 65000, 50, 'm³', '서울도시가스', FALSE, CURRENT_TIMESTAMP);

-- Mock Document Data (for user_id = 1) for testing POST /api/documents/upload
INSERT INTO documents (id, user_id, name, category, file_path, is_required, uploaded_at) VALUES
(1, 1, '임대차 계약서.pdf', 'CONTRACT', '/uploads/user1/contract.pdf', TRUE, CURRENT_TIMESTAMP);

-- Mock Maintenance Record Data (for user_id = 1)
INSERT INTO maintenance_records (id, user_id, title, category, description, cost, paid_by, status, recorded_at, created_at) VALUES
(1, 1, '보일러 고장 수리', 'REPAIR', '보일러 점화 불량으로 수리업체 호출', 150000, 'LANDLORD', 'COMPLETED', '2024-02-10', CURRENT_TIMESTAMP),
(2, 1, '거실 벽지 찢어짐', 'DAMAGE', '가구 이동 중 벽지 10cm 가량 찢어짐', NULL, NULL, 'RECORDED', '2024-03-15', CURRENT_TIMESTAMP);

-- Mock Maintenance Files (for record_id = 1)
INSERT INTO maintenance_files (id, record_id, file_type, file_path, uploaded_at) VALUES
(1, 1, 'PHOTO', '/uploads/user1/boiler_photo.jpg', CURRENT_TIMESTAMP),
(2, 1, 'RECEIPT', '/uploads/user1/boiler_receipt.pdf', CURRENT_TIMESTAMP);

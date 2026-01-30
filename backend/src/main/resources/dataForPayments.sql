-- Mock User Data (to satisfy foreign key for payments)
INSERT INTO users (id, email, password, name, created_at) VALUES
(1, 'test@test.com', 'password', '테스트계정', CURRENT_TIMESTAMP);

-- Dummy Data for Payments table (3 entries)
-- Note: This script assumes a user with id=1 exists.
INSERT INTO payments (user_id, name, category, amount, payment_day, is_recurring, auto_pay, status, created_at) VALUES
(1, '월세', 'RENT', 500000, 25, 1, 1, 'UPCOMING', CURRENT_TIMESTAMP),
(1, '관리비', 'MAINTENANCE', 150000, 20, 1, 0, 'UPCOMING', CURRENT_TIMESTAMP),
(1, '은행 대출이자', 'LOAN', 562500, 15, 1, 1, 'UPCOMING', CURRENT_TIMESTAMP);



-- 기존 데이터를 지우고 다시 넣어봐!
DELETE FROM payments WHERE user_id = 1;

INSERT INTO payments (user_id, name, category, amount, due_date, is_recurring, auto_pay, status, created_at) VALUES
-- 1월 데이터
(1, '1월 월세', 'RENT', 500000, '2026-01-25', 0, 1, 'UPCOMING', CURRENT_TIMESTAMP),
(1, '1월 관리비', 'MAINTENANCE', 150000, '2026-01-20', 0, 0, 'UPCOMING', CURRENT_TIMESTAMP),

-- 2월 데이터 (테스트용)
(1, '2월 월세', 'RENT', 500000, '2026-02-25', 0, 1, 'UPCOMING', CURRENT_TIMESTAMP),
(1, '2월 통신비', 'RENT', 80000, '2026-02-10', 0, 1, 'UPCOMING', CURRENT_TIMESTAMP);

ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
package com.starter.repository;

import com.starter.domain.Payment;
import com.starter.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdAndIsRecurringAndDueDateBetween(Long userId, boolean isRecurring, LocalDate startDate, LocalDate endDate);

    List<Payment> findByUserIdAndIsRecurring(Long userId, boolean isRecurring);

    // 특정 유저의 특정 기간 내 모든 결제 내역(정기/비정기 포함) 조회
    List<Payment> findByUserIdAndDueDateBetween(Long userId, LocalDate start, LocalDate end);

    // 특정 유저의 모든 결제 내역 조회
    List<Payment> findByUserId(Long userId);

    // 특정 유저의 상태별 결제 내역 조회
    List<Payment> findByUserIdAndStatus(Long userId, PaymentStatus status);

    void deleteByUserId(Long userId);

    // 원본 데이터로 결제 내역 조회
    List<Payment> findByUserIdAndSourceTypeAndSourceId(Long userId, String sourceType, Long sourceId);

    // 원본 데이터로 결제 내역 삭제
    void deleteByUserIdAndSourceTypeAndSourceId(Long userId, String sourceType, Long sourceId);
}

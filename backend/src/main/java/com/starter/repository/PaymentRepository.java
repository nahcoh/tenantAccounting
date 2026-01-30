package com.starter.repository;

import com.starter.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdAndIsRecurringAndDueDateBetween(Long userId, boolean isRecurring, LocalDate startDate, LocalDate endDate);

    List<Payment> findByUserIdAndIsRecurring(Long userId, boolean isRecurring);
}

package com.starter.service;

import com.starter.domain.Payment;
import com.starter.domain.User;
import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.dto.response.PaymentResponse;
import com.starter.enums.PaymentStatus;
import com.starter.repository.PaymentRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentCalendarResponse getMonthlyPayments(Long userId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());

        // [수정] 이제 isRecurring 여부와 상관없이, 해당 월에 '마감일(dueDate)'이 있는 모든 내역을 가져와
        // 이를 위해 Repository에 findByUserIdAndDueDateBetween 메서드가 필요해
        List<Payment> allMonthlyPayments = paymentRepository.findByUserIdAndDueDateBetween(userId, startDate, endDate);

        // DTO 변환
        List<PaymentResponse> monthlyPayments = allMonthlyPayments.stream()
            .map(this::toPaymentResponse)
            .collect(Collectors.toList());

        // 금액 계산 (기존 로직 유지)
        BigDecimal totalAmount = monthlyPayments.stream()
            .map(PaymentResponse::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal paidAmount = monthlyPayments.stream()
            .filter(p -> p.getStatus() == PaymentStatus.PAID)
            .map(PaymentResponse::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal upcomingAmount = totalAmount.subtract(paidAmount);

        return new PaymentCalendarResponse(year, month, totalAmount, paidAmount, upcomingAmount, monthlyPayments);
    }

    @Transactional
    public Long createRecurringPayment(Long userId, PaymentCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Payment payment = Payment.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .amount(request.getAmount())
                .paymentDay(request.getPaymentDay())
                .isRecurring(true)
                .autoPay(request.getAutoPay())
                .dueDate(request.getDueDate())
                .status(PaymentStatus.UPCOMING)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return savedPayment.getId();
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                .getId();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        Integer paymentDay = payment.getPaymentDay();
        if (paymentDay == null && payment.getDueDate() != null) {
            paymentDay = payment.getDueDate().getDayOfMonth();
        }
        return new PaymentResponse(
                payment.getId(),
                payment.getName(),
                payment.getCategory(),
                payment.getAmount(),
                paymentDay,
                payment.getStatus(),
                payment.getAutoPay(),
                payment.getDueDate(),
                payment.getPaidDate()
        );
    }
}

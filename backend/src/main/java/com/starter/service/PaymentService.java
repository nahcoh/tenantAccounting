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

//    public PaymentCalendarResponse getMonthlyPayments(Long userId, int year, int month) {
//        LocalDate startDate = LocalDate.of(year, month, 1);
//        LocalDate endDate = startDate.with(TemporalAdjusters.lastDayOfMonth());
//
//        // 1. 해당 월의 비정기 납부 내역 조회
//        List<Payment> nonRecurringPayments = paymentRepository.findByUserIdAndIsRecurringAndDueDateBetween(userId, false, startDate, endDate);
//
//        // 2. 해당 유저의 모든 정기 납부 규칙 조회
//        List<Payment> recurringPaymentRules = paymentRepository.findByUserIdAndIsRecurring(userId, true);
//
//        // 3. 두 리스트를 조합하여 PaymentResponse DTO 리스트 생성
//        List<PaymentResponse> monthlyPayments = new ArrayList<>();
//
//        // 비정기 납부 내역 추가
//        nonRecurringPayments.forEach(p -> monthlyPayments.add(toPaymentResponse(p)));
//
//        // 정기 납부 규칙을 기반으로 해당 월의 납부 내역 추가
//        recurringPaymentRules.forEach(rule -> {
//            // 해당 월의 날짜 수가 paymentDay보다 작은 경우 스킵 (예: 2월 30일)
//            if (endDate.getDayOfMonth() >= rule.getPaymentDay()) {
//                monthlyPayments.add(toPaymentResponse(rule));
//            }
//        });
//
//        // 4. 금액 계산
//        BigDecimal totalAmount = monthlyPayments.stream()
//                .map(PaymentResponse::getAmount)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        BigDecimal paidAmount = monthlyPayments.stream()
//                .filter(p -> p.getStatus() == PaymentStatus.PAID)
//                .map(PaymentResponse::getAmount)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        BigDecimal upcomingAmount = totalAmount.subtract(paidAmount);
//
//        return new PaymentCalendarResponse(year, month, totalAmount, paidAmount, upcomingAmount, monthlyPayments);
//    }

    @Transactional
    public Long createRecurringPayment(Long userId, PaymentCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Payment payment = Payment.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .amount(request.getAmount())
                .paymentDay(request.getPaymentDay())
                .isRecurring(true)
                .autoPay(request.getAutoPay())
                .status(PaymentStatus.UPCOMING)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return savedPayment.getId();
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getName(),
                payment.getCategory(),
                payment.getAmount(),
                payment.getPaymentDay(),
                payment.getStatus(),
                payment.getAutoPay(),
                payment.getPaidDate()
        );
    }
}

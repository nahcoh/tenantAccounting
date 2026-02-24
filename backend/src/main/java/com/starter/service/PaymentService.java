package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.Payment;
import com.starter.domain.User;
import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.dto.response.PaymentOverviewResponse;
import com.starter.dto.response.PaymentResponse;
import com.starter.enums.PaymentStatus;
import com.starter.repository.ContractRepository;
import com.starter.repository.PaymentRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;

    @Transactional(readOnly = true)
    public PaymentCalendarResponse getMonthlyPayments(Long userId, int year, int month) {
        LocalDate today = LocalDate.now();
        List<PaymentResponse> monthlyPayments = buildMonthlyPaymentResponses(userId, year, month, today);

        // 금액 계산
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

    public PaymentOverviewResponse getOverview(Long userId, int year, int month) {
        List<PaymentResponse> currentMonthPayments = buildMonthlyPaymentResponses(userId, year, month);
        BigDecimal currentMonthTotal = currentMonthPayments.stream()
                .map(PaymentResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentMonthPaid = currentMonthPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .map(PaymentResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentMonthUpcoming = currentMonthTotal.subtract(currentMonthPaid);

        LocalDate currentMonthStart = LocalDate.of(year, month, 1);
        LocalDate currentMonthEnd = currentMonthStart.with(TemporalAdjusters.lastDayOfMonth());
        LocalDate prevMonth = currentMonthStart.minusMonths(1);
        List<PaymentResponse> prevMonthPayments = buildMonthlyPaymentResponses(userId, prevMonth.getYear(), prevMonth.getMonthValue());
        BigDecimal previousMonthTotal = prevMonthPayments.stream()
                .map(PaymentResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 전월 대비 변화율 계산
        BigDecimal monthOverMonthChange = BigDecimal.ZERO;
        if (previousMonthTotal.compareTo(BigDecimal.ZERO) > 0) {
            monthOverMonthChange = currentMonthTotal.subtract(previousMonthTotal)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(previousMonthTotal, 1, RoundingMode.HALF_UP);
        }

        // 카테고리별 지출
        Map<String, BigDecimal> categoryBreakdown = new HashMap<>();
        for (PaymentResponse payment : currentMonthPayments) {
            String category = payment.getCategory().name();
            categoryBreakdown.merge(category, payment.getAmount(), BigDecimal::add);
        }

        BigDecimal yearToDateTotal = BigDecimal.ZERO;
        for (int m = 1; m <= month; m++) {
            BigDecimal monthlyTotal = buildMonthlyPaymentResponses(userId, year, m).stream()
                    .map(PaymentResponse::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            yearToDateTotal = yearToDateTotal.add(monthlyTotal);
        }

        // 최근 납부 내역 (최근 5건)
        List<PaymentResponse> recentPayments = currentMonthPayments.stream()
                .sorted((a, b) -> {
                    if (a.getDueDate() == null && b.getDueDate() == null) return 0;
                    if (a.getDueDate() == null) return 1;
                    if (b.getDueDate() == null) return -1;
                    return b.getDueDate().compareTo(a.getDueDate());
                })
                .limit(5)
                .collect(Collectors.toList());

        // 계약 정보 기반 월 고정 지출
        BigDecimal monthlyFixedCost = BigDecimal.ZERO;
        List<Contract> contracts = contractRepository.findByUserId(userId);
        if (!contracts.isEmpty()) {
            Contract contract = contracts.get(0);
            if (contract.getMonthlyRent() != null) {
                monthlyFixedCost = monthlyFixedCost.add(contract.getMonthlyRent());
            }
            if (contract.getMaintenanceFee() != null) {
                monthlyFixedCost = monthlyFixedCost.add(contract.getMaintenanceFee());
            }
        }

        return PaymentOverviewResponse.builder()
                .year(year)
                .month(month)
                .currentMonthTotal(currentMonthTotal)
                .currentMonthPaid(currentMonthPaid)
                .currentMonthUpcoming(currentMonthUpcoming)
                .previousMonthTotal(previousMonthTotal)
                .monthOverMonthChange(monthOverMonthChange)
                .categoryBreakdown(categoryBreakdown)
                .yearToDateTotal(yearToDateTotal)
                .recentPayments(recentPayments)
                .monthlyFixedCost(monthlyFixedCost)
                .build();
    }

    private List<PaymentResponse> buildMonthlyPaymentResponses(Long userId, int year, int month) {
        return buildMonthlyPaymentResponses(userId, year, month, LocalDate.now());
    }

    private List<PaymentResponse> buildMonthlyPaymentResponses(Long userId, int year, int month, LocalDate today) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.with(TemporalAdjusters.lastDayOfMonth());

        List<Payment> actualPayments = paymentRepository.findByUserIdAndDueDateBetween(userId, monthStart, monthEnd);
        List<Payment> recurringPayments = paymentRepository.findByUserIdAndIsRecurring(userId, true);

        List<PaymentResponse> monthlyPayments = new ArrayList<>();
        Set<String> existingKeys = new HashSet<>();

        for (Payment payment : actualPayments) {
            PaymentResponse response = toPaymentResponseWithComputedStatus(payment, today);
            monthlyPayments.add(response);
            existingKeys.add(buildRecurringKey(payment.getName(), payment.getCategory().name()));
        }

        for (Payment recurring : recurringPayments) {
            Integer paymentDay = recurring.getPaymentDay();
            if (paymentDay == null && recurring.getDueDate() != null) {
                paymentDay = recurring.getDueDate().getDayOfMonth();
            }
            if (paymentDay == null) continue;

            int adjustedDay = Math.min(paymentDay, monthEnd.getDayOfMonth());
            LocalDate recurringDueDate = LocalDate.of(year, month, adjustedDay);

            boolean alreadyExists = existingKeys.contains(buildRecurringKey(recurring.getName(), recurring.getCategory().name()));

            if (!alreadyExists) {
                PaymentStatus status = recurringDueDate.isBefore(today) ? PaymentStatus.OVERDUE : PaymentStatus.UPCOMING;

                PaymentResponse virtualPayment = new PaymentResponse();
                virtualPayment.setId(recurring.getId() * -1);
                virtualPayment.setName(recurring.getName());
                virtualPayment.setCategory(recurring.getCategory());
                virtualPayment.setAmount(recurring.getAmount());
                virtualPayment.setPaymentDay(adjustedDay);
                virtualPayment.setStatus(status);
                virtualPayment.setAutoPay(recurring.getAutoPay());
                virtualPayment.setIsRecurring(true);
                virtualPayment.setDueDate(recurringDueDate);
                virtualPayment.setPaidDate(null);
                monthlyPayments.add(virtualPayment);
            }
        }

        return monthlyPayments;
    }

    private String buildRecurringKey(String name, String category) {
        return category + "|" + name;
    }

    public List<PaymentResponse> getAllPayments(Long userId, PaymentStatus status) {
        List<Payment> payments;
        if (status != null) {
            payments = paymentRepository.findByUserIdAndStatus(userId, status);
        } else {
            payments = paymentRepository.findByUserId(userId);
        }
        return payments.stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPayment(Long userId, Long paymentId) {
        Payment payment = getPaymentAndVerifyOwner(userId, paymentId);
        return toPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse createPayment(Long userId, PaymentCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // status 파싱
        PaymentStatus status = PaymentStatus.UPCOMING;
        if (request.getStatus() != null) {
            try {
                status = PaymentStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                status = PaymentStatus.UPCOMING;
            }
        }

        Payment payment = Payment.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .amount(request.getAmount())
                .paymentDay(request.getPaymentDay() != null ? request.getPaymentDay() :
                           (request.getDueDate() != null ? request.getDueDate().getDayOfMonth() : null))
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .autoPay(request.getAutoPay() != null ? request.getAutoPay() : false)
                .dueDate(request.getDueDate())
                .status(status)
                .sourceType(request.getSourceType())
                .sourceId(request.getSourceId())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return toPaymentResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse updatePayment(Long userId, Long paymentId, PaymentCreateRequest request) {
        Payment payment = getPaymentAndVerifyOwner(userId, paymentId);

        payment.setName(request.getName());
        payment.setCategory(request.getCategory());
        payment.setAmount(request.getAmount());
        payment.setPaymentDay(request.getPaymentDay() != null ? request.getPaymentDay() :
                            (request.getDueDate() != null ? request.getDueDate().getDayOfMonth() : null));
        payment.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        payment.setAutoPay(request.getAutoPay() != null ? request.getAutoPay() : false);
        payment.setDueDate(request.getDueDate());

        Payment savedPayment = paymentRepository.save(payment);
        return toPaymentResponse(savedPayment);
    }

    @Transactional
    public PaymentResponse updatePaymentStatus(Long userId, Long paymentId, PaymentStatus status) {
        Payment payment = getPaymentAndVerifyOwner(userId, paymentId);
        payment.setStatus(status);

        // 납부 완료 시 납부일 기록
        if (status == PaymentStatus.PAID) {
            payment.setPaidDate(LocalDate.now());
        } else {
            payment.setPaidDate(null);
        }

        Payment savedPayment = paymentRepository.save(payment);
        return toPaymentResponse(savedPayment);
    }

    @Transactional
    public void deletePayment(Long userId, Long paymentId) {
        Payment payment = getPaymentAndVerifyOwner(userId, paymentId);
        paymentRepository.delete(payment);
    }

    private Payment getPaymentAndVerifyOwner(Long userId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (!payment.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return payment;
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
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setName(payment.getName());
        response.setCategory(payment.getCategory());
        response.setAmount(payment.getAmount());
        response.setPaymentDay(paymentDay);
        response.setStatus(payment.getStatus());
        response.setAutoPay(payment.getAutoPay());
        response.setIsRecurring(payment.getIsRecurring());
        response.setDueDate(payment.getDueDate());
        response.setPaidDate(payment.getPaidDate());
        response.setSourceType(payment.getSourceType());
        response.setSourceId(payment.getSourceId());
        return response;
    }

    private PaymentResponse toPaymentResponseWithComputedStatus(Payment payment, LocalDate today) {
        PaymentResponse response = toPaymentResponse(payment);
        if (response.getStatus() == PaymentStatus.UPCOMING &&
                response.getDueDate() != null &&
                response.getDueDate().isBefore(today)) {
            response.setStatus(PaymentStatus.OVERDUE);
        }
        return response;
    }

    @Transactional
    public void deletePaymentsBySource(Long userId, String sourceType, Long sourceId) {
        paymentRepository.deleteByUserIdAndSourceTypeAndSourceId(userId, sourceType, sourceId);
    }

    public List<PaymentResponse> getPaymentsBySource(Long userId, String sourceType, Long sourceId) {
        return paymentRepository.findByUserIdAndSourceTypeAndSourceId(userId, sourceType, sourceId)
                .stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }
}

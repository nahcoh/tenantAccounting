package com.starter.service;

import com.starter.domain.Loan;
import com.starter.domain.User;
import com.starter.dto.request.LoanCreateRequest;
import com.starter.dto.response.LoanResponse;
import com.starter.enums.RepaymentType;
import com.starter.repository.LoanRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LoanService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public List<LoanResponse> getAllLoans(Long userId) {
        List<Loan> loans = loanRepository.findByUserId(userId);
        return loans.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LoanResponse getLoan(Long userId, Long loanId) {
        Loan loan = getLoanAndVerifyOwner(userId, loanId);
        return toResponse(loan);
    }

    public Map<String, Object> getLoanSummary(Long userId) {
        List<Loan> loans = loanRepository.findByUserId(userId);

        // 총 대출 원금
        BigDecimal totalPrincipal = loans.stream()
                .map(Loan::getPrincipalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 총 잔여 원금
        BigDecimal totalRemaining = loans.stream()
                .map(l -> l.getRemainingAmount() != null ? l.getRemainingAmount() : l.getPrincipalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 월 총 상환액
        BigDecimal totalMonthlyPayment = loans.stream()
                .map(l -> l.getMonthlyPayment() != null ? l.getMonthlyPayment() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 월 총 이자
        BigDecimal totalMonthlyInterest = loans.stream()
                .map(this::calculateMonthlyInterest)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 유형별 대출 금액
        Map<String, BigDecimal> byType = new HashMap<>();
        for (Loan loan : loans) {
            BigDecimal amount = loan.getRemainingAmount() != null ? loan.getRemainingAmount() : loan.getPrincipalAmount();
            byType.merge(loan.getType().name(), amount, BigDecimal::add);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPrincipal", totalPrincipal);
        summary.put("totalRemaining", totalRemaining);
        summary.put("totalMonthlyPayment", totalMonthlyPayment);
        summary.put("totalMonthlyInterest", totalMonthlyInterest);
        summary.put("byType", byType);
        summary.put("loanCount", loans.size());
        summary.put("loans", loans.stream().map(this::toResponse).collect(Collectors.toList()));

        return summary;
    }

    @Transactional
    public LoanResponse createLoan(Long userId, LoanCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Loan loan = Loan.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .principalAmount(request.getPrincipalAmount())
                .remainingAmount(request.getRemainingAmount() != null ? request.getRemainingAmount() : request.getPrincipalAmount())
                .interestRate(request.getInterestRate())
                .repaymentType(request.getRepaymentType())
                .monthlyPayment(request.getMonthlyPayment())
                .bankName(request.getBankName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .paymentDay(request.getPaymentDay())
                .memo(request.getMemo())
                .build();

        Loan saved = loanRepository.save(loan);
        return toResponse(saved);
    }

    @Transactional
    public LoanResponse updateLoan(Long userId, Long loanId, LoanCreateRequest request) {
        Loan loan = getLoanAndVerifyOwner(userId, loanId);

        loan.setName(request.getName());
        loan.setType(request.getType());
        loan.setPrincipalAmount(request.getPrincipalAmount());
        loan.setRemainingAmount(request.getRemainingAmount() != null ? request.getRemainingAmount() : request.getPrincipalAmount());
        loan.setInterestRate(request.getInterestRate());
        loan.setRepaymentType(request.getRepaymentType());
        loan.setMonthlyPayment(request.getMonthlyPayment());
        loan.setBankName(request.getBankName());
        loan.setStartDate(request.getStartDate());
        loan.setEndDate(request.getEndDate());
        loan.setPaymentDay(request.getPaymentDay());
        loan.setMemo(request.getMemo());

        Loan saved = loanRepository.save(loan);
        return toResponse(saved);
    }

    @Transactional
    public void deleteLoan(Long userId, Long loanId) {
        Loan loan = getLoanAndVerifyOwner(userId, loanId);
        loanRepository.delete(loan);
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                .getId();
    }

    private Loan getLoanAndVerifyOwner(Long userId, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Loan not found"));

        if (!loan.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return loan;
    }

    private BigDecimal calculateMonthlyInterest(Loan loan) {
        BigDecimal principal = loan.getRemainingAmount() != null ? loan.getRemainingAmount() : loan.getPrincipalAmount();
        if (principal == null || loan.getInterestRate() == null) {
            return BigDecimal.ZERO;
        }
        // 월 이자 = 원금 * 연이율 / 12 / 100
        return principal.multiply(loan.getInterestRate())
                .divide(BigDecimal.valueOf(1200), 0, RoundingMode.HALF_UP);
    }

    private Integer calculateRemainingMonths(Loan loan) {
        if (loan.getEndDate() == null) {
            return null;
        }
        LocalDate now = LocalDate.now();
        if (loan.getEndDate().isBefore(now)) {
            return 0;
        }
        return (int) ChronoUnit.MONTHS.between(now, loan.getEndDate());
    }

    private BigDecimal calculateTotalInterest(Loan loan) {
        Integer remainingMonths = calculateRemainingMonths(loan);
        if (remainingMonths == null || remainingMonths <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal monthlyInterest = calculateMonthlyInterest(loan);
        return monthlyInterest.multiply(BigDecimal.valueOf(remainingMonths));
    }

    private LoanResponse toResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .name(loan.getName())
                .type(loan.getType())
                .principalAmount(loan.getPrincipalAmount())
                .remainingAmount(loan.getRemainingAmount())
                .interestRate(loan.getInterestRate())
                .repaymentType(loan.getRepaymentType())
                .monthlyPayment(loan.getMonthlyPayment())
                .bankName(loan.getBankName())
                .startDate(loan.getStartDate())
                .endDate(loan.getEndDate())
                .paymentDay(loan.getPaymentDay())
                .memo(loan.getMemo())
                .monthlyInterest(calculateMonthlyInterest(loan))
                .totalInterest(calculateTotalInterest(loan))
                .remainingMonths(calculateRemainingMonths(loan))
                .build();
    }
}

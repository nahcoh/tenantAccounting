package com.starter.dto.response;

import com.starter.enums.LoanType;
import com.starter.enums.RepaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponse {
    private Long id;
    private String name;
    private LoanType type;
    private BigDecimal principalAmount;
    private BigDecimal remainingAmount;
    private BigDecimal interestRate;
    private RepaymentType repaymentType;
    private BigDecimal monthlyPayment;
    private String bankName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer paymentDay;
    private String memo;

    // 계산 필드
    private BigDecimal monthlyInterest;    // 월 이자
    private BigDecimal totalInterest;      // 총 이자 (잔여 기간)
    private Integer remainingMonths;       // 남은 개월 수
}

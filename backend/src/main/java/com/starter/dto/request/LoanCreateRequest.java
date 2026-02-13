package com.starter.dto.request;

import com.starter.enums.LoanType;
import com.starter.enums.RepaymentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanCreateRequest {
    @NotBlank(message = "대출명은 필수입니다")
    private String name;

    @NotNull(message = "대출 유형은 필수입니다")
    private LoanType type;

    @NotNull(message = "대출 원금은 필수입니다")
    @Min(value = 0, message = "대출 원금은 0 이상이어야 합니다")
    private BigDecimal principalAmount;

    private BigDecimal remainingAmount;

    @NotNull(message = "이자율은 필수입니다")
    private BigDecimal interestRate;

    @NotNull(message = "상환 방식은 필수입니다")
    private RepaymentType repaymentType;

    private BigDecimal monthlyPayment;
    private String bankName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer paymentDay;
    private String memo;
}

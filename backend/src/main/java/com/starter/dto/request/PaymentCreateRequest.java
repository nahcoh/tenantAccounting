package com.starter.dto.request;

import com.starter.enums.PaymentCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {
    @NotBlank(message = "Payment name cannot be blank")
    @Size(max = 100, message = "Payment name cannot exceed 100 characters")
    private String name;

    @NotNull(message = "Payment category cannot be null")
    private PaymentCategory category;

    @NotNull(message = "Amount cannot be null")
    @Min(value = 0, message = "Amount must be a positive value")
    private BigDecimal amount;

    private Integer paymentDay; // 1-28

    private Boolean isRecurring = false;
    private Boolean autoPay = false;

    // 정기 납부가 아닌 경우 필수, 정기 납부인 경우 선택
    private LocalDate dueDate;

    private String status; // UPCOMING, PAID, OVERDUE

    // 원본 데이터 추적용
    private String sourceType; // LOAN, CONTRACT, UTILITY
    private Long sourceId;
}

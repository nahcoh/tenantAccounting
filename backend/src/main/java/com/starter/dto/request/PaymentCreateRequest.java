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

    @NotNull(message = "Due date cannot be null")
    private LocalDate dueDate;
}

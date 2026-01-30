package com.starter.dto.request;

import com.starter.enums.DepositSourceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositSourceCreateRequest {
    @NotNull(message = "Deposit source type cannot be null")
    private DepositSourceType type;

    @NotNull(message = "Amount cannot be null")
    private BigDecimal amount;

    @Size(max = 100, message = "Bank name cannot exceed 100 characters")
    private String bankName;

    private BigDecimal interestRate;
}

package com.starter.dto.response;

import com.starter.enums.DepositSourceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositSourceResponse {
    private Long id;
    private DepositSourceType type;
    private BigDecimal amount;
    private String bankName;
    private BigDecimal interestRate;
    private String label; // This is from the example JSON, needs to be derived
}

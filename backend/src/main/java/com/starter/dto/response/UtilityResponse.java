package com.starter.dto.response;

import com.starter.enums.UtilityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityResponse {
    private Long id;
    private UtilityType type;
    private String yearMonth;
    private BigDecimal amount;
    private BigDecimal usageAmount;
    private String unit;
    private String provider;
    private Boolean isSynced;
    private LocalDate paidDate;
}

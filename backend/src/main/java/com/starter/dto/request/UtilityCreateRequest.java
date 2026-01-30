package com.starter.dto.request;

import com.starter.enums.UtilityType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityCreateRequest {
    @NotNull(message = "Utility type cannot be null")
    private UtilityType type;

    @NotBlank(message = "Year and month cannot be blank")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "YearMonth must be in YYYY-MM format")
    private String yearMonth; // "YYYY-MM"

    @NotNull(message = "Amount cannot be null")
    @Min(value = 0, message = "Amount must be a positive value")
    private BigDecimal amount;

    private BigDecimal usageAmount;
    private String unit;
    private String provider;
    private Boolean isSynced = false;
    private LocalDate paidDate;
}

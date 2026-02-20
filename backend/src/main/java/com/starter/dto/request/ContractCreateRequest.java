package com.starter.dto.request;

import com.starter.enums.ContractType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractCreateRequest {
    @NotNull(message = "Contract type cannot be null")
    private ContractType type;

    @NotBlank(message = "Address cannot be blank")
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    private BigDecimal jeonseDeposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    @Min(value = 1, message = "Monthly payment day must be between 1 and 31")
    @Max(value = 31, message = "Monthly payment day must be between 1 and 31")
    private Integer monthlyPaymentDay;

    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;

    @NotNull(message = "End date cannot be null")
    private LocalDate endDate;

    private List<DepositSourceCreateRequest> depositSources;
}

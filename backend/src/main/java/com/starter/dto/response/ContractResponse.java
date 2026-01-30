package com.starter.dto.response;

import com.starter.enums.ContractType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private ContractType type;
    private String address;
    private BigDecimal jeonseDeposit;
    private BigDecimal monthlyRent;
    private BigDecimal maintenanceFee;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private List<DepositSourceResponse> depositSources;
    private MaintenanceFeeDetailResponse maintenanceFeeDetail;
}

package com.starter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceFeeDetailResponse {
    private BigDecimal base;
    private List<String> includesItems;
    private List<String> excludesItems;
}

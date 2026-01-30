package com.starter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCalendarResponse {
    private Integer year;
    private Integer month;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal upcomingAmount;
    private List<PaymentResponse> payments;
}

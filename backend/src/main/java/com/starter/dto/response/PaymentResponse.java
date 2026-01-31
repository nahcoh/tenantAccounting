package com.starter.dto.response;

import com.starter.enums.PaymentCategory;
import com.starter.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private String name;
    private PaymentCategory category;
    private BigDecimal amount;
    private Integer paymentDay;
    private PaymentStatus status;
    private Boolean autoPay;
    private LocalDate dueDate;
    private LocalDate paidDate;
}

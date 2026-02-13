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
    private Boolean isRecurring;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String sourceType;
    private Long sourceId;

    // 기존 생성자와의 호환을 위한 생성자
    public PaymentResponse(Long id, String name, PaymentCategory category, BigDecimal amount,
                           Integer paymentDay, PaymentStatus status, Boolean autoPay,
                           LocalDate dueDate, LocalDate paidDate) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.paymentDay = paymentDay;
        this.status = status;
        this.autoPay = autoPay;
        this.isRecurring = false;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
    }
}

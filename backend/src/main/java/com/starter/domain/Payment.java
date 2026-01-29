package com.starter.domain;

import com.starter.enums.PaymentCategory;
import com.starter.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentCategory category;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;

    @Column(name = "payment_day")
    private Integer paymentDay;

    @Column(name = "is_recurring", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isRecurring;

    @Column(name = "auto_pay", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean autoPay;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'UPCOMING'")
    private PaymentStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

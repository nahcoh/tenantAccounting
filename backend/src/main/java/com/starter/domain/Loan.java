package com.starter.domain;

import com.starter.enums.LoanType;
import com.starter.enums.RepaymentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {
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
    private LoanType type;

    @Column(name = "principal_amount", nullable = false, precision = 15, scale = 0)
    private BigDecimal principalAmount; // 대출 원금

    @Column(name = "remaining_amount", precision = 15, scale = 0)
    private BigDecimal remainingAmount; // 잔여 원금

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate; // 연이율 (%)

    @Enumerated(EnumType.STRING)
    @Column(name = "repayment_type", nullable = false)
    private RepaymentType repaymentType;

    @Column(name = "monthly_payment", precision = 15, scale = 0)
    private BigDecimal monthlyPayment; // 월 상환액

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "payment_day")
    private Integer paymentDay; // 상환일 (매월 n일)

    @Column(length = 500)
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

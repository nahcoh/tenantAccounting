package com.starter.domain;

import com.starter.enums.ContractType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractType type;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "jeonse_deposit", precision = 15, scale = 0)
    private BigDecimal jeonseDeposit;

    @Column(name = "monthly_rent", precision = 10, scale = 0)
    private BigDecimal monthlyRent;

    @Column(name = "maintenance_fee", precision = 10, scale = 0)
    private BigDecimal maintenanceFee;

    @Column(name = "monthly_payment_day")
    private Integer monthlyPaymentDay;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

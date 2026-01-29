package com.starter.domain;

import com.starter.enums.DepositSourceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "deposit_sources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepositSourceType type;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal amount;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;
}

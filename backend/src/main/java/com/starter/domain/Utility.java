package com.starter.domain;

import com.starter.enums.UtilityType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "utilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UtilityType type;

    @Column(name = "`year_month`", nullable = false, length = 7)
    private String yearMonth; // "YYYY-MM"

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;

    @Column(name = "usage_amount", precision = 10, scale = 2)
    private BigDecimal usageAmount;

    @Column(length = 20)
    private String unit; // kWh, m³

    @Column(length = 100)
    private String provider;

    @Column(name = "is_synced", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isSynced;

    @Column(name = "paid_date")
    private LocalDate paidDate;
}

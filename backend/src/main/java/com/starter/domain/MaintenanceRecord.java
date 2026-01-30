package com.starter.domain;

import com.starter.enums.MaintenanceCategory;
import com.starter.enums.MaintenanceStatus;
import com.starter.enums.PaidBy;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 0)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(name = "paid_by")
    private PaidBy paidBy;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'RECORDED'")
    private MaintenanceStatus status;

    @Column(name = "recorded_at", nullable = false)
    private LocalDate recordedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

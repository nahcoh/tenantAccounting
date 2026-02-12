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
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.REQUESTED;

    @Column(precision = 10, scale = 0)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(name = "paid_by")
    private PaidBy paidBy;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

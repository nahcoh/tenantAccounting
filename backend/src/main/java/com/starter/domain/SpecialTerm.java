package com.starter.domain;

import com.starter.enums.SpecialTermCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "special_terms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialTerm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpecialTermCategory category;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_confirmed", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isConfirmed = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

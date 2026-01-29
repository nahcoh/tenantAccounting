package com.starter.domain;

import com.starter.enums.MaintenanceFileType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private MaintenanceRecord maintenanceRecord;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false)
    private MaintenanceFileType fileType;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}

package com.starter.dto.response;

import com.starter.enums.MaintenanceCategory;
import com.starter.enums.MaintenanceStatus;
import com.starter.enums.PaidBy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponse {
    private Long id;
    private Long contractId;
    private String title;
    private MaintenanceCategory category;
    private String description;
    private MaintenanceStatus status;
    private BigDecimal cost;
    private PaidBy paidBy;
    private String filePath;
    private String fileName;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}

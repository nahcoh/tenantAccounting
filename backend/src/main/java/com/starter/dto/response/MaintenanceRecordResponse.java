package com.starter.dto.response;

import com.starter.enums.MaintenanceCategory;
import com.starter.enums.MaintenanceStatus;
import com.starter.enums.PaidBy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordResponse {
    private Long id;
    private String title;
    private MaintenanceCategory category;
    private String description;
    private BigDecimal cost;
    private PaidBy paidBy;
    private MaintenanceStatus status;
    private LocalDate recordedAt;
    private LocalDateTime createdAt;
    private List<MaintenanceFileResponse> photos; // Renamed from files to photos as per example json
    private List<MaintenanceFileResponse> receipts; // Renamed from files to receipts as per example json
}

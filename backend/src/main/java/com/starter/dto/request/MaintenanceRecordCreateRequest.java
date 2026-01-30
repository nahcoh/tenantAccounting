package com.starter.dto.request;

import com.starter.enums.MaintenanceCategory;
import com.starter.enums.PaidBy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRecordCreateRequest {
    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotNull(message = "Category cannot be null")
    private MaintenanceCategory category;

    private String description;
    private BigDecimal cost;
    private PaidBy paidBy;

    @NotNull(message = "Recorded date cannot be null")
    private LocalDate recordedAt;
}

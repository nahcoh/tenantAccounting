package com.starter.dto.response;

import com.starter.enums.ChecklistCategory;
import com.starter.enums.ContractPhase;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistResponse {
    private Long id;
    private Long contractId;
    private ContractPhase phase;
    private ChecklistCategory category;
    private String title;
    private String description;
    private Boolean isRequired;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private String filePath;
    private String fileName;
    private LocalDateTime createdAt;
}
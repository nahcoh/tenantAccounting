package com.starter.dto.response;

import com.starter.enums.ContractPhase;
import com.starter.enums.DocumentCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String name;
    private DocumentCategory category;
    private ContractPhase phase;
    private String filePath;
    private String fileName;
    private Boolean isRequired;
    private LocalDateTime uploadedAt;
}

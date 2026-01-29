package com.starter.dto.response;

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
    private String filePath;
    private Boolean isRequired;
    private LocalDateTime uploadedAt;
}

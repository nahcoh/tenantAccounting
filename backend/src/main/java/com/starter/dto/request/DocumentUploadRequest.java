package com.starter.dto.request;

import com.starter.enums.DocumentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadRequest {
    @NotBlank(message = "Document name cannot be blank")
    @Size(max = 200, message = "Document name cannot exceed 200 characters")
    private String name;

    @NotNull(message = "Document category cannot be null")
    private DocumentCategory category;

    private Boolean isRequired = false;
}

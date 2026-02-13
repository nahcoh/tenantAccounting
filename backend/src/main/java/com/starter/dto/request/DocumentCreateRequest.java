package com.starter.dto.request;

import com.starter.enums.ContractPhase;
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
public class DocumentCreateRequest {
    @NotBlank(message = "Name cannot be blank")
    @Size(max = 200, message = "Name cannot exceed 200 characters")
    private String name;

    @NotNull(message = "Category cannot be null")
    private DocumentCategory category;

    private ContractPhase phase;

    @Size(max = 500, message = "File path cannot exceed 500 characters")
    private String filePath;

    private Boolean isRequired = false;
}

package com.starter.dto.request;

import com.starter.enums.ChecklistCategory;
import com.starter.enums.ContractPhase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistCreateRequest {
    @NotNull(message = "Phase cannot be null")
    private ContractPhase phase;

    @NotNull(message = "Category cannot be null")
    private ChecklistCategory category;

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    private String description;

    private Boolean isRequired = false;
}
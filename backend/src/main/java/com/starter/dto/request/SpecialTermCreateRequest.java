package com.starter.dto.request;

import com.starter.enums.ContractPhase;
import com.starter.enums.SpecialTermCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialTermCreateRequest {
    @NotNull(message = "Category cannot be null")
    private SpecialTermCategory category;

    private ContractPhase phase;

    @NotBlank(message = "Content cannot be blank")
    private String content;
}

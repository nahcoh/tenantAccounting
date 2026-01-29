package com.starter.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Item 생성/수정 요청")
public class ItemRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(max = 100, message = "이름은 100자 이하여야 합니다")
    @Schema(description = "아이템 이름", example = "Sample Item", required = true)
    private String name;

    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    @Schema(description = "아이템 설명", example = "This is a sample item description")
    private String description;
}

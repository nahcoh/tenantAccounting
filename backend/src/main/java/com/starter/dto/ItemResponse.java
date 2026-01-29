package com.starter.dto;

import com.starter.domain.Item;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Item 응답")
public class ItemResponse {

    @Schema(description = "아이템 ID", example = "1")
    private Long id;

    @Schema(description = "아이템 이름", example = "Sample Item")
    private String name;

    @Schema(description = "아이템 설명", example = "This is a sample item description")
    private String description;

    @Schema(description = "생성 시각", example = "2025-10-19T10:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "수정 시각", example = "2025-10-19T10:30:00")
    private LocalDateTime updatedAt;

    public static ItemResponse from(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}

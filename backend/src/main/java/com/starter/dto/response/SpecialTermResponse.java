package com.starter.dto.response;

import com.starter.enums.SpecialTermCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialTermResponse {
    private Long id;
    private Long contractId;
    private SpecialTermCategory category;
    private String content;
    private Boolean isConfirmed;
    private LocalDateTime createdAt;
}

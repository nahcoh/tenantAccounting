package com.starter.dto;

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
@Schema(description = "Health Check 응답")
public class HealthCheckResponse {

    @Schema(description = "서버 상태", example = "UP")
    private String status;

    @Schema(description = "상태 메시지", example = "백엔드 서버가 정상적으로 실행 중입니다.")
    private String message;

    @Schema(description = "응답 시각", example = "2025-10-18T10:30:00")
    private LocalDateTime timestamp;

    @Schema(description = "서버 버전", example = "1.0.0-SNAPSHOT")
    private String version;
}

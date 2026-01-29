package com.starter.controller;

import com.starter.dto.HealthCheckResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Tag(name = "Health Check", description = "서버 상태 확인 API")
@RestController
@RequestMapping("/api/v1")
public class HealthCheckController {

    @Operation(summary = "Health Check", description = "서버 상태를 확인합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "서버가 정상적으로 실행 중입니다",
            content = @Content(schema = @Schema(implementation = HealthCheckResponse.class))
        )
    })
    @GetMapping("/health")
    public ResponseEntity<HealthCheckResponse> healthCheck() {
        HealthCheckResponse response = HealthCheckResponse.builder()
                .status("UP")
                .message("백엔드 서버가 정상적으로 실행 중입니다.")
                .timestamp(LocalDateTime.now())
                .version("1.0.0-SNAPSHOT")
                .build();

        return ResponseEntity.ok(response);
    }
}

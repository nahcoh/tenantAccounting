package com.starter.dto.response;

import com.starter.enums.MaintenanceFileType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceFileResponse {
    private Long id;
    private MaintenanceFileType fileType;
    private String filePath;
    private LocalDateTime uploadedAt;
}

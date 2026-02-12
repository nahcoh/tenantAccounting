package com.starter.controller;

import com.starter.dto.request.MaintenanceCreateRequest;
import com.starter.dto.response.MaintenanceResponse;
import com.starter.enums.MaintenanceStatus;
import com.starter.security.UserPrincipal;
import com.starter.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping("/api/contracts/{contractId}/maintenances")
    public ResponseEntity<List<MaintenanceResponse>> getMaintenancesByContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @RequestParam(required = false) MaintenanceStatus status) {
        if (status != null) {
            return ResponseEntity.ok(maintenanceService.getMaintenancesByContractAndStatus(principal.getId(), contractId, status));
        }
        return ResponseEntity.ok(maintenanceService.getMaintenancesByContract(principal.getId(), contractId));
    }

    @PostMapping("/api/contracts/{contractId}/maintenances")
    public ResponseEntity<MaintenanceResponse> createMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @Valid @RequestBody MaintenanceCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceService.createMaintenance(principal.getId(), contractId, request));
    }

    @PutMapping("/api/maintenances/{id}")
    public ResponseEntity<MaintenanceResponse> updateMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceCreateRequest request) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(principal.getId(), id, request));
    }

    @PatchMapping("/api/maintenances/{id}/status")
    public ResponseEntity<MaintenanceResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {
        return ResponseEntity.ok(maintenanceService.updateStatus(principal.getId(), id, status));
    }

    @DeleteMapping("/api/maintenances/{id}")
    public ResponseEntity<Void> deleteMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        maintenanceService.deleteMaintenance(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/maintenances/{id}/upload")
    public ResponseEntity<MaintenanceResponse> uploadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(maintenanceService.uploadFile(principal.getId(), id, file));
    }

    @GetMapping("/api/maintenances/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = maintenanceService.downloadFile(principal.getId(), id);
        String encodedName = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @GetMapping("/api/maintenances/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = maintenanceService.downloadFile(principal.getId(), id);
        String fileName = resource.getFilename() != null ? resource.getFilename().toLowerCase() : "";
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;
        else if (fileName.endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (fileName.endsWith(".pdf")) mediaType = MediaType.APPLICATION_PDF;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @DeleteMapping("/api/maintenances/{id}/file")
    public ResponseEntity<MaintenanceResponse> deleteFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.deleteFile(principal.getId(), id));
    }
}

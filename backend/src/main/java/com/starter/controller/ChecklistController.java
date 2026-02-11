package com.starter.controller;

import com.starter.dto.request.ChecklistCreateRequest;
import com.starter.dto.response.ChecklistResponse;
import com.starter.enums.ContractPhase;
import com.starter.security.UserPrincipal;
import com.starter.service.ChecklistService;
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
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping("/api/contracts/{contractId}/checklists")
    public ResponseEntity<List<ChecklistResponse>> getChecklistsByContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @RequestParam(required = false) ContractPhase phase) {
        if (phase != null) {
            return ResponseEntity.ok(checklistService.getChecklistsByContractAndPhase(principal.getId(), contractId, phase));
        }
        return ResponseEntity.ok(checklistService.getChecklistsByContract(principal.getId(), contractId));
    }

    @PostMapping("/api/contracts/{contractId}/checklists")
    public ResponseEntity<ChecklistResponse> createChecklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @Valid @RequestBody ChecklistCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(checklistService.createChecklist(principal.getId(), contractId, request));
    }

    @PutMapping("/api/checklists/{id}")
    public ResponseEntity<ChecklistResponse> updateChecklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ChecklistCreateRequest request) {
        return ResponseEntity.ok(checklistService.updateChecklist(principal.getId(), id, request));
    }

    @PatchMapping("/api/checklists/{id}/complete")
    public ResponseEntity<ChecklistResponse> toggleComplete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(checklistService.toggleComplete(principal.getId(), id));
    }

    @DeleteMapping("/api/checklists/{id}")
    public ResponseEntity<Void> deleteChecklist(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        checklistService.deleteChecklist(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/contracts/{contractId}/checklists/initialize")
    public ResponseEntity<List<ChecklistResponse>> initializeChecklists(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(checklistService.initializeDefaultChecklistsForExisting(principal.getId(), contractId));
    }

    @PostMapping("/api/checklists/{id}/upload")
    public ResponseEntity<ChecklistResponse> uploadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(checklistService.uploadFile(principal.getId(), id, file));
    }

    @GetMapping("/api/checklists/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = checklistService.downloadFile(principal.getId(), id);
        String encodedName = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @GetMapping("/api/checklists/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = checklistService.downloadFile(principal.getId(), id);
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

    @DeleteMapping("/api/checklists/{id}/file")
    public ResponseEntity<ChecklistResponse> deleteFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(checklistService.deleteFile(principal.getId(), id));
    }
}

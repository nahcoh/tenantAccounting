package com.starter.controller;

import com.starter.dto.request.DocumentCreateRequest;
import com.starter.dto.response.DocumentResponse;
import com.starter.security.UserPrincipal;
import com.starter.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.hibernate.ResourceClosedException;
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
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping("/api/contracts/{contractId}/documents")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId) {
        return ResponseEntity.ok(documentService.getDocumentsByContract(principal.getId(), contractId));
    }

    @PostMapping("/api/contracts/{contractId}/documents")
    public ResponseEntity<DocumentResponse> createDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @Valid @RequestBody DocumentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.createDocument(principal.getId(), contractId, request));
    }

    @PutMapping("/api/documents/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody DocumentCreateRequest request) {
        return ResponseEntity.ok(documentService.updateDocument(principal.getId(), id, request));
    }

    @DeleteMapping("/api/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        documentService.deleteDocument(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/documents/{id}/upload")
    public ResponseEntity<DocumentResponse> uploadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.uploadFile(principal.getId(), id, file));
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = documentService.downloadFile(principal.getId(), id);
        String encodedName = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    @GetMapping("/api/documents/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Resource resource = documentService.downloadFile(principal.getId(), id);
        String fileName = resource.getFilename() != null ? resource.getFilename().toLowerCase() : "";
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;
        else if (fileName.endsWith(".png")) mediaType = MediaType.IMAGE_PNG;
        else if (fileName.endsWith(".gif")) mediaType = MediaType.IMAGE_GIF;
        else if (fileName.endsWith(".pdf")) mediaType = MediaType.APPLICATION_PDF;
        else if (fileName.endsWith(".webp")) mediaType = MediaType.valueOf("image/webp");
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

}

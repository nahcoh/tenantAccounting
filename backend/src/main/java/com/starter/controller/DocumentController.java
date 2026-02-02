package com.starter.controller;

import com.starter.dto.request.DocumentCreateRequest;
import com.starter.dto.response.DocumentResponse;
import com.starter.security.UserPrincipal;
import com.starter.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}

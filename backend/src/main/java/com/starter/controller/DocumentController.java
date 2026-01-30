package com.starter.controller;

import com.starter.dto.request.DocumentUploadRequest;
import com.starter.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    // Assuming we get the user ID from the security context later
    private static final Long MOCK_USER_ID = 1L;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestPart("request") @Valid DocumentUploadRequest request) {
        // File upload logic to be implemented in the service
        return ResponseEntity.status(HttpStatus.CREATED).body("File uploaded successfully");
    }
}

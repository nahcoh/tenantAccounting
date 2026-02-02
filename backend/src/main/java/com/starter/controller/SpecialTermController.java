package com.starter.controller;

import com.starter.dto.request.SpecialTermCreateRequest;
import com.starter.dto.response.SpecialTermResponse;
import com.starter.security.UserPrincipal;
import com.starter.service.SpecialTermService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpecialTermController {

    private final SpecialTermService specialTermService;

    @GetMapping("/api/contracts/{contractId}/special-terms")
    public ResponseEntity<List<SpecialTermResponse>> getSpecialTerms(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId) {
        return ResponseEntity.ok(specialTermService.getSpecialTermsByContract(principal.getId(), contractId));
    }

    @PostMapping("/api/contracts/{contractId}/special-terms")
    public ResponseEntity<SpecialTermResponse> createSpecialTerm(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long contractId,
            @Valid @RequestBody SpecialTermCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(specialTermService.createSpecialTerm(principal.getId(), contractId, request));
    }

    @PutMapping("/api/special-terms/{id}")
    public ResponseEntity<SpecialTermResponse> updateSpecialTerm(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SpecialTermCreateRequest request) {
        return ResponseEntity.ok(specialTermService.updateSpecialTerm(principal.getId(), id, request));
    }

    @DeleteMapping("/api/special-terms/{id}")
    public ResponseEntity<Void> deleteSpecialTerm(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        specialTermService.deleteSpecialTerm(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/special-terms/{id}/confirm")
    public ResponseEntity<SpecialTermResponse> toggleConfirm(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(specialTermService.toggleConfirm(principal.getId(), id));
    }
}

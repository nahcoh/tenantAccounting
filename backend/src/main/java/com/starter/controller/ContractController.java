package com.starter.controller;

import com.starter.dto.request.ContractCreateRequest;
import com.starter.dto.response.ContractResponse;
import com.starter.security.UserPrincipal;
import com.starter.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping
    public ResponseEntity<ContractResponse> createContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ContractCreateRequest request) {
        ContractResponse response = contractService.createContract(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ContractResponse>> getMyContracts(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(contractService.getContractsByUserId(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContract(principal.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractResponse> updateContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ContractCreateRequest request) {
        return ResponseEntity.ok(contractService.updateContract(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContract(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        contractService.deleteContract(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

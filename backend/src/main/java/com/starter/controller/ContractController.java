package com.starter.controller;

import com.starter.dto.request.ContractCreateRequest;
import com.starter.dto.response.ContractResponse;
import com.starter.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // Assuming we get the user ID from the security context later
    private static final Long MOCK_USER_ID = 1L;

    @PostMapping
    public ResponseEntity<ContractResponse> createContract(@Valid @RequestBody ContractCreateRequest request) {
        ContractResponse response = contractService.createContract(MOCK_USER_ID, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

package com.starter.controller;

import com.starter.dto.request.LoanCreateRequest;
import com.starter.dto.response.LoanResponse;
import com.starter.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping
    public ResponseEntity<List<LoanResponse>> getAllLoans(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        List<LoanResponse> loans = loanService.getAllLoans(userId);
        return ResponseEntity.ok(loans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        LoanResponse loan = loanService.getLoan(userId, id);
        return ResponseEntity.ok(loan);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getLoanSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        Map<String, Object> summary = loanService.getLoanSummary(userId);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LoanCreateRequest request) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        LoanResponse loan = loanService.createLoan(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(loan);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanResponse> updateLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody LoanCreateRequest request) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        LoanResponse loan = loanService.updateLoan(userId, id, request);
        return ResponseEntity.ok(loan);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = loanService.getUserIdByEmail(userDetails.getUsername());
        loanService.deleteLoan(userId, id);
        return ResponseEntity.noContent().build();
    }
}

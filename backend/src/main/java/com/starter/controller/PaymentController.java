package com.starter.controller;

import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.dto.response.PaymentOverviewResponse;
import com.starter.dto.response.PaymentResponse;
import com.starter.enums.PaymentStatus;
import com.starter.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/calendar/{year}/{month}")
    public ResponseEntity<PaymentCalendarResponse> getMonthlyPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable int year,
            @PathVariable int month) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentCalendarResponse response = paymentService.getMonthlyPayments(userId, year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview/{year}/{month}")
    public ResponseEntity<PaymentOverviewResponse> getOverview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable int year,
            @PathVariable int month) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentOverviewResponse response = paymentService.getOverview(userId, year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) PaymentStatus status) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        List<PaymentResponse> payments = paymentService.getAllPayments(userId, status);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentResponse response = paymentService.getPayment(userId, id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentCreateRequest request) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentResponse response = paymentService.createPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponse> updatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody PaymentCreateRequest request) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentResponse response = paymentService.updatePayment(userId, id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updatePaymentStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        PaymentResponse response = paymentService.updatePaymentStatus(userId, id, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        paymentService.deletePayment(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recurring")
    public ResponseEntity<Long> createRecurringPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentCreateRequest request) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        Long paymentId = paymentService.createRecurringPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentId);
    }

    @DeleteMapping("/source/{sourceType}/{sourceId}")
    public ResponseEntity<Void> deletePaymentsBySource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String sourceType,
            @PathVariable Long sourceId) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        paymentService.deletePaymentsBySource(userId, sourceType, sourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/source/{sourceType}/{sourceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsBySource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String sourceType,
            @PathVariable Long sourceId) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        List<PaymentResponse> payments = paymentService.getPaymentsBySource(userId, sourceType, sourceId);
        return ResponseEntity.ok(payments);
    }
}

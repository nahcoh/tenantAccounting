package com.starter.controller;

import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/recurring")
    public ResponseEntity<Long> createRecurringPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentCreateRequest request) {
        Long userId = paymentService.getUserIdByEmail(userDetails.getUsername());
        Long paymentId = paymentService.createRecurringPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentId);
    }
}

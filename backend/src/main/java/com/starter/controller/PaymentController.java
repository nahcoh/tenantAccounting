package com.starter.controller;

import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Assuming we get the user ID from the security context later
    private static final Long MOCK_USER_ID = 1L;

    @GetMapping("/calendar/{year}/{month}")
    public ResponseEntity<PaymentCalendarResponse> getMonthlyPayments(
            @PathVariable int year,
            @PathVariable int month) {
        PaymentCalendarResponse response = paymentService.getMonthlyPayments(MOCK_USER_ID, year, month);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/recurring")
    public ResponseEntity<Long> createRecurringPayment(@Valid @RequestBody PaymentCreateRequest request) {
        Long paymentId = paymentService.createRecurringPayment(MOCK_USER_ID, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentId);
    }
}

package com.starter.service;

import com.starter.dto.request.PaymentCreateRequest;
import com.starter.dto.response.PaymentCalendarResponse;
import com.starter.repository.PaymentRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentCalendarResponse getMonthlyPayments(Long userId, int year, int month) {
        //  Implementation needed
        return new PaymentCalendarResponse();
    }

    @Transactional
    public Long createRecurringPayment(Long userId, PaymentCreateRequest request) {
        // Implementation needed
        return 1L;
    }
}

package com.starter.controller;

import com.starter.dto.request.InquiryReplyRequest;
import com.starter.dto.response.InquiryResponse;
import com.starter.enums.InquiryStatus;
import com.starter.enums.InquiryType;
import com.starter.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public ResponseEntity<List<InquiryResponse>> getAllInquiries(
            @RequestParam(required = false) InquiryStatus status,
            @RequestParam(required = false) InquiryType type
    ) {
        return ResponseEntity.ok(inquiryService.getAllInquiries(status, type));
    }

    @PatchMapping("/{id}/reply")
    public ResponseEntity<InquiryResponse> replyInquiry(
            @PathVariable Long id,
            @Valid @RequestBody InquiryReplyRequest request
    ) {
        return ResponseEntity.ok(inquiryService.replyInquiry(id, request));
    }
}

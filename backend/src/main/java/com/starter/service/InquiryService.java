package com.starter.service;

import com.starter.domain.Inquiry;
import com.starter.domain.User;
import com.starter.dto.request.InquiryCreateRequest;
import com.starter.dto.request.InquiryReplyRequest;
import com.starter.dto.response.InquiryResponse;
import com.starter.enums.InquiryStatus;
import com.starter.enums.InquiryType;
import com.starter.repository.InquiryRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    @Transactional
    public InquiryResponse createInquiry(Long userId, InquiryCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .type(request.getType())
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .isPrivate(request.getIsPrivate() == null ? true : request.getIsPrivate())
                .status(InquiryStatus.OPEN)
                .build();

        return toResponse(inquiryRepository.save(inquiry));
    }

    public List<InquiryResponse> getMyInquiries(Long userId) {
        return inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InquiryResponse> getAllInquiries(InquiryStatus status, InquiryType type) {
        List<Inquiry> inquiries;
        if (status != null && type != null) {
            inquiries = inquiryRepository.findByStatusAndTypeOrderByCreatedAtDesc(status, type);
        } else if (status != null) {
            inquiries = inquiryRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (type != null) {
            inquiries = inquiryRepository.findByTypeOrderByCreatedAtDesc(type);
        } else {
            inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc();
        }

        return inquiries.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InquiryResponse replyInquiry(Long inquiryId, InquiryReplyRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inquiry not found"));

        inquiry.setAdminReply(request.getAdminReply().trim());
        inquiry.setStatus(request.getStatus() == null ? InquiryStatus.ANSWERED : request.getStatus());
        return toResponse(inquiryRepository.save(inquiry));
    }

    private InquiryResponse toResponse(Inquiry inquiry) {
        return InquiryResponse.builder()
                .id(inquiry.getId())
                .type(inquiry.getType())
                .status(inquiry.getStatus())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .isPrivate(inquiry.getIsPrivate())
                .adminReply(inquiry.getAdminReply())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .userId(inquiry.getUser().getId())
                .userEmail(inquiry.getUser().getEmail())
                .userName(inquiry.getUser().getName())
                .build();
    }
}

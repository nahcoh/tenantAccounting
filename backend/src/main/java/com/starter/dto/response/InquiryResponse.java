package com.starter.dto.response;

import com.starter.enums.InquiryStatus;
import com.starter.enums.InquiryType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InquiryResponse {
    private Long id;
    private InquiryType type;
    private InquiryStatus status;
    private String title;
    private String content;
    private Boolean isPrivate;
    private String adminReply;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String userEmail;
    private String userName;
}

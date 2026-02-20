package com.starter.dto.request;

import com.starter.enums.InquiryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InquiryReplyRequest {
    @NotBlank(message = "Admin reply cannot be blank")
    @Size(max = 5000, message = "Admin reply cannot exceed 5000 characters")
    private String adminReply;

    private InquiryStatus status;
}

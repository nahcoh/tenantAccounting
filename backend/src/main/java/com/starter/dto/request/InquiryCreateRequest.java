package com.starter.dto.request;

import com.starter.enums.InquiryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InquiryCreateRequest {
    @NotNull(message = "Inquiry type cannot be null")
    private InquiryType type;

    @NotBlank(message = "Inquiry title cannot be blank")
    @Size(min = 2, max = 200, message = "Inquiry title must be between 2 and 200 characters")
    private String title;

    @NotBlank(message = "Inquiry content cannot be blank")
    @Size(min = 10, message = "Inquiry content must be at least 10 characters")
    private String content;

    private Boolean isPrivate = true;
}

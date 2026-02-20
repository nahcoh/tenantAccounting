package com.starter.repository;

import com.starter.domain.Inquiry;
import com.starter.enums.InquiryStatus;
import com.starter.enums.InquiryType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Inquiry> findAllByOrderByCreatedAtDesc();
    List<Inquiry> findByStatusOrderByCreatedAtDesc(InquiryStatus status);
    List<Inquiry> findByTypeOrderByCreatedAtDesc(InquiryType type);
    List<Inquiry> findByStatusAndTypeOrderByCreatedAtDesc(InquiryStatus status, InquiryType type);
}

package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.SpecialTerm;
import com.starter.dto.request.SpecialTermCreateRequest;
import com.starter.dto.response.SpecialTermResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.SpecialTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecialTermService {

    private final SpecialTermRepository specialTermRepository;
    private final ContractRepository contractRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public List<SpecialTermResponse> getSpecialTermsByContract(Long userId, Long contractId) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return specialTermRepository.findByContractId(contract.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SpecialTermResponse createSpecialTerm(Long userId, Long contractId, SpecialTermCreateRequest request) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);

        SpecialTerm term = new SpecialTerm();
        term.setContract(contract);
        term.setCategory(request.getCategory());
        term.setContent(request.getContent());
        term.setIsConfirmed(false);

        return toResponse(specialTermRepository.save(term));
    }

    @Transactional
    public SpecialTermResponse updateSpecialTerm(Long userId, Long termId, SpecialTermCreateRequest request) {
        SpecialTerm term = getTermAndVerifyOwner(userId, termId);
        term.setCategory(request.getCategory());
        term.setContent(request.getContent());
        return toResponse(specialTermRepository.save(term));
    }

    @Transactional
    public void deleteSpecialTerm(Long userId, Long termId) {
        SpecialTerm term = getTermAndVerifyOwner(userId, termId);
        specialTermRepository.delete(term);
    }

    @Transactional
    public SpecialTermResponse toggleConfirm(Long userId, Long termId) {
        SpecialTerm term = getTermAndVerifyOwner(userId, termId);
        term.setIsConfirmed(!Boolean.TRUE.equals(term.getIsConfirmed()));
        return toResponse(specialTermRepository.save(term));
    }

    @Transactional
    public SpecialTermResponse uploadFile(Long userId, Long termId, MultipartFile file) {
        SpecialTerm term = getTermAndVerifyOwner(userId, termId);
        try {
            Path dir = Paths.get(uploadDir, "special-terms", userId.toString(), termId.toString());
            Files.createDirectories(dir);

            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String storedName = UUID.randomUUID() + ext;
            Path filePath = dir.resolve(storedName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            term.setFilePath(filePath.toString());
            term.setFileName(originalName);
            return toResponse(specialTermRepository.save(term));
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }

    public Resource downloadFile(Long userId, Long termId) {
        SpecialTerm term = getTermAndVerifyOwner(userId, termId);
        if (term.getFilePath() == null || term.getFilePath().isBlank()) {
            throw new IllegalArgumentException("첨부된 파일이 없습니다.");
        }
        try {
            Path filePath = Paths.get(term.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일 경로 오류", e);
        }
    }

    private Contract getContractAndVerifyOwner(Long userId, Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new IllegalArgumentException("Contract not found with id: " + contractId));
        if (!contract.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return contract;
    }

    private SpecialTerm getTermAndVerifyOwner(Long userId, Long termId) {
        SpecialTerm term = specialTermRepository.findById(termId)
                .orElseThrow(() -> new IllegalArgumentException("SpecialTerm not found with id: " + termId));
        if (!term.getContract().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return term;
    }

    private SpecialTermResponse toResponse(SpecialTerm term) {
        SpecialTermResponse response = new SpecialTermResponse();
        response.setId(term.getId());
        response.setContractId(term.getContract().getId());
        response.setCategory(term.getCategory());
        response.setContent(term.getContent());
        response.setFilePath(term.getFilePath());
        response.setFileName(term.getFileName());
        response.setIsConfirmed(term.getIsConfirmed());
        response.setCreatedAt(term.getCreatedAt());
        return response;
    }
}

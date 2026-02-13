package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.Document;
import com.starter.dto.request.DocumentCreateRequest;
import com.starter.dto.response.DocumentResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.DocumentRepository;
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
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ContractRepository contractRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public List<DocumentResponse> getDocumentsByContract(Long userId, Long contractId) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);
        return documentRepository.findByContractId(contract.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponse createDocument(Long userId, Long contractId, DocumentCreateRequest request) {
        Contract contract = getContractAndVerifyOwner(userId, contractId);

        Document document = new Document();
        document.setUser(contract.getUser());
        document.setContract(contract);
        document.setName(request.getName());
        document.setCategory(request.getCategory());
        document.setPhase(request.getPhase());
        document.setFilePath(request.getFilePath() != null ? request.getFilePath() : "");
        document.setIsRequired(request.getIsRequired());

        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public DocumentResponse updateDocument(Long userId, Long documentId, DocumentCreateRequest request) {
        Document document = getDocumentAndVerifyOwner(userId, documentId);
        document.setName(request.getName());
        document.setCategory(request.getCategory());
        document.setPhase(request.getPhase());
        if (request.getFilePath() != null) {
            document.setFilePath(request.getFilePath());
        }
        document.setIsRequired(request.getIsRequired());
        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public void deleteDocument(Long userId, Long documentId) {
        Document document = getDocumentAndVerifyOwner(userId, documentId);
        documentRepository.delete(document);
    }

    @Transactional
    public DocumentResponse uploadFile(Long userId, Long documentId, MultipartFile file) {
        Document document = getDocumentAndVerifyOwner(userId, documentId);

        try {
            Path dir = Paths.get(uploadDir, userId.toString(), documentId.toString());
            Files.createDirectories(dir);

            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String storedName = UUID.randomUUID() + ext;
            Path filePath = dir.resolve(storedName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            document.setFilePath(filePath.toString());
            document.setFileName(originalName);
            return toResponse(documentRepository.save(document));
        } catch (IOException e) {
            throw new RuntimeException("파일 저장에 실패했습니다.", e);
        }
    }

    public Resource downloadFile(Long userId, Long documentId) {
        Document document = getDocumentAndVerifyOwner(userId, documentId);
        if (document.getFilePath() == null || document.getFilePath().isBlank()) {
            throw new IllegalArgumentException("첨부된 파일이 없습니다.");
        }
        try {
            Path filePath = Paths.get(document.getFilePath());
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

    private Document getDocumentAndVerifyOwner(Long userId, Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + documentId));
        if (!document.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        return document;
    }

    private DocumentResponse toResponse(Document document) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setName(document.getName());
        response.setCategory(document.getCategory());
        response.setPhase(document.getPhase());
        response.setFilePath(document.getFilePath());
        response.setFileName(document.getFileName());
        response.setIsRequired(document.getIsRequired());
        response.setUploadedAt(document.getUploadedAt());
        return response;
    }
}

package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.Document;
import com.starter.dto.request.DocumentCreateRequest;
import com.starter.dto.response.DocumentResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ContractRepository contractRepository;

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
        document.setFilePath(request.getFilePath() != null ? request.getFilePath() : "");
        document.setIsRequired(request.getIsRequired());

        return toResponse(documentRepository.save(document));
    }

    @Transactional
    public DocumentResponse updateDocument(Long userId, Long documentId, DocumentCreateRequest request) {
        Document document = getDocumentAndVerifyOwner(userId, documentId);
        document.setName(request.getName());
        document.setCategory(request.getCategory());
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
        response.setFilePath(document.getFilePath());
        response.setIsRequired(document.getIsRequired());
        response.setUploadedAt(document.getUploadedAt());
        return response;
    }
}

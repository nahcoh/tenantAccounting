package com.starter.service;

import com.starter.domain.Contract;
import com.starter.domain.SpecialTerm;
import com.starter.dto.request.SpecialTermCreateRequest;
import com.starter.dto.response.SpecialTermResponse;
import com.starter.repository.ContractRepository;
import com.starter.repository.SpecialTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SpecialTermService {

    private final SpecialTermRepository specialTermRepository;
    private final ContractRepository contractRepository;

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
        response.setIsConfirmed(term.getIsConfirmed());
        response.setCreatedAt(term.getCreatedAt());
        return response;
    }
}

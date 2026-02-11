package com.starter.repository;

import com.starter.domain.Document;
import com.starter.enums.ContractPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByContractId(Long contractId);
    List<Document> findByContractIdAndPhase(Long contractId, ContractPhase phase);
    void deleteByContractId(Long contractId);
}

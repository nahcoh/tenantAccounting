package com.starter.repository;

import com.starter.domain.SpecialTerm;
import com.starter.enums.ContractPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialTermRepository extends JpaRepository<SpecialTerm, Long> {
    List<SpecialTerm> findByContractId(Long contractId);
    List<SpecialTerm> findByContractIdAndPhase(Long contractId, ContractPhase phase);
    void deleteByContractId(Long contractId);
}

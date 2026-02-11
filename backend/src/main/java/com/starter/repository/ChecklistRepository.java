package com.starter.repository;

import com.starter.domain.Checklist;
import com.starter.enums.ContractPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByContractId(Long contractId);
    List<Checklist> findByContractIdAndPhase(Long contractId, ContractPhase phase);
    List<Checklist> findByContractIdOrderByPhaseAscCreatedAtAsc(Long contractId);
    void deleteByContractId(Long contractId);
}

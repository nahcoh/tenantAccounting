package com.starter.repository;

import com.starter.domain.SpecialTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialTermRepository extends JpaRepository<SpecialTerm, Long> {
    List<SpecialTerm> findByContractId(Long contractId);
}

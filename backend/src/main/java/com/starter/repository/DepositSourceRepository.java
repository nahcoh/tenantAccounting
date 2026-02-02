package com.starter.repository;

import com.starter.domain.DepositSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositSourceRepository extends JpaRepository<DepositSource, Long> {
    List<DepositSource> findByContractId(Long contractId);
}

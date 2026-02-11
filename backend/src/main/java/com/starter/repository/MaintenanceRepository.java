package com.starter.repository;

import com.starter.domain.Maintenance;
import com.starter.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByContractIdOrderByCreatedAtDesc(Long contractId);
    List<Maintenance> findByContractIdAndStatusOrderByCreatedAtDesc(Long contractId, MaintenanceStatus status);
    void deleteByContractId(Long contractId);
}

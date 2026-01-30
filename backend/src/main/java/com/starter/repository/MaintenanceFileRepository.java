package com.starter.repository;

import com.starter.domain.MaintenanceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceFileRepository extends JpaRepository<MaintenanceFile, Long> {
}

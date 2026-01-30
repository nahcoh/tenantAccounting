package com.starter.repository;

import com.starter.domain.DepositSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositSourceRepository extends JpaRepository<DepositSource, Long> {
}

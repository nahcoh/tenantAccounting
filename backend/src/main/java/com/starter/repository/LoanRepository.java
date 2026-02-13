package com.starter.repository;

import com.starter.domain.Loan;
import com.starter.enums.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);

    List<Loan> findByUserIdAndType(Long userId, LoanType type);

    void deleteByUserId(Long userId);
}

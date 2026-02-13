package com.starter.repository;

import com.starter.domain.Utility;
import com.starter.enums.UtilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityRepository extends JpaRepository<Utility, Long> {
    List<Utility> findByUserId(Long userId);

    List<Utility> findByUserIdAndYearMonth(Long userId, String yearMonth);

    List<Utility> findByUserIdAndType(Long userId, UtilityType type);

    List<Utility> findByUserIdAndYearMonthStartingWith(Long userId, String year);

    Optional<Utility> findByUserIdAndTypeAndYearMonth(Long userId, UtilityType type, String yearMonth);

    void deleteByUserId(Long userId);
}

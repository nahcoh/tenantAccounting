package com.starter.service;

import com.starter.domain.User;
import com.starter.domain.Utility;
import com.starter.dto.request.UtilityCreateRequest;
import com.starter.dto.response.UtilityResponse;
import com.starter.enums.UtilityType;
import com.starter.repository.UtilityRepository;
import com.starter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilityService {

    private final UtilityRepository utilityRepository;
    private final UserRepository userRepository;

    public List<UtilityResponse> getUtilitiesByMonth(Long userId, String yearMonth) {
        List<Utility> utilities = utilityRepository.findByUserIdAndYearMonth(userId, yearMonth);
        return utilities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UtilityResponse> getUtilitiesByType(Long userId, UtilityType type) {
        List<Utility> utilities = utilityRepository.findByUserIdAndType(userId, type);
        return utilities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<UtilityResponse> getUtilitiesByYear(Long userId, String year) {
        List<Utility> utilities = utilityRepository.findByUserIdAndYearMonthStartingWith(userId, year);
        return utilities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getUtilitySummary(Long userId, String yearMonth) {
        List<Utility> currentMonth = utilityRepository.findByUserIdAndYearMonth(userId, yearMonth);

        // 전월 계산
        String[] parts = yearMonth.split("-");
        int year = Integer.parseInt(parts[0]);
        int month = Integer.parseInt(parts[1]);
        if (month == 1) {
            year--;
            month = 12;
        } else {
            month--;
        }
        String prevYearMonth = String.format("%04d-%02d", year, month);
        List<Utility> prevMonth = utilityRepository.findByUserIdAndYearMonth(userId, prevYearMonth);

        // 현재 월 총액
        BigDecimal currentTotal = currentMonth.stream()
                .map(Utility::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 전월 총액
        BigDecimal prevTotal = prevMonth.stream()
                .map(Utility::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 유형별 금액
        Map<String, BigDecimal> byType = new HashMap<>();
        for (Utility utility : currentMonth) {
            byType.merge(utility.getType().name(), utility.getAmount(), BigDecimal::add);
        }

        // 전월 대비 변화
        Map<String, BigDecimal> comparison = new HashMap<>();
        for (UtilityType type : UtilityType.values()) {
            BigDecimal current = currentMonth.stream()
                    .filter(u -> u.getType() == type)
                    .map(Utility::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal prev = prevMonth.stream()
                    .filter(u -> u.getType() == type)
                    .map(Utility::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            comparison.put(type.name(), current.subtract(prev));
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("yearMonth", yearMonth);
        summary.put("currentTotal", currentTotal);
        summary.put("prevTotal", prevTotal);
        summary.put("byType", byType);
        summary.put("comparison", comparison);
        summary.put("utilities", currentMonth.stream().map(this::toResponse).collect(Collectors.toList()));

        return summary;
    }

    @Transactional
    public UtilityResponse createUtility(Long userId, UtilityCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 같은 월, 같은 유형의 공과금이 이미 있는지 확인
        utilityRepository.findByUserIdAndTypeAndYearMonth(userId, request.getType(), request.getYearMonth())
                .ifPresent(u -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "이미 해당 월에 " + request.getType() + " 공과금이 등록되어 있습니다.");
                });

        Utility utility = new Utility();
        utility.setUser(user);
        utility.setType(request.getType());
        utility.setYearMonth(request.getYearMonth());
        utility.setAmount(request.getAmount());
        utility.setUsageAmount(request.getUsageAmount());
        utility.setUnit(request.getUnit());
        utility.setProvider(request.getProvider());
        utility.setIsSynced(request.getIsSynced() != null ? request.getIsSynced() : false);
        utility.setPaidDate(request.getPaidDate());

        Utility saved = utilityRepository.save(utility);
        return toResponse(saved);
    }

    @Transactional
    public UtilityResponse updateUtility(Long userId, Long utilityId, UtilityCreateRequest request) {
        Utility utility = getUtilityAndVerifyOwner(userId, utilityId);

        utility.setType(request.getType());
        utility.setYearMonth(request.getYearMonth());
        utility.setAmount(request.getAmount());
        utility.setUsageAmount(request.getUsageAmount());
        utility.setUnit(request.getUnit());
        utility.setProvider(request.getProvider());
        utility.setIsSynced(request.getIsSynced() != null ? request.getIsSynced() : false);
        utility.setPaidDate(request.getPaidDate());

        Utility saved = utilityRepository.save(utility);
        return toResponse(saved);
    }

    @Transactional
    public void deleteUtility(Long userId, Long utilityId) {
        Utility utility = getUtilityAndVerifyOwner(userId, utilityId);
        utilityRepository.delete(utility);
    }

    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
                .getId();
    }

    private Utility getUtilityAndVerifyOwner(Long userId, Long utilityId) {
        Utility utility = utilityRepository.findById(utilityId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utility not found"));

        if (!utility.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return utility;
    }

    private UtilityResponse toResponse(Utility utility) {
        return new UtilityResponse(
                utility.getId(),
                utility.getType(),
                utility.getYearMonth(),
                utility.getAmount(),
                utility.getUsageAmount(),
                utility.getUnit(),
                utility.getProvider(),
                utility.getIsSynced(),
                utility.getPaidDate()
        );
    }
}

package com.starter.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOverviewResponse {
    // 현재 월 요약
    private Integer year;
    private Integer month;
    private BigDecimal currentMonthTotal;
    private BigDecimal currentMonthPaid;
    private BigDecimal currentMonthUpcoming;

    // 전월 비교
    private BigDecimal previousMonthTotal;
    private BigDecimal monthOverMonthChange; // 전월 대비 변화율 (%)

    // 카테고리별 지출
    private Map<String, BigDecimal> categoryBreakdown;

    // 연간 누적
    private BigDecimal yearToDateTotal;

    // 최근 납부 내역
    private List<PaymentResponse> recentPayments;

    // 계약 정보 기반 월 고정 지출
    private BigDecimal monthlyFixedCost; // 월세 + 관리비
}

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { getCategoryIcon, getStatusStyle } from '../../lib/utils';

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const categoryLabels = {
  RENT: '월세',
  MAINTENANCE: '관리비',
  LOAN: '대출',
  UTILITY: '공과금',
};

function StatusBadge({ status }) {
  const { className, label } = getStatusStyle(status);
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{label}</span>;
}

export default function OverviewPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/payments/overview/${year}/${month}`);
        setData(response.data);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Failed to fetch overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">{error}</div>
    );
  }

  const changePercent = data?.monthOverMonthChange || 0;
  const isIncrease = changePercent > 0;
  const isDecrease = changePercent < 0;

  // 카테고리별 데이터 정리
  const categoryData = data?.categoryBreakdown || {};
  const totalCategoryAmount = Object.values(categoryData).reduce((sum, val) => sum + Number(val), 0);

  return (
    <div className="space-y-4">
      {/* 월 선택 헤더 */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{year}년 {monthNames[month - 1]} 비용 개요</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 월별 총 지출 요약 카드 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-100 text-sm">이번 달 총 지출</p>
            <p className="text-3xl font-bold mt-1">
              {(data?.currentMonthTotal || 0).toLocaleString()}원
            </p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-3xl">📊</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-purple-100 text-xs">납부 완료</p>
            <p className="text-xl font-semibold">{(data?.currentMonthPaid || 0).toLocaleString()}원</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-purple-100 text-xs">납부 예정</p>
            <p className="text-xl font-semibold">{(data?.currentMonthUpcoming || 0).toLocaleString()}원</p>
          </div>
        </div>
      </div>

      {/* 전월 대비 & 연간 누적 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 전월 대비 */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📈</span>
            <p className="text-sm text-gray-500">전월 대비</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${isIncrease ? 'text-red-500' : isDecrease ? 'text-blue-500' : 'text-gray-700'}`}>
              {isIncrease ? '+' : ''}{changePercent.toFixed(1)}%
            </p>
            {changePercent !== 0 && (
              <span className={`text-xs ${isIncrease ? 'text-red-400' : 'text-blue-400'}`}>
                {isIncrease ? '증가' : '감소'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            전월: {(data?.previousMonthTotal || 0).toLocaleString()}원
          </p>
        </div>

        {/* 연간 누적 */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📅</span>
            <p className="text-sm text-gray-500">{year}년 누적</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(data?.yearToDateTotal || 0).toLocaleString()}원
          </p>
          <p className="text-xs text-gray-400 mt-1">
            1월 ~ {month}월 합계
          </p>
        </div>
      </div>

      {/* 월 고정 지출 */}
      {data?.monthlyFixedCost > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏠</span>
              <div>
                <p className="font-medium text-blue-900">월 고정 지출</p>
                <p className="text-xs text-blue-600">월세 + 관리비</p>
              </div>
            </div>
            <p className="text-xl font-bold text-blue-900">
              {(data?.monthlyFixedCost || 0).toLocaleString()}원
            </p>
          </div>
        </div>
      )}

      {/* 카테고리별 지출 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> 카테고리별 지출
        </h3>
        {Object.keys(categoryData).length === 0 ? (
          <p className="text-center text-gray-400 py-4">이번 달 지출 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryData).map(([category, amount]) => {
              const percentage = totalCategoryAmount > 0 ? (Number(amount) / totalCategoryAmount) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {categoryLabels[category] || category}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(amount).toLocaleString()}원
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category),
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 최근 납부 내역 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span>💳</span> 최근 납부 내역
        </h3>
        {(!data?.recentPayments || data.recentPayments.length === 0) ? (
          <p className="text-center text-gray-400 py-4">최근 납부 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {data.recentPayments.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCategoryIcon(payment.category)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{payment.name}</p>
                    <p className="text-xs text-gray-500">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('ko-KR') : `${payment.paymentDay}일`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{payment.amount.toLocaleString()}원</p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryColor(category) {
  const colors = {
    RENT: '#8B5CF6',      // purple
    MAINTENANCE: '#F59E0B', // amber
    LOAN: '#3B82F6',      // blue
    UTILITY: '#10B981',   // green
  };
  return colors[category] || '#6B7280';
}

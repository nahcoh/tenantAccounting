import React, { useState, useEffect } from 'react';
import api from '../../api';
import { getCategoryIcon, getStatusStyle } from '../../lib/utils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const categoryOptions = [
  { value: 'RENT', label: '월세', icon: '🏠', color: 'emerald' },
  { value: 'MAINTENANCE', label: '관리비', icon: '🔧', color: 'orange' },
  { value: 'LOAN', label: '대출', icon: '🏦', color: 'blue' },
  { value: 'UTILITY', label: '공과금', icon: '⚡', color: 'yellow' },
];

const getCategoryInfo = (category) => categoryOptions.find(c => c.value === category) || categoryOptions[0];

// 카테고리별 배경색
const getCategoryBgClass = (category, status) => {
  if (status?.toUpperCase() === 'PAID') return 'bg-green-100 text-green-700';
  if (status?.toUpperCase() === 'OVERDUE') return 'bg-red-100 text-red-700';

  switch (category) {
    case 'RENT': return 'bg-emerald-100 text-emerald-700';
    case 'MAINTENANCE': return 'bg-orange-100 text-orange-700';
    case 'LOAN': return 'bg-blue-100 text-blue-700';
    case 'UTILITY': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const statusOptions = [
  { value: 'UPCOMING', label: '예정', color: 'blue' },
  { value: 'PAID', label: '완료', color: 'green' },
  { value: 'OVERDUE', label: '미납', color: 'red' },
];

function StatusBadge({ status }) {
  const { className, label } = getStatusStyle(status);
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{label}</span>;
}

export default function CalendarPage() {
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth() + 1);
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'detail'
  const [selectedPayment, setSelectedPayment] = useState(null); // 상세 보기용

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchCalendarData = async () => {
    setCalendarLoading(true);
    setError(null);
    try {
      const response = await api.get(`/payments/calendar/${calendarYear}/${calendarMonth}`);
      setCalendarData({
        ...response.data,
        payments: response.data.payments || [],
      });
    } catch (err) {
      setError('데이터를 불러오는 데 실패했습니다.');
      console.error('Failed to fetch calendar data:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [calendarYear, calendarMonth]);

  // 모달이 열려있을 때 선택된 날짜의 납부 내역 업데이트
  useEffect(() => {
    if (showModal && selectedDate && calendarData) {
      const updatedPayments = calendarData.payments?.filter(p => p.paymentDay === selectedDate.day) || [];
      if (JSON.stringify(updatedPayments) !== JSON.stringify(selectedDate.payments)) {
        setSelectedDate(prev => ({ ...prev, payments: updatedPayments }));
      }
    }
  }, [calendarData]);

  const handleDateClick = (dayInfo) => {
    if (!dayInfo.isCurrentMonth) return;
    const dayPayments = calendarData?.payments?.filter(p => p.paymentDay === dayInfo.day) || [];
    setSelectedDate({ ...dayInfo, payments: dayPayments });
    setModalMode('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setModalMode('view');
    setSelectedPayment(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleStatusChange = async (payment, newStatus) => {
    try {
      // 가상 항목(음수 ID)인 경우 실제 항목으로 생성
      if (payment.id < 0) {
        const createResponse = await api.post('/payments', {
          name: payment.name,
          category: payment.category,
          amount: Number(payment.amount),
          dueDate: payment.dueDate,
          autoPay: payment.autoPay || false,
          isRecurring: false,
          paymentDay: payment.paymentDay,
          sourceType: payment.sourceType,
          sourceId: payment.sourceId,
        });
        // 생성 후 상태 변경
        if (newStatus !== 'UPCOMING') {
          await api.patch(`/payments/${createResponse.data.id}/status?status=${newStatus}`);
        }
        // 새로 생성된 항목으로 selectedPayment 업데이트
        setSelectedPayment({ ...payment, id: createResponse.data.id, status: newStatus });
      } else {
        await api.patch(`/payments/${payment.id}/status?status=${newStatus}`);
        // selectedPayment 상태 업데이트
        setSelectedPayment({ ...payment, status: newStatus });
      }
      await fetchCalendarData();
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  if (calendarLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-500">{error}</div>;
  }

  const payments = calendarData?.payments || [];

  // 상태 + 카테고리 필터링
  const filteredPayments = payments.filter(p => {
    const statusMatch = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter;
    const categoryMatch = categoryFilter === 'ALL' || p.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const getPaymentsForDate = (day) => filteredPayments.filter(p => p.paymentDay === day);

  // 상태별 개수
  const statusCounts = {
    ALL: payments.length,
    UPCOMING: payments.filter(p => p.status.toUpperCase() === 'UPCOMING').length,
    PAID: payments.filter(p => p.status.toUpperCase() === 'PAID').length,
    OVERDUE: payments.filter(p => p.status.toUpperCase() === 'OVERDUE').length,
  };

  // 카테고리별 개수
  const categoryCounts = {
    ALL: payments.length,
    RENT: payments.filter(p => p.category === 'RENT').length,
    MAINTENANCE: payments.filter(p => p.category === 'MAINTENANCE').length,
    LOAN: payments.filter(p => p.category === 'LOAN').length,
    UTILITY: payments.filter(p => p.category === 'UTILITY').length,
  };

  const monthSummary = {
    total: calendarData?.totalAmount ?? 0,
    paid: calendarData?.paidAmount ?? 0,
    upcoming: calendarData?.upcomingAmount ?? 0,
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const days = [];
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1 || 12);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, payments: [] });
    }
    const todayDate = new Date();
    const isCurrentRealMonth = todayDate.getFullYear() === calendarYear && todayDate.getMonth() + 1 === calendarMonth;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPayments = getPaymentsForDate(day);
      days.push({ day, isCurrentMonth: true, isToday: isCurrentRealMonth && todayDate.getDate() === day, payments: dayPayments });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, payments: [] });
    }
    return days;
  };

  const calendarDays = renderCalendar();

  const prevMonth = () => {
    if (calendarMonth === 1) { setCalendarMonth(12); setCalendarYear(calendarYear - 1); }
    else { setCalendarMonth(calendarMonth - 1); }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) { setCalendarMonth(1); setCalendarYear(calendarYear + 1); }
    else { setCalendarMonth(calendarMonth + 1); }
  };

  // 모달 내 선택된 날짜의 납부 내역
  const selectedDatePayments = selectedDate?.payments || [];

  return (
    <div className="space-y-4">
      {/* Month Summary */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-100 text-sm">{calendarYear}년 {monthNames[calendarMonth - 1]} 납부 현황</p>
            <p className="text-3xl font-bold mt-1">{(monthSummary.total || 0).toLocaleString()}원</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-3xl">📅</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-purple-100 text-xs">납부 완료</p>
            <p className="text-xl font-semibold">{(monthSummary.paid || 0).toLocaleString()}원</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-purple-100 text-xs">납부 예정</p>
            <p className="text-xl font-semibold">{(monthSummary.upcoming || 0).toLocaleString()}원</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-purple-100 text-xs">미납</p>
            <p className="text-xl font-semibold">
              {payments.filter(p => p.status.toUpperCase() === 'OVERDUE')
                .reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* 상태별 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'ALL', label: '전체', color: 'gray' },
          { value: 'UPCOMING', label: '납부 예정', color: 'blue' },
          { value: 'PAID', label: '납부 완료', color: 'green' },
          { value: 'OVERDUE', label: '미납', color: 'red' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
              statusFilter === option.value
                ? option.color === 'gray' ? 'bg-gray-800 text-white'
                : option.color === 'blue' ? 'bg-blue-500 text-white'
                : option.color === 'green' ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              statusFilter === option.value ? 'bg-white bg-opacity-30' : 'bg-gray-200'
            }`}>
              {statusCounts[option.value]}
            </span>
          </button>
        ))}
      </div>

      {/* 카테고리별 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'ALL', label: '전체', icon: '📋' },
          { value: 'RENT', label: '월세', icon: '🏠' },
          { value: 'MAINTENANCE', label: '관리비', icon: '🔧' },
          { value: 'LOAN', label: '대출', icon: '🏦' },
          { value: 'UTILITY', label: '공과금', icon: '⚡' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setCategoryFilter(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              categoryFilter === option.value
                ? 'bg-purple-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
            }`}
          >
            <span>{option.icon}</span>
            {option.label}
            {categoryCounts[option.value] > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                categoryFilter === option.value ? 'bg-white bg-opacity-30' : 'bg-gray-100'
              }`}>
                {categoryCounts[option.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCalendarYear(now.getFullYear());
              setCalendarMonth(now.getMonth() + 1);
            }}
            className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors px-3 py-1 rounded-lg hover:bg-purple-50"
          >
            {calendarYear}년 {monthNames[calendarMonth - 1]}
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map((day, idx) => (
            <div key={day} className={`py-2 text-center text-sm font-medium ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((dayInfo, idx) => (
            <div
              key={idx}
              onClick={() => handleDateClick(dayInfo)}
              className={`min-h-[80px] p-1 border-b border-r border-gray-50 cursor-pointer transition-colors ${
                !dayInfo.isCurrentMonth ? 'bg-gray-50' : 'hover:bg-purple-50'
              } ${dayInfo.isToday ? 'bg-purple-50' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                !dayInfo.isCurrentMonth ? 'text-gray-300' :
                dayInfo.isToday ? 'text-purple-600' :
                idx % 7 === 0 ? 'text-red-500' :
                idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700'
              }`}>
                {dayInfo.day}
              </div>
              {dayInfo.isCurrentMonth && dayInfo.payments.length > 0 && (
                <div className="space-y-0.5">
                  {dayInfo.payments.slice(0, 2).map((payment, pIdx) => {
                    const catInfo = getCategoryInfo(payment.category);
                    return (
                      <div
                        key={pIdx}
                        className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-0.5 ${getCategoryBgClass(payment.category, payment.status)}`}
                      >
                        <span className="text-[10px]">{catInfo.icon}</span>
                        <span className="truncate">{payment.name}</span>
                      </div>
                    );
                  })}
                  {dayInfo.payments.length > 2 && (
                    <div className="text-xs text-gray-400 px-1">+{dayInfo.payments.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 핸들 (모바일) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {modalMode === 'detail' && (
                  <button
                    onClick={() => setModalMode('view')}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {modalMode === 'view' && (
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">📆</span>
                      {calendarMonth}월 {selectedDate?.day}일
                    </span>
                  )}
                  {modalMode === 'detail' && (
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryInfo(selectedPayment?.category).icon}</span>
                      상세 정보
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
              {modalMode === 'view' && (
                <>
                  {/* 납부 내역 목록 */}
                  {selectedDatePayments.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-5xl mb-4 block">📭</span>
                      <p className="text-gray-400 mb-4">이 날짜에 납부 내역이 없습니다.</p>
                      <p className="text-sm text-gray-300 mb-4">납부 내역을 추가하려면 아래 페이지에서 등록하세요</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <a href="/cost/contract" className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1">
                          <span>🏠</span> 계약정보
                        </a>
                        <a href="/cost/loan" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1">
                          <span>🏦</span> 대출/이자
                        </a>
                        <a href="/cost/utilities" className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center gap-1">
                          <span>⚡</span> 공과금
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDatePayments.map((payment) => {
                        const catInfo = getCategoryInfo(payment.category);
                        return (
                          <div
                            key={payment.id}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setModalMode('detail');
                            }}
                            className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${
                                  payment.category === 'RENT' ? 'bg-emerald-100' :
                                  payment.category === 'MAINTENANCE' ? 'bg-orange-100' :
                                  payment.category === 'LOAN' ? 'bg-blue-100' :
                                  payment.category === 'UTILITY' ? 'bg-yellow-100' :
                                  'bg-gray-100'
                                }`}>
                                  {catInfo.icon}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{payment.name}</p>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">{catInfo.label}</span>
                                    {payment.isRecurring && <span className="text-indigo-500">🔄 정기</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-lg font-bold text-gray-900">{payment.amount.toLocaleString()}원</p>
                                  <StatusBadge status={payment.status} />
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* 상세 보기 모드 */}
              {modalMode === 'detail' && selectedPayment && (
                <div className="space-y-5">
                  {/* 상세 정보 카드 */}
                  <div className={`rounded-2xl p-5 ${
                    selectedPayment.category === 'RENT' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                    selectedPayment.category === 'MAINTENANCE' ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                    selectedPayment.category === 'LOAN' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                    selectedPayment.category === 'UTILITY' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  } text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl">{getCategoryInfo(selectedPayment.category).icon}</span>
                          <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-sm">
                            {getCategoryInfo(selectedPayment.category).label}
                          </span>
                          {selectedPayment.isRecurring && (
                            <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-sm">🔄 정기</span>
                          )}
                        </div>
                        <p className="text-xl font-bold">{selectedPayment.name}</p>
                      </div>
                      <StatusBadge status={selectedPayment.status} />
                    </div>
                    <div className="text-3xl font-bold mb-2">
                      {selectedPayment.amount.toLocaleString()}원
                    </div>
                    <p className="text-sm opacity-80">
                      납부일: 매월 {selectedPayment.paymentDay}일
                      {selectedPayment.dueDate && ` (${selectedPayment.dueDate})`}
                    </p>
                  </div>

                  {/* 원본 데이터 출처 안내 */}
                  {selectedPayment.sourceType && (
                    <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-lg">
                        {selectedPayment.sourceType === 'LOAN' ? '🏦' :
                         selectedPayment.sourceType === 'CONTRACT' ? '📋' :
                         selectedPayment.sourceType === 'UTILITY' ? '⚡' :
                         selectedPayment.sourceType === 'MAINTENANCE' ? '🔧' : '📌'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-indigo-800">
                          {selectedPayment.sourceType === 'LOAN' ? '대출/이자' :
                           selectedPayment.sourceType === 'CONTRACT' ? '계약 정보' :
                           selectedPayment.sourceType === 'UTILITY' ? '공과금' :
                           selectedPayment.sourceType === 'MAINTENANCE' ? '유지보수 (임차인 부담)' : '연동됨'}에서 생성됨
                        </p>
                        <p className="text-xs text-indigo-600">원본 수정/삭제는 해당 페이지에서 가능합니다</p>
                      </div>
                    </div>
                  )}

                  {/* 상세 정보 */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <h4 className="font-semibold text-gray-700 mb-3">상세 정보</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">카테고리</p>
                        <p className="font-medium text-gray-700">{getCategoryInfo(selectedPayment.category).label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">납부일</p>
                        <p className="font-medium text-gray-700">매월 {selectedPayment.paymentDay}일</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">납부 상태</p>
                        <p className="font-medium text-gray-700">
                          {selectedPayment.status?.toUpperCase() === 'PAID' ? '납부 완료' :
                           selectedPayment.status?.toUpperCase() === 'OVERDUE' ? '미납' : '납부 예정'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">자동이체</p>
                        <p className="font-medium text-gray-700">{selectedPayment.autoPay ? '설정됨' : '미설정'}</p>
                      </div>
                      {selectedPayment.paidDate && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">납부 완료일</p>
                          <p className="font-medium text-gray-700">{selectedPayment.paidDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 상태 변경 */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">상태 변경</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(selectedPayment, option.value)}
                          className={`py-3 text-sm font-medium rounded-xl transition-all ${
                            selectedPayment.status?.toUpperCase() === option.value
                              ? option.color === 'blue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                              : option.color === 'green' ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                              : 'bg-red-500 text-white shadow-lg shadow-red-200'
                              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 관련 페이지 바로가기 */}
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">관련 정보 보기</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPayment.category === 'RENT' && (
                        <a
                          href="/cost/contract"
                          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <span>🏠</span>
                          <span className="text-sm font-medium">계약 정보</span>
                        </a>
                      )}
                      {selectedPayment.category === 'MAINTENANCE' && selectedPayment.sourceType !== 'MAINTENANCE' && (
                        <a
                          href="/cost/contract"
                          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          <span>🔧</span>
                          <span className="text-sm font-medium">계약 정보</span>
                        </a>
                      )}
                      {selectedPayment.sourceType === 'MAINTENANCE' && (
                        <a
                          href="/during/maintenance"
                          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <span>🔧</span>
                          <span className="text-sm font-medium">유지보수 기록</span>
                        </a>
                      )}
                      {selectedPayment.category === 'LOAN' && (
                        <a
                          href="/cost/loan"
                          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <span>🏦</span>
                          <span className="text-sm font-medium">대출/이자</span>
                        </a>
                      )}
                      {selectedPayment.category === 'UTILITY' && (
                        <a
                          href="/cost/utilities"
                          className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-yellow-600 hover:bg-yellow-50 transition-colors"
                        >
                          <span>⚡</span>
                          <span className="text-sm font-medium">공과금</span>
                        </a>
                      )}
                      <a
                        href="/cost/overview"
                        className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <span>📊</span>
                        <span className="text-sm font-medium">비용 요약</span>
                      </a>
                    </div>
                  </div>

                  {/* 원본 페이지로 이동 버튼 */}
                  {selectedPayment.id > 0 ? (
                    <a
                      href={
                        // sourceType이 있으면 사용, 없으면 category 기반으로 결정
                        selectedPayment.sourceType === 'LOAN' || selectedPayment.category === 'LOAN' ? '/cost/loan' :
                        selectedPayment.sourceType === 'MAINTENANCE' ? '/during/maintenance' :
                        selectedPayment.sourceType === 'CONTRACT' || selectedPayment.category === 'RENT' || selectedPayment.category === 'MAINTENANCE' ? '/cost/contract' :
                        selectedPayment.sourceType === 'UTILITY' || selectedPayment.category === 'UTILITY' ? '/cost/utilities' :
                        '/cost/overview'
                      }
                      className="block w-full py-4 text-center text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-colors"
                    >
                      원본 페이지에서 수정/삭제
                    </a>
                  ) : (
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-indigo-600 flex items-center justify-center gap-2">
                        <span>🔄</span>
                        정기 납부 항목입니다. 상태 변경 시 실제 내역으로 등록됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

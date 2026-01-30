import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

// 세입자 주거 기록 앱 V3 - 통합 버전 (비용 관리 + 입주 전/중/후)
// Tenant Housing Record App with Cost Management (Integrated)

function getUserNameFromToken() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return payload.name || null;
  } catch {
    return null;
  }
}

export default function TenantHousingAppV3() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('cost'); // cost, before, during, after
  const [activeSubTab, setActiveSubTab] = useState('calendar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const userName = useMemo(() => getUserNameFromToken(), []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      await api.delete('/api/users/me');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/auth');
    } catch (err) {
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to delete account:', err);
    }
  };
  
  // V3 States (Cost & Calendar)
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(1); // 1-12
  
  // API Data State
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // V1/V2 States
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/payments/calendar/${calendarYear}/${calendarMonth}`);
        setCalendarData({
          ...response.data,
          payments: response.data.payments || [],
        });
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error("Failed to fetch calendar data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [calendarYear, calendarMonth]);


  // ========== V1 Data (unchanged) ==========
  const preMoveDocs = [
    { id: 1, name: '임대차 계약서', status: 'uploaded', date: '2024-01-15', files: 2, required: true },
    { id: 2, name: '등기부등본', status: 'uploaded', date: '2024-01-14', files: 1, required: true },
    { id: 3, name: '건축물대장', status: 'pending', date: null, files: 0, required: true },
    { id: 4, name: '전입신고 확인서', status: 'pending', date: null, files: 0, required: true },
    { id: 5, name: '확정일자 증명', status: 'pending', date: null, files: 0, required: true },
  ];

  const specialTerms = [
    { id: 1, category: '수리', content: '입주 전 보일러 점검 및 필요시 수리는 임대인 부담', checked: true },
    { id: 2, category: '시설', content: '에어컨 2대 설치 상태 유지, 고장 시 임대인 수리', checked: true },
    { id: 3, category: '보증금', content: '계약 해지 시 보증금 1개월 내 반환', checked: false },
    { id: 4, category: '기타', content: '반려동물 사육 가능 (소형견 1마리 한정)', checked: true },
  ];

  const maintenanceRecords = [
    {
      id: 1,
      title: '보일러 고장 수리',
      category: 'repair',
      date: '2024-02-10',
      status: 'completed',
      cost: 150000,
      paidBy: 'landlord',
      description: '보일러 점화 불량으로 수리업체 호출',
      photos: 3,
      receipts: 1
    },
  ];

  // Helper Functions
  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

  const payments = calendarData?.payments || [];

  const getPaymentsForDate = (day) => {
    return payments.filter(p => p.paymentDay === day);
  };

  const upcomingPayments = payments
    .filter(p => p.status.toUpperCase() === 'UPCOMING')
    .sort((a, b) => a.paymentDay - b.paymentDay);


  const getCategoryIcon = (category) => {
    const icons = { RENT: '🏠', MAINTENANCE: '🔧', LOAN: '🏦', UTILITY: '⚡' };
    return icons[category.toUpperCase()] || '💰';
  };

  const getStatusBadge = (status) => {
    const statusUpper = status.toUpperCase();
    const styles = {
      PAID: 'bg-green-50 text-green-700',
      UPCOMING: 'bg-blue-50 text-blue-700',
      OVERDUE: 'bg-red-50 text-red-700',
      UPLOADED: 'bg-green-50 text-green-700',
      PENDING: 'bg-yellow-50 text-yellow-700',
      COMPLETED: 'bg-green-50 text-green-700',
      IN_PROGRESS: 'bg-blue-50 text-blue-700',
      RECORDED: 'bg-gray-100 text-gray-600',
    };
    const labels = { 
      PAID: '납부 완료', UPCOMING: '예정', OVERDUE: '연체',
      UPLOADED: '업로드 완료', PENDING: '미등록', COMPLETED: '완료',
      IN_PROGRESS: '진행 중', RECORDED: '기록됨'
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[statusUpper]}`}>{labels[statusUpper]}</span>;
  };

  const phases = [
    { id: 'before', label: '입주 전', icon: '📋', color: 'blue' },
    { id: 'during', label: '입주 중', icon: '🏠', color: 'green' },
    { id: 'after', label: '입주 후', icon: '📦', color: 'orange' },
    { id: 'cost', label: '비용 관리', icon: '💰', color: 'purple' },
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const prevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarYear, calendarMonth);
    const days = [];
    const prevMonthDays = getDaysInMonth(calendarYear, calendarMonth - 1 || 12);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, payments: [] });
    }
    const today = new Date();
    const isCurrentRealMonth = today.getFullYear() === calendarYear && today.getMonth() + 1 === calendarMonth;
    for (let day = 1; day <= daysInMonth; day++) {
      const payments = getPaymentsForDate(day);
      days.push({
        day,
        isCurrentMonth: true,
        isToday: isCurrentRealMonth && today.getDate() === day,
        payments,
      });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, payments: [] });
    }
    return days;
  };

  const calendarDays = renderCalendar();
  const monthSummary = {
    total: calendarData?.totalAmount ?? 0,
    paid: calendarData?.paidAmount ?? 0,
    upcoming: calendarData?.upcomingAmount ?? 0,
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {userName ? `환영합니다, ${userName}님!` : '내 집 기록'}
                </h1>
                <p className="text-sm text-gray-500">세입자 주거 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-t-lg font-medium"
                    >
                      로그아웃
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg font-medium border-t border-gray-100"
                    >
                      회원 탈퇴
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="px-6 pb-4">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
            {phases.map(phase => (
              <button
                key={phase.id}
                onClick={() => {
                  setActivePhase(phase.id);
                  if (phase.id === 'cost') setActiveSubTab('calendar');
                  else if (phase.id === 'before') setActiveSubTab('documents');
                  else if (phase.id === 'during') setActiveSubTab('maintenance');
                  else if (phase.id === 'after') setActiveSubTab('checklist');
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activePhase === phase.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{phase.icon}</span>
                <span>{phase.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* ========== 비용 관리 (Cost) ========== */}
        {activePhase === 'cost' && (
          <div className="space-y-6">
            {/* Sub Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'calendar', label: '📅 납부 일정' },
                { id: 'overview', label: '요약' },
                { id: 'contract', label: '계약 정보' },
                { id: 'utilities', label: '공과금' },
                { id: 'loan', label: '대출/이자' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeSubTab === tab.id
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ========== Calendar Section ========== */}
            {activeSubTab === 'calendar' && (
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white bg-opacity-20 rounded-xl p-3">
                      <p className="text-purple-100 text-xs">납부 완료</p>
                      <p className="text-xl font-semibold">{(monthSummary.paid || 0).toLocaleString()}원</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-xl p-3">
                      <p className="text-purple-100 text-xs">납부 예정</p>
                      <p className="text-xl font-semibold">{(monthSummary.upcoming || 0).toLocaleString()}원</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Payments Alert */}
                {upcomingPayments.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-orange-500">⏰</span>
                      <h3 className="font-medium text-orange-800">다가오는 납부 일정</h3>
                    </div>
                    <div className="space-y-2">
                      {upcomingPayments.slice(0, 3).map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getCategoryIcon(payment.category)}</span>
                            <div>
                              <p className="font-medium text-gray-900">{payment.name}</p>
                               <p className="text-sm text-gray-500">
                                {payment.paymentDay}일 예정
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">{payment.amount.toLocaleString()}원</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calendar */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {calendarYear}년 {monthNames[calendarMonth - 1]}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {weekDays.map((day, idx) => (
                      <div
                        key={day}
                        className={`py-2 text-center text-sm font-medium ${
                          idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((dayInfo, idx) => {
                      const hasPayments = dayInfo.payments.length > 0;
                      const hasPaid = dayInfo.payments.some(p => p.status.toUpperCase() === 'PAID');
                      const hasUpcoming = dayInfo.payments.some(p => p.status.toUpperCase() === 'UPCOMING');
                      const hasOverdue = dayInfo.payments.some(p => p.status.toUpperCase() === 'OVERDUE');

                      return (
                        <div
                          key={idx}
                          onClick={() => dayInfo.isCurrentMonth && setSelectedDate(dayInfo)}
                          className={`min-h-[80px] p-1 border-b border-r border-gray-50 cursor-pointer transition-colors ${
                            !dayInfo.isCurrentMonth ? 'bg-gray-50' : 'hover:bg-purple-50'
                          } ${dayInfo.isToday ? 'bg-purple-50' : ''} ${
                            selectedDate?.day === dayInfo.day && dayInfo.isCurrentMonth ? 'ring-2 ring-purple-500 ring-inset' : ''
                          }`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            !dayInfo.isCurrentMonth ? 'text-gray-300' :
                            dayInfo.isToday ? 'text-purple-600' :
                            idx % 7 === 0 ? 'text-red-500' :
                            idx % 7 === 6 ? 'text-blue-500' : 'text-gray-700'
                          }`}>
                            {dayInfo.day}
                          </div>

                          {/* Payment Indicators */}
                          {dayInfo.isCurrentMonth && hasPayments && (
                            <div className="space-y-0.5">
                              {dayInfo.payments.slice(0, 2).map((payment, pIdx) => (
                                <div
                                  key={pIdx}
                                  className={`text-xs px-1 py-0.5 rounded truncate ${
                                    payment.status.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-700' :
                                    payment.status.toUpperCase() === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {payment.name}
                                </div>
                              ))}
                              {dayInfo.payments.length > 2 && (
                                <div className="text-xs text-gray-400 px-1">
                                  +{dayInfo.payments.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Date Details */}
                {selectedDate && selectedDate.payments.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {calendarMonth}월 {selectedDate.day}일 납부 내역
                    </h3>
                    <div className="space-y-2">
                      {selectedDate.payments.map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getCategoryIcon(payment.category)}</span>
                            <div>
                              <p className="font-medium text-gray-900">{payment.name}</p>
                              {payment.autoPay && (
                                <p className="text-xs text-gray-500">🔄 자동이체</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{payment.amount.toLocaleString()}원</p>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========== 입주 전 (Before) ========== */}
        {activePhase === 'before' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'documents', label: '📄 서류 관리' },
                { id: 'terms', label: '📝 특약 사항' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeSubTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeSubTab === 'documents' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">입주 전 서류</h3>
                  <span className="text-sm text-gray-500">
                    {preMoveDocs.filter(d => d.status === 'uploaded').length}/{preMoveDocs.length} 완료
                  </span>
                </div>
                {preMoveDocs.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        doc.status === 'uploaded' ? 'bg-green-50' : 'bg-yellow-50'
                      }`}>
                        <span className="text-lg">{doc.status === 'uploaded' ? '✅' : '📋'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.date ? `업로드: ${doc.date}` : '미등록'}
                          {doc.required && <span className="ml-2 text-red-500">필수</span>}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'terms' && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">특약 사항</h3>
                {specialTerms.map(term => (
                  <div key={term.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                    <span className={`mt-0.5 text-lg ${term.checked ? 'text-green-500' : 'text-gray-300'}`}>
                      {term.checked ? '☑️' : '⬜'}
                    </span>
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 mb-1">
                        {term.category}
                      </span>
                      <p className="text-gray-800">{term.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== 입주 중 (During) ========== */}
        {activePhase === 'during' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'maintenance', label: '🔧 유지보수' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeSubTab === tab.id ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeSubTab === 'maintenance' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">유지보수 기록</h3>
                  <span className="text-sm text-gray-500">{maintenanceRecords.length}건</span>
                </div>
                {maintenanceRecords.map(record => (
                  <div key={record.id} className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔧</span>
                        <h4 className="font-medium text-gray-900">{record.title}</h4>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📅 {record.date}</span>
                      <span>💰 {record.cost.toLocaleString()}원</span>
                      <span>{record.paidBy === 'landlord' ? '임대인 부담' : '세입자 부담'}</span>
                      <span>📷 {record.photos}장</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== 입주 후 (After) ========== */}
        {activePhase === 'after' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'checklist', label: '✅ 퇴거 체크리스트' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeSubTab === tab.id ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeSubTab === 'checklist' && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">퇴거 체크리스트</h3>
                {[
                  { id: 1, label: '보증금 반환 일정 확인', done: false },
                  { id: 2, label: '시설물 원상복구 확인', done: false },
                  { id: 3, label: '공과금 정산 완료', done: false },
                  { id: 4, label: '전입신고 말소', done: false },
                  { id: 5, label: '퇴거 전 사진 촬영', done: false },
                  { id: 6, label: '열쇠 반환', done: false },
                ].map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                    <span className={`text-lg ${item.done ? 'text-green-500' : 'text-gray-300'}`}>
                      {item.done ? '☑️' : '⬜'}
                    </span>
                    <p className={`${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

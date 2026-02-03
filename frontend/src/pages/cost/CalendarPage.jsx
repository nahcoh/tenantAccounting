import React, { useState, useEffect } from 'react';
import api from '../../api';
import { getCategoryIcon, getStatusStyle } from '../../lib/utils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function StatusBadge({ status }) {
  const { className, label } = getStatusStyle(status);
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{label}</span>;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarYear, setCalendarYear] = useState(2026);
  const [calendarMonth, setCalendarMonth] = useState(1);
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      setCalendarLoading(true);
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
        setCalendarLoading(false);
      }
    };
    fetchCalendarData();
  }, [calendarYear, calendarMonth]);

  if (calendarLoading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-500">{error}</div>;
  }

  const payments = calendarData?.payments || [];
  const getPaymentsForDate = (day) => payments.filter(p => p.paymentDay === day);

  const upcomingPayments = payments
    .filter(p => p.status.toUpperCase() === 'UPCOMING')
    .sort((a, b) => a.paymentDay - b.paymentDay);

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
    const today = new Date();
    const isCurrentRealMonth = today.getFullYear() === calendarYear && today.getMonth() + 1 === calendarMonth;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPayments = getPaymentsForDate(day);
      days.push({ day, isCurrentMonth: true, isToday: isCurrentRealMonth && today.getDate() === day, payments: dayPayments });
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
                    <p className="text-sm text-gray-500">{payment.paymentDay}일 예정</p>
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{calendarYear}년 {monthNames[calendarMonth - 1]}</h2>
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
              {dayInfo.isCurrentMonth && dayInfo.payments.length > 0 && (
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
                    <div className="text-xs text-gray-400 px-1">+{dayInfo.payments.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          ))}
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
                    {payment.autoPay && <p className="text-xs text-gray-500">🔄 자동이체</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{payment.amount.toLocaleString()}원</p>
                  <StatusBadge status={payment.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

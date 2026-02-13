import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const utilityTypes = [
  { value: 'ELECTRICITY', label: '전기', icon: '⚡', unit: 'kWh', color: 'yellow' },
  { value: 'GAS', label: '가스', icon: '🔥', unit: 'm³', color: 'orange' },
  { value: 'WATER', label: '수도', icon: '💧', unit: 'm³', color: 'blue' },
  { value: 'HEATING', label: '난방', icon: '🌡️', unit: 'Gcal', color: 'red' },
  { value: 'INTERNET', label: '인터넷', icon: '🌐', unit: '', color: 'purple' },
];

const getTypeInfo = (type) => utilityTypes.find(t => t.value === type) || utilityTypes[0];

export default function UtilitiesPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [editingUtility, setEditingUtility] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 폼 상태
  const [form, setForm] = useState({
    type: 'ELECTRICITY',
    amount: '',
    usageAmount: '',
    provider: '',
    paidDate: '',
    dueDay: '25',
    syncToCalendar: true,
  });

  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/utilities/summary/${yearMonth}`);
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setData({ utilities: [], currentTotal: 0, prevTotal: 0, byType: {}, comparison: {} });
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Failed to fetch utilities:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [yearMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else { setMonth(month + 1); }
  };

  const goToToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  const openAddModal = (type = 'ELECTRICITY') => {
    setForm({
      type,
      amount: '',
      usageAmount: '',
      provider: '',
      paidDate: '',
      dueDay: '25',
      syncToCalendar: true,
    });
    setEditingUtility(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (utility) => {
    setForm({
      type: utility.type,
      amount: String(utility.amount),
      usageAmount: utility.usageAmount ? String(utility.usageAmount) : '',
      provider: utility.provider || '',
      paidDate: utility.paidDate || '',
    });
    setEditingUtility(utility);
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUtility(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleCreate = async () => {
    if (!form.amount) {
      alert('금액을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const typeInfo = getTypeInfo(form.type);
      const utilityRes = await api.post('/utilities', {
        type: form.type,
        yearMonth,
        amount: Number(form.amount),
        usageAmount: form.usageAmount ? Number(form.usageAmount) : null,
        unit: typeInfo.unit,
        provider: form.provider || null,
        paidDate: form.paidDate || null,
      });

      // 납부일정에 공과금 등록
      if (form.syncToCalendar && form.amount) {
        const dueDay = Number(form.dueDay) || 25;
        // 해당 월의 납부일 생성
        const dueDate = `${yearMonth}-${String(dueDay).padStart(2, '0')}`;
        const utilityId = utilityRes.data.id;
        await api.post('/payments', {
          name: `${typeInfo.label} 요금`,
          category: 'UTILITY',
          amount: Number(form.amount),
          paymentDay: dueDay,
          dueDate: dueDate,
          isRecurring: false,
          autoPay: false,
          status: form.paidDate ? 'PAID' : 'UPCOMING',
          sourceType: 'UTILITY',
          sourceId: utilityId,
        });
      }

      await fetchData();
      closeModal();
    } catch (err) {
      if (err.response?.status === 409) {
        alert(err.response.data.message || '이미 등록된 공과금입니다.');
      } else {
        alert('등록에 실패했습니다.');
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.amount) {
      alert('금액을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const typeInfo = getTypeInfo(form.type);
      await api.put(`/utilities/${editingUtility.id}`, {
        type: form.type,
        yearMonth,
        amount: Number(form.amount),
        usageAmount: form.usageAmount ? Number(form.usageAmount) : null,
        unit: typeInfo.unit,
        provider: form.provider || null,
        paidDate: form.paidDate || null,
      });

      // 연관된 납부일정 업데이트
      try {
        const paymentsRes = await api.get(`/payments/source/UTILITY/${editingUtility.id}`);
        const payments = paymentsRes.data;
        for (const payment of payments) {
          await api.put(`/payments/${payment.id}`, {
            name: `${typeInfo.label} 요금`,
            category: 'UTILITY',
            amount: Number(form.amount),
            paymentDay: payment.paymentDay,
            dueDate: payment.dueDate,
            isRecurring: false,
            autoPay: payment.autoPay,
            status: form.paidDate ? 'PAID' : payment.status,
          });
        }
      } catch (syncErr) {
        console.error('납부일정 동기화 실패:', syncErr);
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert('수정에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 공과금을 삭제하시겠습니까?\n관련 납부일정도 함께 삭제됩니다.')) return;
    try {
      // 관련 납부일정 먼저 삭제
      await api.delete(`/payments/source/UTILITY/${id}`);
      // 공과금 삭제
      await api.delete(`/utilities/${id}`);
      await fetchData();
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
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
    return <div className="flex items-center justify-center py-12 text-red-500">{error}</div>;
  }

  const utilities = data?.utilities || [];
  const currentTotal = data?.currentTotal || 0;
  const prevTotal = data?.prevTotal || 0;
  const comparison = data?.comparison || {};
  const byType = data?.byType || {};

  // 등록되지 않은 공과금 유형
  const registeredTypes = utilities.map(u => u.type);
  const unregisteredTypes = utilityTypes.filter(t => !registeredTypes.includes(t.value));

  // 전월 대비 변화
  const totalDiff = currentTotal - prevTotal;
  const diffPercent = prevTotal > 0 ? ((totalDiff / prevTotal) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {/* 월 선택 헤더 */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToToday}
          className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors px-3 py-1 rounded-lg hover:bg-purple-50"
        >
          {year}년 {monthNames[month - 1]}
        </button>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 총액 요약 */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-sm">이번 달 공과금</p>
            <p className="text-3xl font-bold mt-1">{Number(currentTotal).toLocaleString()}원</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2">
            <p className="text-emerald-100 text-xs">전월 대비</p>
            <p className={`text-lg font-semibold ${totalDiff > 0 ? 'text-red-200' : totalDiff < 0 ? 'text-blue-200' : ''}`}>
              {totalDiff > 0 ? '+' : ''}{Number(totalDiff).toLocaleString()}원
              {prevTotal > 0 && <span className="text-sm ml-1">({diffPercent}%)</span>}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2">
            <p className="text-emerald-100 text-xs">전월</p>
            <p className="text-lg font-semibold">{Number(prevTotal).toLocaleString()}원</p>
          </div>
        </div>
      </div>

      {/* 공과금 추가 버튼 */}
      <button
        onClick={() => openAddModal()}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        공과금 추가
      </button>

      {/* 공과금 목록 */}
      {utilities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <span className="text-5xl mb-4 block">📭</span>
          <p className="text-gray-400 mb-4">이번 달 등록된 공과금이 없습니다.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {utilityTypes.map(type => (
              <button
                key={type.value}
                onClick={() => openAddModal(type.value)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <span>{type.icon}</span>
                {type.label} 추가
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {utilities.map(utility => {
            const typeInfo = getTypeInfo(utility.type);
            const diff = comparison[utility.type] || 0;
            return (
              <div key={utility.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      typeInfo.color === 'yellow' ? 'bg-yellow-100' :
                      typeInfo.color === 'orange' ? 'bg-orange-100' :
                      typeInfo.color === 'blue' ? 'bg-blue-100' :
                      typeInfo.color === 'red' ? 'bg-red-100' :
                      'bg-purple-100'
                    }`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{typeInfo.label}</p>
                      {utility.provider && (
                        <p className="text-sm text-gray-500">{utility.provider}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{Number(utility.amount).toLocaleString()}원</p>
                    {diff !== 0 && (
                      <p className={`text-sm ${diff > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {diff > 0 ? '▲' : '▼'} {Math.abs(diff).toLocaleString()}원
                      </p>
                    )}
                  </div>
                </div>

                {/* 사용량 */}
                {utility.usageAmount && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">사용량</span>
                      <span className="font-medium text-gray-900">
                        {utility.usageAmount} {utility.unit}
                      </span>
                    </div>
                  </div>
                )}

                {/* 납부일 */}
                {utility.paidDate && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      납부완료
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(utility.paidDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                )}

                {/* 수정/삭제 버튼 */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(utility)}
                    className="flex-1 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(utility.id)}
                    className="flex-1 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}

          {/* 미등록 공과금 빠른 추가 */}
          {unregisteredTypes.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-500 mb-3">미등록 공과금</p>
              <div className="flex flex-wrap gap-2">
                {unregisteredTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => openAddModal(type.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center gap-2"
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 핸들 */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'add' ? '공과금 추가' : '공과금 수정'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 내용 */}
            <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(85vh-80px)]">
              {/* 공과금 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                <div className="grid grid-cols-5 gap-2">
                  {utilityTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value })}
                      className={`py-3 rounded-xl text-center transition-all ${
                        form.type === type.value
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className="text-xs font-medium text-gray-600">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 금액 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">금액 *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">원</span>
                </div>
              </div>

              {/* 사용량 */}
              {getTypeInfo(form.type).unit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사용량</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.usageAmount}
                      onChange={(e) => setForm({ ...form, usageAmount: e.target.value })}
                      placeholder="0"
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 pr-16"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {getTypeInfo(form.type).unit}
                    </span>
                  </div>
                </div>
              )}

              {/* 공급업체 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">공급업체</label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  placeholder="예: 한국전력, 서울도시가스"
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
              </div>

              {/* 납부완료일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">납부완료일 (선택)</label>
                <input
                  type="date"
                  value={form.paidDate}
                  onChange={(e) => setForm({ ...form, paidDate: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                />
                <p className="text-xs text-gray-400 mt-1">입력하면 납부완료로 표시됩니다</p>
              </div>

              {/* 납부일정 연동 (신규 등록 시에만) */}
              {modalMode === 'add' && form.amount && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-purple-800">납부일정에 등록</p>
                      <p className="text-xs text-purple-600">캘린더에 이 공과금 일정을 추가합니다</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, syncToCalendar: !form.syncToCalendar })}
                      className={`w-12 h-6 rounded-full transition-colors ${form.syncToCalendar ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.syncToCalendar ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>

                  {form.syncToCalendar && (
                    <div>
                      <label className="block text-xs text-purple-700 mb-1.5">납부 예정일</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.dueDay}
                          onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                          min="1"
                          max="28"
                          className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-600 text-sm">일</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-4 text-gray-600 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={modalMode === 'add' ? handleCreate : handleUpdate}
                  disabled={submitting}
                  className="flex-1 py-4 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-purple-200"
                >
                  {submitting ? '처리 중...' : modalMode === 'add' ? '추가하기' : '수정하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

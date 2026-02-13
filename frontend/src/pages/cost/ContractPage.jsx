import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const contractTypes = [
  { value: 'JEONSE', label: '전세', icon: '🏠', desc: '보증금만 납부' },
  { value: 'MONTHLY', label: '월세', icon: '💵', desc: '보증금 + 월세' },
  { value: 'SEMI_JEONSE', label: '반전세', icon: '🏘️', desc: '높은 보증금 + 낮은 월세' },
];

const getTypeInfo = (type) => contractTypes.find(t => t.value === type) || contractTypes[0];

// 숫자 포맷팅 (천 단위 콤마)
const formatNumber = (value) => {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? value.replace(/,/g, '') : value;
  if (isNaN(num) || num === '') return '';
  return Number(num).toLocaleString();
};

// 콤마 제거하고 숫자로 변환
const parseNumber = (value) => {
  if (!value) return '';
  return String(value).replace(/,/g, '');
};

// D-Day 계산
const calculateDDay = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export default function ContractPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingContract, setEditingContract] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 상세 보기
  const [expandedId, setExpandedId] = useState(null);

  // 폼 상태
  const [form, setForm] = useState({
    type: 'MONTHLY',
    address: '',
    jeonseDeposit: '',
    monthlyRent: '',
    maintenanceFee: '',
    startDate: '',
    endDate: '',
    paymentDay: '25',
    syncToCalendar: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setContracts([]);
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Failed to fetch contracts:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setForm({
      type: 'MONTHLY',
      address: '',
      jeonseDeposit: '',
      monthlyRent: '',
      maintenanceFee: '',
      startDate: '',
      endDate: '',
      paymentDay: '25',
      syncToCalendar: true,
    });
    setEditingContract(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (contract) => {
    setForm({
      type: contract.type,
      address: contract.address,
      jeonseDeposit: contract.jeonseDeposit ? formatNumber(contract.jeonseDeposit) : '',
      monthlyRent: contract.monthlyRent ? formatNumber(contract.monthlyRent) : '',
      maintenanceFee: contract.maintenanceFee ? formatNumber(contract.maintenanceFee) : '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      paymentDay: '25',
      syncToCalendar: true,
    });
    setEditingContract(contract);
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContract(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // 숫자 입력 핸들러
  const handleNumberChange = (field, value) => {
    const rawValue = parseNumber(value);
    const formattedValue = formatNumber(rawValue);
    setForm({ ...form, [field]: formattedValue });
  };

  const handleCreate = async () => {
    if (!form.address || !form.startDate || !form.endDate) {
      alert('주소, 계약 시작일, 종료일은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const contractData = {
        type: form.type,
        address: form.address,
        jeonseDeposit: parseNumber(form.jeonseDeposit) ? Number(parseNumber(form.jeonseDeposit)) : null,
        monthlyRent: parseNumber(form.monthlyRent) ? Number(parseNumber(form.monthlyRent)) : null,
        maintenanceFee: parseNumber(form.maintenanceFee) ? Number(parseNumber(form.maintenanceFee)) : null,
        startDate: form.startDate,
        endDate: form.endDate,
      };

      const response = await api.post('/contracts', contractData);

      // 납부일정에 월세/관리비 등록
      if (form.syncToCalendar) {
        const paymentDay = Number(form.paymentDay) || 25;
        const contractId = response.data.id;

        if (contractData.monthlyRent && contractData.monthlyRent > 0) {
          await api.post('/payments', {
            name: '월세',
            category: 'RENT',
            amount: contractData.monthlyRent,
            paymentDay: paymentDay,
            isRecurring: true,
            autoPay: false,
            status: 'UPCOMING',
            sourceType: 'CONTRACT',
            sourceId: contractId,
          });
        }

        if (contractData.maintenanceFee && contractData.maintenanceFee > 0) {
          await api.post('/payments', {
            name: '관리비',
            category: 'MAINTENANCE',
            amount: contractData.maintenanceFee,
            paymentDay: paymentDay,
            isRecurring: true,
            autoPay: false,
            status: 'UPCOMING',
            sourceType: 'CONTRACT',
            sourceId: contractId,
          });
        }
      }

      await fetchData();
      closeModal();
    } catch (err) {
      alert('등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.address || !form.startDate || !form.endDate) {
      alert('주소, 계약 시작일, 종료일은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const monthlyRent = parseNumber(form.monthlyRent) ? Number(parseNumber(form.monthlyRent)) : null;
      const maintenanceFee = parseNumber(form.maintenanceFee) ? Number(parseNumber(form.maintenanceFee)) : null;

      await api.put(`/contracts/${editingContract.id}`, {
        type: form.type,
        address: form.address,
        jeonseDeposit: parseNumber(form.jeonseDeposit) ? Number(parseNumber(form.jeonseDeposit)) : null,
        monthlyRent: monthlyRent,
        maintenanceFee: maintenanceFee,
        startDate: form.startDate,
        endDate: form.endDate,
      });

      // 연관된 납부일정 업데이트
      try {
        const paymentsRes = await api.get(`/payments/source/CONTRACT/${editingContract.id}`);
        const payments = paymentsRes.data;
        for (const payment of payments) {
          if (payment.category === 'RENT' && monthlyRent) {
            await api.put(`/payments/${payment.id}`, {
              name: '월세',
              category: 'RENT',
              amount: monthlyRent,
              paymentDay: payment.paymentDay,
              isRecurring: true,
              autoPay: payment.autoPay,
            });
          } else if (payment.category === 'MAINTENANCE' && maintenanceFee) {
            await api.put(`/payments/${payment.id}`, {
              name: '관리비',
              category: 'MAINTENANCE',
              amount: maintenanceFee,
              paymentDay: payment.paymentDay,
              isRecurring: true,
              autoPay: payment.autoPay,
            });
          }
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
    if (!window.confirm('이 계약 정보를 삭제하시겠습니까?\n연관된 체크리스트, 문서, 납부일정도 함께 삭제됩니다.')) return;
    try {
      // 관련 납부일정 먼저 삭제
      await api.delete(`/payments/source/CONTRACT/${id}`);
      // 계약 삭제
      await api.delete(`/contracts/${id}`);
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

  // 현재 계약 (가장 최신)
  const currentContract = contracts.length > 0 ? contracts[0] : null;

  return (
    <div className="space-y-4">
      {/* 현재 계약 요약 카드 */}
      {currentContract && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getTypeInfo(currentContract.type).icon}</span>
                <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-sm">
                  {getTypeInfo(currentContract.type).label}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mb-1">현재 거주지</p>
              <p className="text-lg font-semibold leading-tight">{currentContract.address}</p>
            </div>
            {/* D-Day */}
            {currentContract.endDate && (() => {
              const dDay = calculateDDay(currentContract.endDate);
              const isUrgent = dDay !== null && dDay <= 90;
              return (
                <div className={`text-center px-4 py-2 rounded-xl ${isUrgent ? 'bg-red-500' : 'bg-white bg-opacity-20'}`}>
                  <p className="text-xs opacity-80">만료까지</p>
                  <p className="text-2xl font-bold">
                    {dDay !== null ? (dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day' : `D+${Math.abs(dDay)}`) : '-'}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* 비용 정보 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <p className="text-emerald-100 text-xs">보증금</p>
              <p className="text-lg font-semibold">
                {currentContract.jeonseDeposit ? `${formatNumber(currentContract.jeonseDeposit)}원` : '-'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <p className="text-emerald-100 text-xs">월세</p>
              <p className="text-lg font-semibold">
                {currentContract.monthlyRent ? `${formatNumber(currentContract.monthlyRent)}원` : '-'}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-3">
              <p className="text-emerald-100 text-xs">관리비</p>
              <p className="text-lg font-semibold">
                {currentContract.maintenanceFee ? `${formatNumber(currentContract.maintenanceFee)}원` : '-'}
              </p>
            </div>
          </div>

          {/* 계약 기간 */}
          <div className="mt-4 pt-4 border-t border-white border-opacity-20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-100">계약 기간</span>
              <span className="font-medium">
                {formatDate(currentContract.startDate)} ~ {formatDate(currentContract.endDate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 계약 추가 버튼 */}
      <button
        onClick={openAddModal}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {contracts.length === 0 ? '계약 정보 등록' : '새 계약 추가'}
      </button>

      {/* 계약 목록 */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <span className="text-5xl mb-4 block">📋</span>
          <p className="text-gray-400 mb-2">등록된 계약이 없습니다.</p>
          <p className="text-sm text-gray-300">계약 정보를 등록하여 만료일을 관리하세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 px-1">계약 이력</h3>
          {contracts.map((contract, index) => {
            const typeInfo = getTypeInfo(contract.type);
            const isExpanded = expandedId === contract.id;
            const dDay = calculateDDay(contract.endDate);
            const isExpired = dDay !== null && dDay < 0;
            const isCurrent = index === 0 && !isExpired;

            return (
              <div
                key={contract.id}
                className={`bg-white rounded-2xl border overflow-hidden ${isCurrent ? 'border-emerald-200' : 'border-gray-100'}`}
              >
                {/* 기본 정보 */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : contract.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isCurrent ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{typeInfo.label}</p>
                          {isCurrent && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">현재</span>
                          )}
                          {isExpired && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">만료</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{contract.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dDay !== null && !isExpired && (
                        <span className={`text-sm font-medium ${dDay <= 90 ? 'text-red-500' : 'text-gray-500'}`}>
                          D-{dDay}
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 상세 정보 */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400">보증금</p>
                          <p className="font-medium text-gray-700">
                            {contract.jeonseDeposit ? `${formatNumber(contract.jeonseDeposit)}원` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">월세</p>
                          <p className="font-medium text-gray-700">
                            {contract.monthlyRent ? `${formatNumber(contract.monthlyRent)}원` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">관리비</p>
                          <p className="font-medium text-gray-700">
                            {contract.maintenanceFee ? `${formatNumber(contract.maintenanceFee)}원` : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">월 총 비용</p>
                          <p className="font-medium text-emerald-600">
                            {formatNumber((contract.monthlyRent || 0) + (contract.maintenanceFee || 0))}원
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-400 mb-1">계약 기간</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(contract.startDate)} ~ {formatDate(contract.endDate)}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-400 mb-1">주소</p>
                        <p className="text-sm text-gray-700">{contract.address}</p>
                      </div>
                    </div>

                    {/* 수정/삭제 버튼 */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(contract); }}
                        className="flex-1 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(contract.id); }}
                        className="flex-1 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 핸들 */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'add' ? '계약 정보 등록' : '계약 정보 수정'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 내용 */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 계약 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계약 유형</label>
                <div className="grid grid-cols-3 gap-2">
                  {contractTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        form.type === type.value
                          ? 'bg-emerald-100 border-2 border-emerald-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      <span className="text-xs text-gray-400 block">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주소 *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="예: 서울시 강남구 테헤란로 123, 101동 1001호"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 보증금 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {form.type === 'JEONSE' ? '전세 보증금' : '보증금'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.jeonseDeposit}
                    onChange={(e) => handleNumberChange('jeonseDeposit', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                </div>
              </div>

              {/* 월세 / 관리비 (전세가 아닐 때) */}
              {form.type !== 'JEONSE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">월세</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.monthlyRent}
                        onChange={(e) => handleNumberChange('monthlyRent', e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">관리비</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.maintenanceFee}
                        onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 전세일 때 관리비만 */}
              {form.type === 'JEONSE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">관리비</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.maintenanceFee}
                      onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                  </div>
                </div>
              )}

              {/* 계약 기간 */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    계약 기간 <span className="text-red-500">*</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">시작일</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">종료일</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      min={form.startDate || undefined}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* 빠른 기간 선택 */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1년', months: 12 },
                    { label: '2년', months: 24 },
                  ].map(({ label, months }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => {
                        const start = form.startDate || new Date().toISOString().split('T')[0];
                        const startDate = new Date(start);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + months);
                        setForm({
                          ...form,
                          startDate: start,
                          endDate: endDate.toISOString().split('T')[0],
                        });
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 납부일정 연동 (신규 등록 시에만) */}
              {modalMode === 'add' && (form.monthlyRent || form.maintenanceFee) && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">납부일정에 자동 등록</p>
                      <p className="text-xs text-emerald-600">월세/관리비를 캘린더에 반복 일정으로 등록합니다</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, syncToCalendar: !form.syncToCalendar })}
                      className={`w-12 h-6 rounded-full transition-colors ${form.syncToCalendar ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.syncToCalendar ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>

                  {form.syncToCalendar && (
                    <div>
                      <label className="block text-xs text-emerald-700 mb-1.5">납부일</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.paymentDay}
                          onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                          min="1"
                          max="28"
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm">일</span>
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
                  className="flex-1 py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200"
                >
                  {submitting ? '처리 중...' : modalMode === 'add' ? '등록하기' : '수정하기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

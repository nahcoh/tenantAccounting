import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const loanTypes = [
  { value: 'JEONSE', label: '전세자금', icon: '🏠' },
  { value: 'DEPOSIT', label: '보증금', icon: '💰' },
  { value: 'GOVERNMENT', label: '정부지원', icon: '🏛️' },
  { value: 'CREDIT', label: '신용대출', icon: '💳' },
  { value: 'OTHER', label: '기타', icon: '📋' },
];

const repaymentTypes = [
  { value: 'EQUAL_PRINCIPAL_INTEREST', label: '원리금균등', desc: '매월 동일 금액 상환' },
  { value: 'EQUAL_PRINCIPAL', label: '원금균등', desc: '원금 균등 + 이자 감소' },
  { value: 'BULLET', label: '만기일시', desc: '만기에 원금 일시 상환' },
  { value: 'INTEREST_ONLY', label: '이자만', desc: '이자만 납부' },
];

const getTypeInfo = (type) => loanTypes.find(t => t.value === type) || loanTypes[4];
const getRepaymentInfo = (type) => repaymentTypes.find(t => t.value === type) || repaymentTypes[0];

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
  const num = String(value).replace(/,/g, '');
  return num;
};

// 월 상환액 계산 - 모든 상환방식에서 기간 필수
const calculateMonthlyPayment = (principal, rate, months, repaymentType) => {
  // 원금, 이자율, 기간 모두 필수
  if (!principal || !rate || !months || principal <= 0 || rate <= 0 || months <= 0) {
    return null;
  }

  const P = Number(principal); // 원금
  const r = Number(rate) / 100 / 12; // 월 이자율
  const n = months;
  let monthly = 0;

  switch (repaymentType) {
    case 'EQUAL_PRINCIPAL_INTEREST':
      // 원리금균등: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
      if (r === 0) {
        monthly = P / n;
      } else {
        const rPowN = Math.pow(1 + r, n);
        monthly = P * r * rPowN / (rPowN - 1);
      }
      break;
    case 'EQUAL_PRINCIPAL':
      // 원금균등: 첫 달 기준 (원금/n + 원금*월이자율)
      monthly = P / n + P * r;
      break;
    case 'BULLET':
    case 'INTEREST_ONLY':
      // 만기일시/이자만: 월 이자만 납부
      monthly = P * r;
      break;
    default:
      monthly = P * r;
  }

  return Math.round(monthly);
};

// 두 날짜 사이의 개월 수 계산
const calculateMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return months > 0 ? months : null;
};

export default function LoanPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingLoan, setEditingLoan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 상세 보기
  const [expandedId, setExpandedId] = useState(null);

  // 폼 상태
  const [form, setForm] = useState({
    name: '',
    type: 'JEONSE',
    principalAmount: '',
    remainingAmount: '',
    interestRate: '',
    repaymentType: 'BULLET',
    monthlyPayment: '',
    bankName: '',
    startDate: '',
    endDate: '',
    paymentDay: '',
    memo: '',
    syncToCalendar: true,
  });

  // 월 상환액 자동 계산 - 원금, 이자율, 기간 모두 있어야 계산
  const autoCalculatePayment = useCallback((updatedForm) => {
    const principal = parseNumber(updatedForm.remainingAmount || updatedForm.principalAmount);
    const rate = updatedForm.interestRate;
    const months = calculateMonths(updatedForm.startDate, updatedForm.endDate);
    const repaymentType = updatedForm.repaymentType;

    // 원금, 이자율, 기간 모두 있어야 계산
    if (principal && rate && months && months > 0) {
      const calculated = calculateMonthlyPayment(principal, rate, months, repaymentType);
      if (calculated) {
        return formatNumber(calculated);
      }
    }
    // 조건 불충족 시 빈 값 반환
    return '';
  }, []);

  // 원금 변경 핸들러
  const handlePrincipalChange = (value) => {
    const rawValue = parseNumber(value);
    const formattedValue = formatNumber(rawValue);
    const prevPrincipal = parseNumber(form.principalAmount);
    const prevRemaining = parseNumber(form.remainingAmount);

    // 잔여원금이 비어있거나 이전 원금과 같으면 동기화
    const shouldSyncRemaining = !prevRemaining || prevRemaining === prevPrincipal;

    const updatedForm = {
      ...form,
      principalAmount: formattedValue,
      remainingAmount: shouldSyncRemaining ? formattedValue : form.remainingAmount,
    };

    // 월 상환액 자동 계산
    updatedForm.monthlyPayment = autoCalculatePayment(updatedForm);
    setForm(updatedForm);
  };

  // 잔여원금 변경 핸들러
  const handleRemainingChange = (value) => {
    const rawValue = parseNumber(value);
    const formattedValue = formatNumber(rawValue);

    const updatedForm = {
      ...form,
      remainingAmount: formattedValue,
    };

    // 월 상환액 자동 계산
    updatedForm.monthlyPayment = autoCalculatePayment(updatedForm);
    setForm(updatedForm);
  };

  // 이자율 변경 핸들러
  const handleRateChange = (value) => {
    const updatedForm = {
      ...form,
      interestRate: value,
    };

    // 월 상환액 자동 계산
    updatedForm.monthlyPayment = autoCalculatePayment(updatedForm);
    setForm(updatedForm);
  };

  // 상환방식 변경 핸들러
  const handleRepaymentTypeChange = (value) => {
    const updatedForm = {
      ...form,
      repaymentType: value,
    };

    // 월 상환액 자동 계산
    updatedForm.monthlyPayment = autoCalculatePayment(updatedForm);
    setForm(updatedForm);
  };

  // 날짜 변경 핸들러
  const handleDateChange = (field, value) => {
    const updatedForm = {
      ...form,
      [field]: value,
    };

    // 월 상환액 자동 계산
    updatedForm.monthlyPayment = autoCalculatePayment(updatedForm);
    setForm(updatedForm);
  };

  // 월 상환액 직접 변경 핸들러
  const handleMonthlyPaymentChange = (value) => {
    const rawValue = parseNumber(value);
    const formattedValue = formatNumber(rawValue);
    setForm({ ...form, monthlyPayment: formattedValue });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/loans/summary');
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setData({ loans: [], totalPrincipal: 0, totalRemaining: 0, totalMonthlyPayment: 0, totalMonthlyInterest: 0 });
      } else {
        setError('데이터를 불러오는 데 실패했습니다.');
        console.error('Failed to fetch loans:', err);
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
      name: '',
      type: 'JEONSE',
      principalAmount: '',
      remainingAmount: '',
      interestRate: '',
      repaymentType: 'BULLET',
      monthlyPayment: '',
      bankName: '',
      startDate: '',
      endDate: '',
      paymentDay: '',
      memo: '',
      syncToCalendar: true,
    });
    setEditingLoan(null);
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (loan) => {
    setForm({
      name: loan.name,
      type: loan.type,
      principalAmount: formatNumber(loan.principalAmount),
      remainingAmount: loan.remainingAmount ? formatNumber(loan.remainingAmount) : '',
      interestRate: String(loan.interestRate),
      repaymentType: loan.repaymentType,
      monthlyPayment: loan.monthlyPayment ? formatNumber(loan.monthlyPayment) : '',
      bankName: loan.bankName || '',
      startDate: loan.startDate || '',
      endDate: loan.endDate || '',
      paymentDay: loan.paymentDay ? String(loan.paymentDay) : '',
      memo: loan.memo || '',
      syncToCalendar: false,
    });
    setEditingLoan(loan);
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLoan(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const handleCreate = async () => {
    const principalRaw = parseNumber(form.principalAmount);
    const remainingRaw = parseNumber(form.remainingAmount);
    const monthlyRaw = parseNumber(form.monthlyPayment);

    if (!form.name || !principalRaw || !form.interestRate) {
      alert('대출명, 대출금액, 이자율은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/loans', {
        name: form.name,
        type: form.type,
        principalAmount: Number(principalRaw),
        remainingAmount: remainingRaw ? Number(remainingRaw) : null,
        interestRate: Number(form.interestRate),
        repaymentType: form.repaymentType,
        monthlyPayment: monthlyRaw ? Number(monthlyRaw) : null,
        bankName: form.bankName || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        paymentDay: form.paymentDay ? Number(form.paymentDay) : null,
        memo: form.memo || null,
      });

      // 납부일정에 대출 상환 등록 (생성된 대출 ID 사용)
      if (form.syncToCalendar && monthlyRaw && Number(monthlyRaw) > 0) {
        const paymentDay = form.paymentDay ? Number(form.paymentDay) : 15;
        // 대출 ID를 가져오기 위해 다시 조회
        const loansRes = await api.get('/loans/summary');
        const newLoan = loansRes.data.loans?.find(l => l.name === form.name);
        if (newLoan) {
          await api.post('/payments', {
            name: `${form.name} 상환`,
            category: 'LOAN',
            amount: Number(monthlyRaw),
            paymentDay: paymentDay,
            isRecurring: true,
            autoPay: false,
            status: 'UPCOMING',
            sourceType: 'LOAN',
            sourceId: newLoan.id,
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
    const principalRaw = parseNumber(form.principalAmount);
    const remainingRaw = parseNumber(form.remainingAmount);
    const monthlyRaw = parseNumber(form.monthlyPayment);

    if (!form.name || !principalRaw || !form.interestRate) {
      alert('대출명, 대출금액, 이자율은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/loans/${editingLoan.id}`, {
        name: form.name,
        type: form.type,
        principalAmount: Number(principalRaw),
        remainingAmount: remainingRaw ? Number(remainingRaw) : null,
        interestRate: Number(form.interestRate),
        repaymentType: form.repaymentType,
        monthlyPayment: monthlyRaw ? Number(monthlyRaw) : null,
        bankName: form.bankName || null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        paymentDay: form.paymentDay ? Number(form.paymentDay) : null,
        memo: form.memo || null,
      });

      // 연관된 납부일정 업데이트
      try {
        const paymentsRes = await api.get(`/payments/source/LOAN/${editingLoan.id}`);
        const payments = paymentsRes.data;
        if (payments.length > 0) {
          const paymentDay = form.paymentDay ? Number(form.paymentDay) : 15;
          for (const payment of payments) {
            await api.put(`/payments/${payment.id}`, {
              name: `${form.name} 상환`,
              category: 'LOAN',
              amount: monthlyRaw ? Number(monthlyRaw) : payment.amount,
              paymentDay: paymentDay,
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
    if (!window.confirm('이 대출 정보를 삭제하시겠습니까?\n관련 납부일정도 함께 삭제됩니다.')) return;
    try {
      // 관련 납부일정 먼저 삭제
      await api.delete(`/payments/source/LOAN/${id}`);
      // 대출 삭제
      await api.delete(`/loans/${id}`);
      await fetchData();
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-500">{error}</div>;
  }

  const loans = data?.loans || [];
  const totalPrincipal = data?.totalPrincipal || 0;
  const totalRemaining = data?.totalRemaining || 0;
  const totalMonthlyPayment = data?.totalMonthlyPayment || 0;
  const totalMonthlyInterest = data?.totalMonthlyInterest || 0;

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">총 대출 잔액</p>
            <p className="text-3xl font-bold mt-1">{Number(totalRemaining).toLocaleString()}원</p>
          </div>
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-3xl">🏦</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-blue-100 text-xs">총 대출금</p>
            <p className="text-lg font-semibold">{Number(totalPrincipal).toLocaleString()}원</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-blue-100 text-xs">월 상환액</p>
            <p className="text-lg font-semibold">{Number(totalMonthlyPayment).toLocaleString()}원</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-xl p-3">
            <p className="text-blue-100 text-xs">월 이자</p>
            <p className="text-lg font-semibold">{Number(totalMonthlyInterest).toLocaleString()}원</p>
          </div>
        </div>
      </div>

      {/* 대출 추가 버튼 */}
      <button
        onClick={openAddModal}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        대출 추가
      </button>

      {/* 대출 목록 */}
      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <span className="text-5xl mb-4 block">🏦</span>
          <p className="text-gray-400 mb-2">등록된 대출이 없습니다.</p>
          <p className="text-sm text-gray-300">대출을 추가하여 이자와 상환 일정을 관리하세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map(loan => {
            const typeInfo = getTypeInfo(loan.type);
            const repaymentInfo = getRepaymentInfo(loan.repaymentType);
            const isExpanded = expandedId === loan.id;

            return (
              <div key={loan.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* 기본 정보 */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : loan.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                        {typeInfo.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{loan.name}</p>
                        <p className="text-sm text-gray-500">
                          {typeInfo.label} · {loan.bankName || '미지정'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {Number(loan.remainingAmount || loan.principalAmount).toLocaleString()}원
                      </p>
                      <p className="text-sm text-blue-500">연 {loan.interestRate}%</p>
                    </div>
                  </div>

                  {/* 간단 요약 */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">월 이자</p>
                      <p className="font-medium text-gray-700">{Number(loan.monthlyInterest || 0).toLocaleString()}원</p>
                    </div>
                    {loan.monthlyPayment && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">월 상환</p>
                        <p className="font-medium text-gray-700">{Number(loan.monthlyPayment).toLocaleString()}원</p>
                      </div>
                    )}
                    {loan.remainingMonths !== null && loan.remainingMonths !== undefined && (
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">남은 기간</p>
                        <p className="font-medium text-gray-700">{loan.remainingMonths}개월</p>
                      </div>
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

                {/* 상세 정보 */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400">대출 원금</p>
                          <p className="font-medium text-gray-700">{Number(loan.principalAmount).toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">잔여 원금</p>
                          <p className="font-medium text-gray-700">{Number(loan.remainingAmount || loan.principalAmount).toLocaleString()}원</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">상환 방식</p>
                          <p className="font-medium text-gray-700">{repaymentInfo.label}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">상환일</p>
                          <p className="font-medium text-gray-700">매월 {loan.paymentDay || '-'}일</p>
                        </div>
                        {loan.startDate && (
                          <div>
                            <p className="text-xs text-gray-400">대출 시작일</p>
                            <p className="font-medium text-gray-700">{loan.startDate}</p>
                          </div>
                        )}
                        {loan.endDate && (
                          <div>
                            <p className="text-xs text-gray-400">만기일</p>
                            <p className="font-medium text-gray-700">{loan.endDate}</p>
                          </div>
                        )}
                      </div>
                      {loan.totalInterest > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-400">만기까지 예상 이자</p>
                          <p className="text-lg font-bold text-red-500">{Number(loan.totalInterest).toLocaleString()}원</p>
                        </div>
                      )}
                      {loan.memo && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-400">메모</p>
                          <p className="text-sm text-gray-600">{loan.memo}</p>
                        </div>
                      )}
                    </div>

                    {/* 수정/삭제 버튼 */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(loan); }}
                        className="flex-1 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(loan.id); }}
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
                {modalMode === 'add' ? '대출 추가' : '대출 수정'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 내용 */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* 대출 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대출 유형</label>
                <div className="grid grid-cols-5 gap-2">
                  {loanTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: type.value })}
                      className={`py-3 rounded-xl text-center transition-all ${
                        form.type === type.value
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl block mb-1">{type.icon}</span>
                      <span className="text-xs font-medium text-gray-600">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 대출명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대출명 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 전세자금대출, 버팀목대출"
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 대출금액 / 잔여금액 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">대출 원금 *</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.principalAmount}
                      onChange={(e) => handlePrincipalChange(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">잔여 원금</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.remainingAmount}
                      onChange={(e) => handleRemainingChange(e.target.value)}
                      placeholder="원금과 동일"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                  </div>
                </div>
              </div>

              {/* 이자율 / 월 상환액 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">연 이자율 *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={form.interestRate}
                      onChange={(e) => handleRateChange(e.target.value)}
                      placeholder="3.5"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    월 상환액
                    {form.monthlyPayment && <span className="text-blue-500 text-xs ml-1">(자동계산)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.monthlyPayment}
                      onChange={(e) => handleMonthlyPaymentChange(e.target.value)}
                      placeholder={!form.startDate || !form.endDate ? '기간 설정 필요' : '자동 계산'}
                      className={`w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                        form.monthlyPayment ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    원금, 이자율, 기간 입력 시 자동 계산
                  </p>
                </div>
              </div>

              {/* 상환 방식 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상환 방식</label>
                <div className="grid grid-cols-2 gap-2">
                  {repaymentTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleRepaymentTypeChange(type.value)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        form.repaymentType === type.value
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 은행 / 상환일 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">은행/기관</label>
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="예: 국민은행"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상환일</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.paymentDay}
                      onChange={(e) => setForm({ ...form, paymentDay: e.target.value })}
                      placeholder="15"
                      min="1"
                      max="28"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">일</span>
                  </div>
                </div>
              </div>

              {/* 기간 */}
              <div className={`rounded-xl p-4 space-y-4 ${form.startDate && form.endDate ? 'bg-blue-50' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    대출 기간 설정 <span className="text-red-500">*</span>
                  </span>
                  {form.startDate && form.endDate && calculateMonths(form.startDate, form.endDate) > 0 ? (
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {calculateMonths(form.startDate, form.endDate)}개월
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600">필수 입력</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">시작일</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      {form.startDate && (
                        <div className="absolute -top-2 right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                          {new Date(form.startDate).toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">만기일</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        min={form.startDate || undefined}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      {form.endDate && (
                        <div className="absolute -top-2 right-2 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded">
                          {new Date(form.endDate).toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 빠른 기간 선택 버튼 */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1년', months: 12 },
                    { label: '2년', months: 24 },
                    { label: '3년', months: 36 },
                    { label: '5년', months: 60 },
                    { label: '10년', months: 120 },
                  ].map(({ label, months }) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => {
                        const start = form.startDate || new Date().toISOString().split('T')[0];
                        const startDate = new Date(start);
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + months);
                        const newForm = {
                          ...form,
                          startDate: start,
                          endDate: endDate.toISOString().split('T')[0],
                        };
                        newForm.monthlyPayment = autoCalculatePayment(newForm);
                        setForm(newForm);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        calculateMonths(form.startDate, form.endDate) === months
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* 안내 메시지 */}
                {(!form.startDate || !form.endDate) && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    월 상환액 자동 계산을 위해 기간 설정이 필요합니다
                  </p>
                )}
              </div>

              {/* 납부일정 연동 (신규 등록 시에만) */}
              {modalMode === 'add' && (
                <div className={`rounded-xl p-4 ${form.monthlyPayment ? 'bg-blue-50' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${form.monthlyPayment ? 'text-blue-800' : 'text-gray-600'}`}>
                        납부일정에 자동 등록
                      </p>
                      <p className={`text-xs ${form.monthlyPayment ? 'text-blue-600' : 'text-gray-500'}`}>
                        {form.monthlyPayment
                          ? '월 상환액을 캘린더에 반복 일정으로 등록합니다'
                          : '월 상환액이 있어야 등록할 수 있습니다 (기간 설정 필요)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, syncToCalendar: !form.syncToCalendar })}
                      disabled={!form.monthlyPayment}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        !form.monthlyPayment ? 'bg-gray-200 cursor-not-allowed' :
                        form.syncToCalendar ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        form.syncToCalendar && form.monthlyPayment ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  placeholder="추가 메모 (선택)"
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

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
                  className="flex-1 py-4 text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
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

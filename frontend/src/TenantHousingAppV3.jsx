import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const formatMoney = (value) => {
  if (!value && value !== 0) return '';
  return String(value).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const parseMoney = (formatted) => formatted.replace(/,/g, '');

const CATEGORY_LABELS = { REPAIR: '수리', FACILITY: '시설', DEPOSIT: '보증금', OTHER: '기타' };
const DOC_CATEGORY_LABELS = { CONTRACT: '계약', REGISTRATION: '등기', CHECKIN: '전입', OTHER: '기타' };
const CONTRACT_TYPE_LABELS = { JEONSE: '전세', MONTHLY: '월세', SEMI_JEONSE: '반전세' };

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
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [error, setError] = useState(null);

  // V1/V2 States
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ========== 입주 전 API States ==========
  const [contract, setContract] = useState(null);
  const [contractLoading, setContractLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [specialTerms, setSpecialTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  // Form States
  const [contractForm, setContractForm] = useState({
    type: 'JEONSE', address: '', addressDetail: '', jeonseDeposit: '', monthlyRent: '',
    maintenanceFee: '', startDate: '', endDate: ''
  });
  const fileInputRefs = useRef({});
  const [docForm, setDocForm] = useState({ name: '', category: 'CONTRACT', isRequired: false, file: null });
  const docFileInputRef = useRef(null);
  const [termForm, setTermForm] = useState({ category: 'REPAIR', content: '', file: null });
  const termFileInputRef = useRef(null);
  const termFileInputRefs = useRef({});

  // ========== API Fetch Functions ==========
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

  // Fetch contracts on mount
  useEffect(() => {
    const fetchContracts = async () => {
      setContractLoading(true);
      try {
        const res = await api.get('/api/contracts');
        const contracts = res.data;
        setContract(contracts.length > 0 ? contracts[0] : null);
      } catch (err) {
        console.error('Failed to fetch contracts:', err);
      } finally {
        setContractLoading(false);
      }
    };
    fetchContracts();
  }, []);

  // Fetch documents & special terms when contract changes
  useEffect(() => {
    if (!contract?.id) return;

    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const res = await api.get(`/api/contracts/${contract.id}/documents`);
        setDocuments(res.data);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    const fetchSpecialTerms = async () => {
      setTermsLoading(true);
      try {
        const res = await api.get(`/api/contracts/${contract.id}/special-terms`);
        setSpecialTerms(res.data);
      } catch (err) {
        console.error('Failed to fetch special terms:', err);
      } finally {
        setTermsLoading(false);
      }
    };

    fetchDocuments();
    fetchSpecialTerms();
  }, [contract?.id]);

  // ========== Mutation Functions ==========
  const handleCreateContract = async () => {
    if (!contractForm.address || !contractForm.startDate || !contractForm.endDate) {
      alert('주소, 시작일, 종료일은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = contractForm.addressDetail
        ? `${contractForm.address} ${contractForm.addressDetail}`
        : contractForm.address;
      const payload = {
        type: contractForm.type,
        address: fullAddress,
        jeonseDeposit: contractForm.jeonseDeposit ? Number(contractForm.jeonseDeposit) : null,
        monthlyRent: contractForm.monthlyRent ? Number(contractForm.monthlyRent) : null,
        maintenanceFee: contractForm.maintenanceFee ? Number(contractForm.maintenanceFee) : null,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
      };
      const res = await api.post('/api/contracts', payload);
      setContract(res.data);
      setShowAddModal(false);
      setContractForm({ type: 'JEONSE', address: '', addressDetail: '', jeonseDeposit: '', monthlyRent: '', maintenanceFee: '', startDate: '', endDate: '' });
    } catch (err) {
      alert('계약 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateContract = async () => {
    if (!contractForm.address || !contractForm.startDate || !contractForm.endDate) {
      alert('주소, 시작일, 종료일은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = contractForm.addressDetail
        ? `${contractForm.address} ${contractForm.addressDetail}`
        : contractForm.address;
      const payload = {
        type: contractForm.type,
        address: fullAddress,
        jeonseDeposit: contractForm.jeonseDeposit ? Number(contractForm.jeonseDeposit) : null,
        monthlyRent: contractForm.monthlyRent ? Number(contractForm.monthlyRent) : null,
        maintenanceFee: contractForm.maintenanceFee ? Number(contractForm.maintenanceFee) : null,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
      };
      const res = await api.put(`/api/contracts/${contract.id}`, payload);
      setContract(res.data);
      setShowAddModal(false);
    } catch (err) {
      alert('계약 수정에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!window.confirm('계약을 삭제하시겠습니까? 관련 서류와 특약사항도 모두 삭제됩니다.')) return;
    try {
      await api.delete(`/api/contracts/${contract.id}`);
      setContract(null);
      setDocuments([]);
      setSpecialTerms([]);
      setShowAddModal(false);
    } catch (err) {
      alert('계약 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const openEditContractModal = () => {
    setContractForm({
      type: contract.type,
      address: contract.address,
      addressDetail: '',
      jeonseDeposit: contract.jeonseDeposit || '',
      monthlyRent: contract.monthlyRent || '',
      maintenanceFee: contract.maintenanceFee || '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
    });
    setModalType('editContract');
    setShowAddModal(true);
  };

  const handleCreateDocument = async () => {
    if (!docForm.name) { alert('서류명을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const createRes = await api.post(`/api/contracts/${contract.id}/documents`, {
        name: docForm.name,
        category: docForm.category,
        isRequired: docForm.isRequired,
      });
      if (docForm.file) {
        const formData = new FormData();
        formData.append('file', docForm.file);
        await api.post(`/api/documents/${createRes.data.id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const res = await api.get(`/api/contracts/${contract.id}/documents`);
      setDocuments(res.data);
      setShowAddModal(false);
      setDocForm({ name: '', category: 'CONTRACT', isRequired: false, file: null });
    } catch (err) {
      alert('서류 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('이 서류를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleCreateSpecialTerm = async () => {
    if (!termForm.content) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const createRes = await api.post(`/api/contracts/${contract.id}/special-terms`, {
        category: termForm.category,
        content: termForm.content,
      });
      if (termForm.file) {
        const formData = new FormData();
        formData.append('file', termForm.file);
        await api.post(`/api/special-terms/${createRes.data.id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const res = await api.get(`/api/contracts/${contract.id}/special-terms`);
      setSpecialTerms(res.data);
      setShowAddModal(false);
      setTermForm({ category: 'REPAIR', content: '', file: null });
    } catch (err) {
      alert('특약사항 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpecialTerm = async (termId) => {
    if (!window.confirm('이 특약사항을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/special-terms/${termId}`);
      setSpecialTerms(prev => prev.filter(t => t.id !== termId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleToggleTermConfirm = async (termId) => {
    try {
      const res = await api.patch(`/api/special-terms/${termId}/confirm`);
      setSpecialTerms(prev => prev.map(t => t.id === termId ? res.data : t));
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleFileUpload = async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/documents/${docId}/upload`, formData, {
      });
      const res = await api.get(`/api/contracts/${contract.id}/documents`);
      setDocuments(res.data);
    } catch (err) {
      alert('파일 업로드에 실패했습니다.');
      console.error(err);
    }
  };

  const handleFileDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/api/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('파일 다운로드에 실패했습니다.');
      console.error(err);
    }
  };

  const handleTermFileUpload = async (termId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/special-terms/${termId}/upload`, formData, {
      });
      const res = await api.get(`/api/contracts/${contract.id}/special-terms`);
      setSpecialTerms(res.data);
    } catch (err) {
      alert('파일 업로드에 실패했습니다.');
      console.error(err);
    }
  };

  const handleTermFileDownload = async (termId, fileName) => {
    try {
      const res = await api.get(`/api/special-terms/${termId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('파일 다운로드에 실패했습니다.');
      console.error(err);
    }
  };

  const [previewUrls, setPreviewUrls] = useState({});

  const toggleCard = async (prefix, id, fileName, filePath) => {
    const key = `${prefix}-${id}`;
    const isExpanding = !expandedCards[key];
    setExpandedCards(prev => ({ ...prev, [key]: isExpanding }));

    if (isExpanding && filePath && !previewUrls[key]) {
      const isPreviewable = /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(fileName || '');
      if (isPreviewable) {
        try {
          const endpoint = prefix === 'doc' ? 'documents' : 'special-terms';
          const res = await api.get(`/api/${endpoint}/${id}/preview`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          setPreviewUrls(prev => ({ ...prev, [key]: url }));
        } catch (err) {
          console.error('Preview load failed:', err);
        }
      }
    }
  };

  const isImageFile = (fileName) => {
    if (!fileName) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const isPdfFile = (fileName) => {
    if (!fileName) return false;
    return /\.pdf$/i.test(fileName);
  };

  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setContractForm(prev => ({ ...prev, address: data.roadAddress || data.jibunAddress }));
      },
    }).open();
  };

  // ========== V1 Data (unchanged) ==========
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

  const closeModal = () => {
    setShowAddModal(false);
    setModalType('');
  };

  // Only show full-page loading for cost phase
  if (activePhase === 'cost' && calendarLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (activePhase === 'cost' && error) {
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
            {contractLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">불러오는 중...</div>
            ) : !contract ? (
              /* 계약 미등록 상태 */
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">계약 정보를 먼저 등록해주세요</h3>
                <p className="text-sm text-gray-500 mb-6">입주 전 서류와 특약사항을 관리하려면 계약 정보가 필요합니다.</p>
                <button
                  onClick={() => openAddModal('contract')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  계약 등록하기
                </button>
              </div>
            ) : (
              <>
                {/* 계약 요약 카드 */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-100 text-sm">내 계약</p>
                    <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                      {CONTRACT_TYPE_LABELS[contract.type]}
                    </span>
                  </div>
                  <p className="font-semibold text-lg mb-1">{contract.address}</p>
                  <p className="text-blue-100 text-sm">
                    {contract.startDate} ~ {contract.endDate}
                  </p>
                  {contract.jeonseDeposit && (
                    <p className="text-white text-sm mt-1">보증금: {Number(contract.jeonseDeposit).toLocaleString()}원</p>
                  )}
                  {contract.monthlyRent && (
                    <p className="text-white text-sm">월세: {Number(contract.monthlyRent).toLocaleString()}원</p>
                  )}
                  <button
                    onClick={openEditContractModal}
                    className="mt-3 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                  >
                    계약 정보 수정
                  </button>
                </div>

                {/* Sub tabs */}
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

                {/* 서류 관리 */}
                {activeSubTab === 'documents' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">입주 전 서류</h3>
                      <span className="text-sm text-gray-500">
                        {documents.filter(d => d.filePath).length}/{documents.length} 완료
                      </span>
                    </div>
                    {documentsLoading ? (
                      <div className="text-center py-8 text-gray-500">불러오는 중...</div>
                    ) : documents.length === 0 ? (
                      <>
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                          <p className="text-3xl mb-2">📄</p>
                          <p>등록된 서류가 없습니다.</p>
                        </div>
                        <button
                          onClick={() => openAddModal('document')}
                          className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                          + 서류 추가하기
                        </button>
                      </>
                    ) : (
                      <>
                        {documents.map(doc => {
                          const docKey = `doc-${doc.id}`;
                          const isExpanded = expandedCards[docKey];
                          return (
                            <div key={doc.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleCard('doc', doc.id, doc.fileName, doc.filePath)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      doc.filePath ? 'bg-green-50' : 'bg-yellow-50'
                                    }`}>
                                      <span className="text-lg">{doc.filePath ? '✅' : '📋'}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{doc.name}</p>
                                      <p className="text-xs text-gray-500">
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mr-1">
                                          {DOC_CATEGORY_LABELS[doc.category] || doc.category}
                                        </span>
                                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR') : '미등록'}
                                        {doc.isRequired && <span className="ml-2 text-red-500 font-medium">필수</span>}
                                      </p>
                                      {doc.fileName && (
                                        <p className="text-xs text-blue-600 mt-0.5">{doc.fileName}</p>
                                      )}
                                    </div>
                                  </div>
                                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  {doc.filePath && (
                                    <div className="mt-3 mb-3">
                                      {isImageFile(doc.fileName) ? (
                                        previewUrls[docKey] ? (
                                          <img
                                            src={previewUrls[docKey]}
                                            alt={doc.fileName}
                                            className="w-full max-h-60 object-contain rounded-lg bg-gray-50 border border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">
                                            미리보기 로딩 중...
                                          </div>
                                        )
                                      ) : isPdfFile(doc.fileName) ? (
                                        previewUrls[docKey] ? (
                                          <iframe
                                            src={previewUrls[docKey]}
                                            title={doc.fileName}
                                            className="w-full h-60 rounded-lg border border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">
                                            PDF 로딩 중...
                                          </div>
                                        )
                                      ) : (
                                        <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-4xl mb-2">📎</span>
                                          <p className="text-sm text-gray-700 font-medium">첨부파일</p>
                                          <p className="text-xs text-gray-500">{doc.fileName}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      ref={el => { fileInputRefs.current[doc.id] = el; }}
                                      className="hidden"
                                      onChange={e => {
                                        if (e.target.files[0]) handleFileUpload(doc.id, e.target.files[0]);
                                        e.target.value = '';
                                      }}
                                    />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); fileInputRefs.current[doc.id]?.click(); }}
                                      className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      {doc.filePath ? '파일 변경' : '파일 첨부'}
                                    </button>
                                    {doc.filePath && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleFileDownload(doc.id, doc.fileName); }}
                                        className="flex-1 py-2 px-3 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                      >
                                        다운로드
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id); }}
                                      className="py-2 px-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button
                          onClick={() => openAddModal('document')}
                          className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                          + 서류 추가하기
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* 특약 사항 */}
                {activeSubTab === 'terms' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">특약 사항</h3>
                      <span className="text-sm text-gray-500">
                        {specialTerms.filter(t => t.isConfirmed).length}/{specialTerms.length} 확인
                      </span>
                    </div>
                    {termsLoading ? (
                      <div className="text-center py-8 text-gray-500">불러오는 중...</div>
                    ) : specialTerms.length === 0 ? (
                      <>
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                          <p className="text-3xl mb-2">📝</p>
                          <p>등록된 특약사항이 없습니다.</p>
                        </div>
                        <button
                          onClick={() => openAddModal('term')}
                          className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                          + 특약사항 추가하기
                        </button>
                      </>
                    ) : (
                      <>
                        {specialTerms.map(term => {
                          const termKey = `term-${term.id}`;
                          const isExpanded = expandedCards[termKey];
                          return (
                            <div key={term.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleCard('term', term.id, term.fileName, term.filePath)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleToggleTermConfirm(term.id); }}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        term.isConfirmed ? 'bg-green-50' : 'bg-yellow-50'
                                      }`}
                                    >
                                      <span className="text-lg">{term.isConfirmed ? '✅' : '⬜'}</span>
                                    </button>
                                    <div>
                                      <p className="font-medium text-gray-900">{term.content}</p>
                                      <p className="text-xs text-gray-500">
                                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mr-1">
                                          {CATEGORY_LABELS[term.category] || term.category}
                                        </span>
                                        {term.createdAt ? new Date(term.createdAt).toLocaleDateString('ko-KR') : ''}
                                      </p>
                                      {term.fileName && (
                                        <p className="text-xs text-blue-600 mt-0.5">{term.fileName}</p>
                                      )}
                                    </div>
                                  </div>
                                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  {term.filePath && (
                                    <div className="mt-3 mb-3">
                                      {isImageFile(term.fileName) ? (
                                        previewUrls[termKey] ? (
                                          <img
                                            src={previewUrls[termKey]}
                                            alt={term.fileName}
                                            className="w-full max-h-60 object-contain rounded-lg bg-gray-50 border border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">
                                            미리보기 로딩 중...
                                          </div>
                                        )
                                      ) : isPdfFile(term.fileName) ? (
                                        previewUrls[termKey] ? (
                                          <iframe
                                            src={previewUrls[termKey]}
                                            title={term.fileName}
                                            className="w-full h-60 rounded-lg border border-gray-200"
                                          />
                                        ) : (
                                          <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">
                                            PDF 로딩 중...
                                          </div>
                                        )
                                      ) : (
                                        <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                          <span className="text-4xl mb-2">📎</span>
                                          <p className="text-sm text-gray-700 font-medium">첨부파일</p>
                                          <p className="text-xs text-gray-500">{term.fileName}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      ref={el => { termFileInputRefs.current[term.id] = el; }}
                                      className="hidden"
                                      onChange={e => {
                                        if (e.target.files[0]) handleTermFileUpload(term.id, e.target.files[0]);
                                        e.target.value = '';
                                      }}
                                    />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); termFileInputRefs.current[term.id]?.click(); }}
                                      className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      {term.filePath ? '파일 변경' : '파일 첨부'}
                                    </button>
                                    {term.filePath && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleTermFileDownload(term.id, term.fileName); }}
                                        className="flex-1 py-2 px-3 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                      >
                                        다운로드
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSpecialTerm(term.id); }}
                                      className="py-2 px-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button
                          onClick={() => openAddModal('term')}
                          className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                        >
                          + 특약사항 추가하기
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
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

      {/* ========== Modal ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* 계약 등록 모달 */}
            {modalType === 'contract' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">계약 등록</h3>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">계약 유형</label>
                    <select
                      value={contractForm.type}
                      onChange={e => setContractForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="JEONSE">전세</option>
                      <option value="MONTHLY">월세</option>
                      <option value="SEMI_JEONSE">반전세</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contractForm.address}
                        readOnly
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 cursor-pointer"
                        placeholder="주소 검색을 눌러주세요"
                        onClick={openDaumPostcode}
                      />
                      <button
                        type="button"
                        onClick={openDaumPostcode}
                        className="px-4 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                    <input
                      type="text"
                      value={contractForm.addressDetail}
                      onChange={e => setContractForm(prev => ({ ...prev, addressDetail: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="동/호수 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">보증금 (원)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(contractForm.jeonseDeposit)}
                      onChange={e => setContractForm(prev => ({ ...prev, jeonseDeposit: parseMoney(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  {(contractForm.type === 'MONTHLY' || contractForm.type === 'SEMI_JEONSE') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">월세 (원)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatMoney(contractForm.monthlyRent)}
                        onChange={e => setContractForm(prev => ({ ...prev, monthlyRent: parseMoney(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">관리비 (원)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(contractForm.maintenanceFee)}
                      onChange={e => setContractForm(prev => ({ ...prev, maintenanceFee: parseMoney(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
                      <input
                        type="date"
                        value={contractForm.startDate}
                        onChange={e => setContractForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">종료일 *</label>
                      <input
                        type="date"
                        value={contractForm.endDate}
                        onChange={e => setContractForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateContract}
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? '저장 중...' : '등록하기'}
                  </button>
                </div>
              </>
            )}

            {/* 계약 수정 모달 */}
            {modalType === 'editContract' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">계약 정보 수정</h3>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">계약 유형</label>
                    <select
                      value={contractForm.type}
                      onChange={e => setContractForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="JEONSE">전세</option>
                      <option value="MONTHLY">월세</option>
                      <option value="SEMI_JEONSE">반전세</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contractForm.address}
                        readOnly
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 cursor-pointer"
                        placeholder="주소 검색을 눌러주세요"
                        onClick={openDaumPostcode}
                      />
                      <button
                        type="button"
                        onClick={openDaumPostcode}
                        className="px-4 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                    <input
                      type="text"
                      value={contractForm.addressDetail}
                      onChange={e => setContractForm(prev => ({ ...prev, addressDetail: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="동/호수 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">보증금 (원)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(contractForm.jeonseDeposit)}
                      onChange={e => setContractForm(prev => ({ ...prev, jeonseDeposit: parseMoney(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  {(contractForm.type === 'MONTHLY' || contractForm.type === 'SEMI_JEONSE') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">월세 (원)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatMoney(contractForm.monthlyRent)}
                        onChange={e => setContractForm(prev => ({ ...prev, monthlyRent: parseMoney(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">관리비 (원)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(contractForm.maintenanceFee)}
                      onChange={e => setContractForm(prev => ({ ...prev, maintenanceFee: parseMoney(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
                      <input
                        type="date"
                        value={contractForm.startDate}
                        onChange={e => setContractForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">종료일 *</label>
                      <input
                        type="date"
                        value={contractForm.endDate}
                        onChange={e => setContractForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateContract}
                      disabled={submitting}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      {submitting ? '저장 중...' : '저장하기'}
                    </button>
                    <button
                      onClick={handleDeleteContract}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 서류 추가 모달 */}
            {modalType === 'document' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">서류 추가</h3>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">서류명 *</label>
                    <input
                      type="text"
                      value={docForm.name}
                      onChange={e => setDocForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 임대차 계약서"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
                    <select
                      value={docForm.category}
                      onChange={e => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CONTRACT">계약</option>
                      <option value="REGISTRATION">등기</option>
                      <option value="CHECKIN">전입</option>
                      <option value="OTHER">기타</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.isRequired}
                      onChange={e => setDocForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">필수 서류</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      ref={docFileInputRef}
                      className="hidden"
                      onChange={e => {
                        if (e.target.files[0]) setDocForm(prev => ({ ...prev, file: e.target.files[0] }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => docFileInputRef.current?.click()}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {docForm.file ? (
                        <span className="text-gray-900">{docForm.file.name}</span>
                      ) : (
                        <span className="text-gray-400">파일을 선택해주세요 (선택사항)</span>
                      )}
                    </button>
                    {docForm.file && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocForm(prev => ({ ...prev, file: null }));
                          if (docFileInputRef.current) docFileInputRef.current.value = '';
                        }}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        첨부 취소
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleCreateDocument}
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? '저장 중...' : '추가하기'}
                  </button>
                </div>
              </>
            )}

            {/* 특약사항 추가 모달 */}
            {modalType === 'term' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">특약사항 추가</h3>
                  <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
                    <select
                      value={termForm.category}
                      onChange={e => setTermForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="REPAIR">수리</option>
                      <option value="FACILITY">시설</option>
                      <option value="DEPOSIT">보증금</option>
                      <option value="OTHER">기타</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
                    <textarea
                      value={termForm.content}
                      onChange={e => setTermForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      placeholder="특약사항 내용을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      ref={termFileInputRef}
                      className="hidden"
                      onChange={e => {
                        if (e.target.files[0]) setTermForm(prev => ({ ...prev, file: e.target.files[0] }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => termFileInputRef.current?.click()}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {termForm.file ? (
                        <span className="text-gray-900">{termForm.file.name}</span>
                      ) : (
                        <span className="text-gray-400">파일을 선택해주세요 (선택사항)</span>
                      )}
                    </button>
                    {termForm.file && (
                      <button
                        type="button"
                        onClick={() => {
                          setTermForm(prev => ({ ...prev, file: null }));
                          if (termFileInputRef.current) termFileInputRef.current.value = '';
                        }}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        첨부 취소
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleCreateSpecialTerm}
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {submitting ? '저장 중...' : '추가하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

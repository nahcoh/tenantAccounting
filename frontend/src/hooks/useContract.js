import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api';

export default function useContract() {
  const [contract, setContract] = useState(null);
  const [contractLoading, setContractLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [specialTerms, setSpecialTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [checklists, setChecklists] = useState([]);
  const [checklistsLoading, setChecklistsLoading] = useState(false);
  const [maintenances, setMaintenances] = useState([]);
  const [maintenancesLoading, setMaintenancesLoading] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});

  const [contractForm, setContractForm] = useState({
    type: 'JEONSE', address: '', addressDetail: '', jeonseDeposit: '', monthlyRent: '',
    maintenanceFee: '', startDate: '', endDate: ''
  });
  const fileInputRefs = useRef({});
  const [docForm, setDocForm] = useState({ name: '', category: 'CONTRACT', phase: null, isRequired: false, file: null });
  const docFileInputRef = useRef(null);
  const [termForm, setTermForm] = useState({ category: 'REPAIR', phase: null, content: '', file: null });
  const termFileInputRef = useRef(null);
  const termFileInputRefs = useRef({});
  const [checklistForm, setChecklistForm] = useState({ phase: 'PRE_CONTRACT', category: 'VERIFICATION', title: '', description: '', isRequired: false });
  const [moveOutChecklistForm, setMoveOutChecklistForm] = useState({ phase: 'MOVE_OUT', category: 'MOVE_OUT', title: '', description: '', isRequired: false });
  const checklistFileInputRefs = useRef({});
  const [maintenanceForm, setMaintenanceForm] = useState({ title: '', category: 'REPAIR', description: '', cost: '', paidBy: 'LANDLORD' });
  const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');

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

  // Fetch documents, special terms & checklists when contract changes
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

    const fetchChecklists = async () => {
      setChecklistsLoading(true);
      try {
        let res = await api.get(`/api/contracts/${contract.id}/checklists`);
        // 체크리스트가 비어있으면 기본 체크리스트 초기화
        if (res.data.length === 0) {
          res = await api.post(`/api/contracts/${contract.id}/checklists/initialize`);
        }
        setChecklists(res.data);
      } catch (err) {
        console.error('Failed to fetch checklists:', err);
      } finally {
        setChecklistsLoading(false);
      }
    };

    const fetchMaintenances = async () => {
      setMaintenancesLoading(true);
      try {
        const res = await api.get(`/api/contracts/${contract.id}/maintenances`);
        setMaintenances(res.data);
      } catch (err) {
        console.error('Failed to fetch maintenances:', err);
      } finally {
        setMaintenancesLoading(false);
      }
    };

    fetchDocuments();
    fetchSpecialTerms();
    fetchChecklists();
    fetchMaintenances();
  }, [contract?.id]);

  // 단계별 필터링된 데이터
  const filteredDocuments = useMemo(() => {
    if (selectedPhase === 'ALL') return documents;
    return documents.filter(doc => doc.phase === selectedPhase);
  }, [documents, selectedPhase]);

  const filteredTerms = useMemo(() => {
    if (selectedPhase === 'ALL') return specialTerms;
    return specialTerms.filter(term => term.phase === selectedPhase);
  }, [specialTerms, selectedPhase]);

  const filteredChecklists = useMemo(() => {
    if (selectedPhase === 'ALL') return checklists;
    return checklists.filter(item => item.phase === selectedPhase);
  }, [checklists, selectedPhase]);

  // 퇴거 체크리스트만 필터링
  const moveOutChecklists = useMemo(() => {
    return checklists.filter(item => item.phase === 'MOVE_OUT');
  }, [checklists]);

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
        phase: docForm.phase || null,
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
      setDocForm({ name: '', category: 'CONTRACT', phase: null, isRequired: false, file: null });
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
        phase: termForm.phase || null,
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
      setTermForm({ category: 'REPAIR', phase: null, content: '', file: null });
    } catch (err) {
      alert('특약사항 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateChecklist = async () => {
    if (!checklistForm.title) { alert('항목명을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/contracts/${contract.id}/checklists`, {
        phase: checklistForm.phase,
        category: checklistForm.category,
        title: checklistForm.title,
        description: checklistForm.description,
        isRequired: checklistForm.isRequired,
      });
      const res = await api.get(`/api/contracts/${contract.id}/checklists`);
      setChecklists(res.data);
      setShowAddModal(false);
      setChecklistForm({ phase: 'PRE_CONTRACT', category: 'VERIFICATION', title: '', description: '', isRequired: false });
    } catch (err) {
      alert('체크리스트 항목 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMoveOutChecklist = async () => {
    if (!moveOutChecklistForm.title) { alert('항목명을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/api/contracts/${contract.id}/checklists`, {
        phase: 'MOVE_OUT',
        category: moveOutChecklistForm.category,
        title: moveOutChecklistForm.title,
        description: moveOutChecklistForm.description,
        isRequired: moveOutChecklistForm.isRequired,
      });
      const res = await api.get(`/api/contracts/${contract.id}/checklists`);
      setChecklists(res.data);
      setShowAddModal(false);
      setMoveOutChecklistForm({ phase: 'MOVE_OUT', category: 'MOVE_OUT', title: '', description: '', isRequired: false });
    } catch (err) {
      alert('퇴거 체크리스트 항목 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleChecklistComplete = async (checklistId) => {
    try {
      const res = await api.patch(`/api/checklists/${checklistId}/complete`);
      setChecklists(prev => prev.map(item => item.id === checklistId ? res.data : item));
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDeleteChecklist = async (checklistId) => {
    if (!window.confirm('이 체크리스트 항목을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/checklists/${checklistId}`);
      setChecklists(prev => prev.filter(item => item.id !== checklistId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleChecklistFileUpload = async (checklistId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/api/checklists/${checklistId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setChecklists(prev => prev.map(item => item.id === checklistId ? res.data : item));
    } catch (err) {
      const message = err.response?.data?.message || '파일 업로드에 실패했습니다. (PDF, JPG, PNG만 가능)';
      alert(message);
      console.error(err);
    }
  };

  const handleChecklistFileDownload = async (checklistId, fileName) => {
    try {
      const res = await api.get(`/api/checklists/${checklistId}/download`, { responseType: 'blob' });
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

  const handleChecklistFileDelete = async (checklistId) => {
    if (!window.confirm('첨부 파일을 삭제하시겠습니까?')) return;
    try {
      const res = await api.delete(`/api/checklists/${checklistId}/file`);
      setChecklists(prev => prev.map(item => item.id === checklistId ? res.data : item));
    } catch (err) {
      alert('파일 삭제에 실패했습니다.');
      console.error(err);
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
      await api.post(`/api/documents/${docId}/upload`, formData);
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
      await api.post(`/api/special-terms/${termId}/upload`, formData);
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

  // Maintenance handlers
  const handleCreateMaintenance = async () => {
    if (!maintenanceForm.title) { alert('제목을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const maintenanceRes = await api.post(`/api/contracts/${contract.id}/maintenances`, {
        title: maintenanceForm.title,
        category: maintenanceForm.category,
        description: maintenanceForm.description,
        cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : null,
        paidBy: maintenanceForm.paidBy,
      });

      // 임차인 부담(TENANT)이고 비용이 있으면 캘린더에 등록
      if (maintenanceForm.paidBy === 'TENANT' && maintenanceForm.cost && Number(maintenanceForm.cost) > 0) {
        try {
          const today = new Date();
          const dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          await api.post('/api/payments', {
            name: `[유지보수] ${maintenanceForm.title}`,
            category: 'MAINTENANCE',
            amount: Number(maintenanceForm.cost),
            paymentDay: today.getDate(),
            dueDate: dueDate,
            isRecurring: false,
            autoPay: false,
            status: 'UPCOMING',
            sourceType: 'MAINTENANCE',
            sourceId: maintenanceRes.data.id,
          });
        } catch (syncErr) {
          console.error('납부일정 등록 실패:', syncErr);
        }
      }

      const res = await api.get(`/api/contracts/${contract.id}/maintenances`);
      setMaintenances(res.data);
      setShowAddModal(false);
      setMaintenanceForm({ title: '', category: 'REPAIR', description: '', cost: '', paidBy: 'LANDLORD' });
    } catch (err) {
      alert('유지보수 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMaintenance = async (maintenanceId) => {
    if (!maintenanceForm.title) { alert('제목을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const newCost = maintenanceForm.cost ? Number(maintenanceForm.cost) : null;
      const newPaidBy = maintenanceForm.paidBy;

      const res = await api.put(`/api/maintenances/${maintenanceId}`, {
        title: maintenanceForm.title,
        category: maintenanceForm.category,
        description: maintenanceForm.description,
        cost: newCost,
        paidBy: newPaidBy,
      });

      // 연관된 납부일정 업데이트/생성/삭제
      try {
        const paymentsRes = await api.get(`/api/payments/source/MAINTENANCE/${maintenanceId}`);
        const existingPayments = paymentsRes.data;

        if (newPaidBy === 'TENANT' && newCost && newCost > 0) {
          // 임차인 부담이고 비용이 있으면
          if (existingPayments.length > 0) {
            // 기존 납부일정 업데이트
            for (const payment of existingPayments) {
              await api.put(`/api/payments/${payment.id}`, {
                name: `[유지보수] ${maintenanceForm.title}`,
                category: 'MAINTENANCE',
                amount: newCost,
                paymentDay: payment.paymentDay,
                isRecurring: false,
                autoPay: false,
              });
            }
          } else {
            // 새로 납부일정 생성
            const today = new Date();
            const dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            await api.post('/api/payments', {
              name: `[유지보수] ${maintenanceForm.title}`,
              category: 'MAINTENANCE',
              amount: newCost,
              paymentDay: today.getDate(),
              dueDate: dueDate,
              isRecurring: false,
              autoPay: false,
              status: 'UPCOMING',
              sourceType: 'MAINTENANCE',
              sourceId: maintenanceId,
            });
          }
        } else {
          // 임차인 부담이 아니거나 비용이 없으면 기존 납부일정 삭제
          if (existingPayments.length > 0) {
            await api.delete(`/api/payments/source/MAINTENANCE/${maintenanceId}`);
          }
        }
      } catch (syncErr) {
        console.error('납부일정 동기화 실패:', syncErr);
      }

      setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
      setShowAddModal(false);
      setEditingMaintenanceId(null);
      setMaintenanceForm({ title: '', category: 'REPAIR', description: '', cost: '', paidBy: 'LANDLORD' });
    } catch (err) {
      alert('유지보수 수정에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditMaintenanceModal = (maintenance) => {
    setMaintenanceForm({
      title: maintenance.title || '',
      category: maintenance.category || 'REPAIR',
      description: maintenance.description || '',
      cost: maintenance.cost ? String(maintenance.cost) : '',
      paidBy: maintenance.paidBy || 'LANDLORD',
    });
    setEditingMaintenanceId(maintenance.id);
    setModalType('editMaintenance');
    setShowAddModal(true);
  };

  const handleUpdateMaintenanceStatus = async (maintenanceId, status) => {
    try {
      const res = await api.patch(`/api/maintenances/${maintenanceId}/status?status=${status}`);
      setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));

      // 완료 상태로 변경 시 연관된 납부일정도 납부완료 처리
      if (status === 'COMPLETED') {
        try {
          const paymentsRes = await api.get(`/api/payments/source/MAINTENANCE/${maintenanceId}`);
          const payments = paymentsRes.data;
          for (const payment of payments) {
            await api.patch(`/api/payments/${payment.id}/status?status=PAID`);
          }
        } catch (syncErr) {
          console.error('납부일정 상태 동기화 실패:', syncErr);
        }
      }
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDeleteMaintenance = async (maintenanceId) => {
    if (!window.confirm('이 유지보수 기록을 삭제하시겠습니까?\n관련 납부일정도 함께 삭제됩니다.')) return;
    try {
      // 관련 납부일정 먼저 삭제
      try {
        await api.delete(`/api/payments/source/MAINTENANCE/${maintenanceId}`);
      } catch (syncErr) {
        console.error('납부일정 삭제 실패:', syncErr);
      }
      // 유지보수 기록 삭제
      await api.delete(`/api/maintenances/${maintenanceId}`);
      setMaintenances(prev => prev.filter(item => item.id !== maintenanceId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleMaintenanceFileUpload = async (maintenanceId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/api/maintenances/${maintenanceId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
    } catch (err) {
      const message = err.response?.data?.message || '파일 업로드에 실패했습니다. (PDF, JPG, PNG만 가능)';
      alert(message);
      console.error(err);
    }
  };

  const handleMaintenanceFileDownload = async (maintenanceId, fileName) => {
    try {
      const res = await api.get(`/api/maintenances/${maintenanceId}/download`, { responseType: 'blob' });
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

  const handleMaintenanceFileDelete = async (maintenanceId) => {
    if (!window.confirm('첨부 파일을 삭제하시겠습니까?')) return;
    try {
      const res = await api.delete(`/api/maintenances/${maintenanceId}/file`);
      setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
    } catch (err) {
      alert('파일 삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setModalType('');
    setEditingMaintenanceId(null);
    setMaintenanceForm({ title: '', category: 'REPAIR', description: '', cost: '', paidBy: 'LANDLORD' });
  };

  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setContractForm(prev => ({ ...prev, address: data.roadAddress || data.jibunAddress }));
      },
    }).open();
  };

  return {
    contract, contractLoading, documents, documentsLoading,
    specialTerms, termsLoading, submitting,
    checklists, checklistsLoading,
    maintenances, maintenancesLoading,
    filteredDocuments, filteredTerms, filteredChecklists,
    moveOutChecklists,
    selectedPhase, setSelectedPhase,
    expandedCards, previewUrls,
    contractForm, setContractForm, fileInputRefs,
    docForm, setDocForm, docFileInputRef,
    termForm, setTermForm, termFileInputRef, termFileInputRefs,
    checklistForm, setChecklistForm,
    moveOutChecklistForm, setMoveOutChecklistForm,
    checklistFileInputRefs,
    maintenanceForm, setMaintenanceForm,
    showAddModal, modalType,
    handleCreateContract, handleUpdateContract, handleDeleteContract,
    openEditContractModal,
    handleCreateDocument, handleDeleteDocument,
    handleCreateSpecialTerm, handleDeleteSpecialTerm,
    handleToggleTermConfirm,
    handleCreateChecklist, handleToggleChecklistComplete, handleDeleteChecklist,
    handleChecklistFileUpload, handleChecklistFileDownload, handleChecklistFileDelete,
    handleCreateMoveOutChecklist,
    handleCreateMaintenance, handleUpdateMaintenance, handleUpdateMaintenanceStatus, handleDeleteMaintenance,
    openEditMaintenanceModal, editingMaintenanceId,
    handleMaintenanceFileUpload, handleMaintenanceFileDownload, handleMaintenanceFileDelete,
    handleFileUpload, handleFileDownload,
    handleTermFileUpload, handleTermFileDownload,
    toggleCard, openAddModal, closeModal, openDaumPostcode,
  };
}

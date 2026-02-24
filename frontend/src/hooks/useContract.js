import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../api';

export default function useContract(options = {}) {
  const { activeSection = '' } = options;
  const shouldLoadContractDetails = activeSection === 'before' || activeSection === 'during' || activeSection === 'after';

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

  // 헬퍼: 파일명을 WAF가 좋아하는 안전한 영문으로 변환
  const getSafeFile = (file) => {
    const ext = file.name.split('.').pop();
    const newName = `upload_${Date.now()}.${ext}`;
    // 원본 파일을 복사하되 이름을 바꾼 새로운 File 객체 생성
    return new File([file], newName, { type: file.type });
  };

  // Fetch contracts on mount
  useEffect(() => {
    const fetchContracts = async () => {
      setContractLoading(true);
      try {
        const res = await api.get('/contracts');
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

  // 계약 상세 데이터는 비용관리 진입 시점에는 지연 로딩하고,
  // before/during/after 섹션에서만 조회한다.
  useEffect(() => {
    if (!contract?.id || !shouldLoadContractDetails) return;

    const fetchDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const res = await api.get(`/contracts/${contract.id}/documents`);
        setDocuments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setDocumentsLoading(false);
      }
    };

    const fetchSpecialTerms = async () => {
      setTermsLoading(true);
      try {
        const res = await api.get(`/contracts/${contract.id}/special-terms`);
        setSpecialTerms(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch special terms:', err);
      } finally {
        setTermsLoading(false);
      }
    };

    const fetchChecklists = async () => {
      setChecklistsLoading(true);
      try {
        let res = await api.get(`/contracts/${contract.id}/checklists`);
        if (res.data && res.data.length === 0) {
          res = await api.post(`/contracts/${contract.id}/checklists/initialize`);
        }
        setChecklists(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch checklists:', err);
      } finally {
        setChecklistsLoading(false);
      }
    };

    const fetchMaintenances = async () => {
      setMaintenancesLoading(true);
      try {
        const res = await api.get(`/contracts/${contract.id}/maintenances`);
        setMaintenances(Array.isArray(res.data) ? res.data : []);
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
  }, [contract?.id, shouldLoadContractDetails]);

  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    if (selectedPhase === 'ALL') return documents;
    return documents.filter(doc => doc.phase === selectedPhase);
  }, [documents, selectedPhase]);

  const filteredTerms = useMemo(() => {
    if (!Array.isArray(specialTerms)) return [];
    if (selectedPhase === 'ALL') return specialTerms;
    return specialTerms.filter(term => term.phase === selectedPhase);
  }, [specialTerms, selectedPhase]);

  const filteredChecklists = useMemo(() => {
    if (!Array.isArray(checklists)) return [];
    if (selectedPhase === 'ALL') return checklists;
    return checklists.filter(item => item.phase === selectedPhase);
  }, [checklists, selectedPhase]);

  const moveOutChecklists = useMemo(() => {
    if (!Array.isArray(checklists)) return [];
    return checklists.filter(item => item.phase === 'MOVE_OUT');
  }, [checklists]);

  const handleCreateContract = async () => {
    if (!contractForm.address || !contractForm.startDate || !contractForm.endDate) {
      alert('주소, 시작일, 종료일은 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = contractForm.addressDetail ? `${contractForm.address} ${contractForm.addressDetail}` : contractForm.address;
      const payload = {
        type: contractForm.type,
        address: fullAddress,
        jeonseDeposit: contractForm.jeonseDeposit ? Number(contractForm.jeonseDeposit) : null,
        monthlyRent: contractForm.monthlyRent ? Number(contractForm.monthlyRent) : null,
        maintenanceFee: contractForm.maintenanceFee ? Number(contractForm.maintenanceFee) : null,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
      };
      const res = await api.post('/contracts', payload);
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
      const fullAddress = contractForm.addressDetail ? `${contractForm.address} ${contractForm.addressDetail}` : contractForm.address;
      const payload = {
        type: contractForm.type,
        address: fullAddress,
        jeonseDeposit: contractForm.jeonseDeposit ? Number(contractForm.jeonseDeposit) : null,
        monthlyRent: contractForm.monthlyRent ? Number(contractForm.monthlyRent) : null,
        maintenanceFee: contractForm.maintenanceFee ? Number(contractForm.maintenanceFee) : null,
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
      };
      const res = await api.put(`/contracts/${contract.id}`, payload);
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
    if (!window.confirm('계약을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/contracts/${contract.id}`);
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
      const createRes = await api.post(`/contracts/${contract.id}/documents`, {
        name: docForm.name,
        category: docForm.category,
        phase: docForm.phase || null,
        isRequired: docForm.isRequired,
      });
      if (docForm.file) {
        const formData = new FormData();
        formData.append('file', getSafeFile(docForm.file));
        await api.post(`/documents/${createRes.data.id}/upload`, formData);
      }
      const res = await api.get(`/contracts/${contract.id}/documents`);
      setDocuments(res.data);
      
      // 방금 추가한 서류의 단계로 탭 전환 (사용자가 바로 확인할 수 있도록)
      if (docForm.phase) {
        setSelectedPhase(docForm.phase);
      } else {
        setSelectedPhase('ALL');
      }
      
      setShowAddModal(false);
      setDocForm({ name: '', category: 'CONTRACT', phase: null, isRequired: false, file: null });
    } catch (err) {
      alert('서류 등록에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocumentFile = async (docId) => {
    if (!docId) { console.error('[handleDeleteDocumentFile] ID is missing'); return; }
    if (!window.confirm('이 서류를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/documents/${docId}`);
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
      const createRes = await api.post(`/contracts/${contract.id}/special-terms`, {
        category: termForm.category,
        phase: termForm.phase || null,
        content: termForm.content,
      });
      if (termForm.file) {
        const formData = new FormData();
        formData.append('file', getSafeFile(termForm.file));
        await api.post(`/special-terms/${createRes.data.id}/upload`, formData);
      }
      const res = await api.get(`/contracts/${contract.id}/special-terms`);
      setSpecialTerms(res.data);

      // 방금 추가한 특약사항의 단계로 탭 전환
      if (termForm.phase) {
        setSelectedPhase(termForm.phase);
      } else {
        setSelectedPhase('ALL');
      }

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
      await api.post(`/contracts/${contract.id}/checklists`, {
        phase: checklistForm.phase,
        category: checklistForm.category,
        title: checklistForm.title,
        description: checklistForm.description,
        isRequired: checklistForm.isRequired,
      });
      const res = await api.get(`/contracts/${contract.id}/checklists`);
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
      await api.post(`/contracts/${contract.id}/checklists`, {
        phase: 'MOVE_OUT',
        category: moveOutChecklistForm.category,
        title: moveOutChecklistForm.title,
        description: moveOutChecklistForm.description,
        isRequired: moveOutChecklistForm.isRequired,
      });
      const res = await api.get(`/contracts/${contract.id}/checklists`);
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
      const res = await api.patch(`/checklists/${checklistId}/complete`);
      if (res.data && res.data.id) {
        setChecklists(prev => prev.map(item => item.id === checklistId ? res.data : item));
      }
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDeleteChecklistItem = async (checklistId) => {
    if (!checklistId) { console.error('[handleDeleteChecklistItem] ID is missing'); return; }
    if (!window.confirm('이 체크리스트 항목을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/checklists/${checklistId}`);
      setChecklists(prev => prev.filter(item => item.id !== checklistId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleChecklistFileUpload = async (checklistId, file) => {
    console.log('[handleChecklistFileUpload] Start:', { checklistId, fileName: file.name });
    setSubmitting(true);
    const formData = new FormData();
    // 한글 파일명을 피하기 위해 안전한 영문 이름으로 교체하여 전송
    formData.append('file', getSafeFile(file));
    
    try {
      const res = await api.post(`/checklists/${checklistId}/upload`, formData);
      console.log('[handleChecklistFileUpload] Success:', res.data);
      
      if (res.data && res.data.id) {
        setChecklists(prev => prev.map(item => 
          item.id === checklistId ? { ...item, ...res.data } : item
        ));
      }
    } catch (err) {
      if (err.response?.status === 403 && contract?.id) {
        try {
          const refresh = await api.get(`/contracts/${contract.id}/checklists`);
          setChecklists(Array.isArray(refresh.data) ? refresh.data : []);
        } catch (refreshErr) {
          console.error('[handleChecklistFileUpload] Refresh after 403 failed:', refreshErr);
        }
      }
      if (err.message === 'API_ROUTE_ERROR') {
        alert('파일 업로드가 보안 정책에 의해 차단되었습니다. 파일 크기를 줄이거나 잠시 후 다시 시도해 주세요.');
      } else {
        const message = err.response?.data?.message || '파일 업로드에 실패했습니다.';
        alert(message);
      }
      console.error('[handleChecklistFileUpload] Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChecklistFileDownload = async (checklistId, fileName) => {
    try {
      const res = await api.get(`/checklists/${checklistId}/download`, { responseType: 'blob' });
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
    setSubmitting(true);
    try {
      const res = await api.delete(`/checklists/${checklistId}/file`);
      if (res.data && res.data.id) {
        setChecklists(prev => prev.map(item => item.id === checklistId ? res.data : item));
      }
    } catch (err) {
      alert('파일 삭제에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpecialTerm = async (termId) => {
    if (!window.confirm('이 특약사항을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/special-terms/${termId}`);
      setSpecialTerms(prev => prev.filter(t => t.id !== termId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleToggleTermConfirm = async (termId) => {
    try {
      const res = await api.patch(`/special-terms/${termId}/confirm`);
      if (res.data && res.data.id) {
        setSpecialTerms(prev => prev.map(t => t.id === termId ? res.data : t));
      }
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleFileUpload = async (docId, file) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', getSafeFile(file));
    try {
      const res = await api.post(`/documents/${docId}/upload`, formData);
      if (res.data && res.data.id) {
        setDocuments(prev => prev.map(doc => doc.id === docId ? res.data : doc));
      }
    } catch (err) {
      alert('파일 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' });
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
    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', getSafeFile(file));
    try {
      const res = await api.post(`/special-terms/${termId}/upload`, formData);
      if (res.data && res.data.id) {
        setSpecialTerms(prev => prev.map(term => term.id === termId ? res.data : term));
      }
    } catch (err) {
      alert('파일 업로드에 실패했습니다.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTermFileDownload = async (termId, fileName) => {
    try {
      const res = await api.get(`/special-terms/${termId}/download`, { responseType: 'blob' });
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
          const res = await api.get(`/${endpoint}/${id}/preview`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          setPreviewUrls(prev => ({ ...prev, [key]: url }));
        } catch (err) {
          console.error('Preview load failed:', err);
        }
      }
    }
  };

  const handleCreateMaintenance = async () => {
    if (!maintenanceForm.title) { alert('제목을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/contracts/${contract.id}/maintenances`, {
        title: maintenanceForm.title,
        category: maintenanceForm.category,
        description: maintenanceForm.description,
        cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : null,
        paidBy: maintenanceForm.paidBy,
      });
      const res = await api.get(`/contracts/${contract.id}/maintenances`);
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
      const res = await api.put(`/maintenances/${maintenanceId}`, {
        title: maintenanceForm.title,
        category: maintenanceForm.category,
        description: maintenanceForm.description,
        cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : null,
        paidBy: maintenanceForm.paidBy,
      });
      if (res.data && res.data.id) {
        setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
      }
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
      const res = await api.patch(`/maintenances/${maintenanceId}/status?status=${status}`);
      if (res.data && res.data.id) {
        setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
      }
    } catch (err) {
      alert('상태 변경에 실패했습니다.');
      console.error(err);
    }
  };

  const handleDeleteMaintenance = async (maintenanceId) => {
    if (!window.confirm('이 유지보수 기록을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/maintenances/${maintenanceId}`);
      setMaintenances(prev => prev.filter(item => item.id !== maintenanceId));
    } catch (err) {
      alert('삭제에 실패했습니다.');
      console.error(err);
    }
  };

  const handleMaintenanceFileUpload = async (maintenanceId, file) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', getSafeFile(file));
    try {
      const res = await api.post(`/maintenances/${maintenanceId}/upload`, formData);
      if (res.data && res.data.id) {
        setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
      }
    } catch (err) {
      const message = err.response?.data?.message || '파일 업로드에 실패했습니다.';
      alert(message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaintenanceFileDownload = async (maintenanceId, fileName) => {
    try {
      const res = await api.get(`/maintenances/${maintenanceId}/download`, { responseType: 'blob' });
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
      const res = await api.delete(`/maintenances/${maintenanceId}/file`);
      if (res.data && res.data.id) {
        setMaintenances(prev => prev.map(item => item.id === maintenanceId ? res.data : item));
      }
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
    handleCreateDocument, handleDeleteDocumentFile,
    handleCreateSpecialTerm, handleDeleteSpecialTerm,
    handleToggleTermConfirm,
    handleCreateChecklist, handleToggleChecklistComplete, handleDeleteChecklistItem,
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

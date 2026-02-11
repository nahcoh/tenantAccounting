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

    fetchDocuments();
    fetchSpecialTerms();
    fetchChecklists();
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

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setModalType('');
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
    filteredDocuments, filteredTerms, filteredChecklists,
    selectedPhase, setSelectedPhase,
    expandedCards, previewUrls,
    contractForm, setContractForm, fileInputRefs,
    docForm, setDocForm, docFileInputRef,
    termForm, setTermForm, termFileInputRef, termFileInputRefs,
    checklistForm, setChecklistForm,
    showAddModal, modalType,
    handleCreateContract, handleUpdateContract, handleDeleteContract,
    openEditContractModal,
    handleCreateDocument, handleDeleteDocument,
    handleCreateSpecialTerm, handleDeleteSpecialTerm,
    handleToggleTermConfirm,
    handleCreateChecklist, handleToggleChecklistComplete, handleDeleteChecklist,
    handleChecklistFileUpload, handleChecklistFileDownload, handleChecklistFileDelete,
    handleFileUpload, handleFileDownload,
    handleTermFileUpload, handleTermFileDownload,
    toggleCard, openAddModal, closeModal, openDaumPostcode,
  };
}

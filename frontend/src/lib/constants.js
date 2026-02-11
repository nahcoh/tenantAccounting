export const CATEGORY_LABELS = { REPAIR: '수리', FACILITY: '시설', DEPOSIT: '보증금', OTHER: '기타' };
export const DOC_CATEGORY_LABELS = { CONTRACT: '계약', REGISTRATION: '등기', CHECKIN: '전입', OTHER: '기타' };
export const CONTRACT_TYPE_LABELS = { JEONSE: '전세', MONTHLY: '월세', SEMI_JEONSE: '반전세' };

export const CONTRACT_PHASE_LABELS = {
  PRE_CONTRACT: '계약전',
  ON_CONTRACT: '계약 시',
  POST_CONTRACT: '계약 후'
};

export const CHECKLIST_CATEGORY_LABELS = {
  VERIFICATION: '확인/검증',
  SAFETY: '안전',
  FINANCE: '재정',
  MOVE_IN: '입주'
};

export const CONTRACT_PHASES = [
  { id: 'ALL', label: '전체' },
  { id: 'PRE_CONTRACT', label: '계약전', icon: '📋' },
  { id: 'ON_CONTRACT', label: '계약 시', icon: '✍️' },
  { id: 'POST_CONTRACT', label: '계약 후', icon: '🏠' },
];

// 필수 서류 목록 (기본 표시용)
export const DEFAULT_REQUIRED_DOCUMENTS = [
  { name: '등기부등본', category: 'REGISTRATION', phase: 'PRE_CONTRACT', isRequired: true },
  { name: '건축물대장', category: 'REGISTRATION', phase: 'PRE_CONTRACT', isRequired: true },
  { name: '임대차계약서', category: 'CONTRACT', phase: 'ON_CONTRACT', isRequired: true },
  { name: '신분증 사본', category: 'CONTRACT', phase: 'ON_CONTRACT', isRequired: true },
  { name: '인감증명서', category: 'CONTRACT', phase: 'ON_CONTRACT', isRequired: true },
  { name: '전입신고 확인서', category: 'CHECKIN', phase: 'POST_CONTRACT', isRequired: true },
  { name: '확정일자 확인서', category: 'CHECKIN', phase: 'POST_CONTRACT', isRequired: true },
];

export const PHASES = [
  { id: 'before', label: '입주 전', icon: '📋', color: 'blue', defaultTab: 'documents' },
  { id: 'during', label: '입주 중', icon: '🏠', color: 'green', defaultTab: 'maintenance' },
  { id: 'after', label: '입주 후', icon: '📦', color: 'orange', defaultTab: 'checklist' },
  { id: 'cost', label: '비용 관리', icon: '💰', color: 'purple', defaultTab: 'calendar' },
];

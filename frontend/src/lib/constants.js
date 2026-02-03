export const CATEGORY_LABELS = { REPAIR: '수리', FACILITY: '시설', DEPOSIT: '보증금', OTHER: '기타' };
export const DOC_CATEGORY_LABELS = { CONTRACT: '계약', REGISTRATION: '등기', CHECKIN: '전입', OTHER: '기타' };
export const CONTRACT_TYPE_LABELS = { JEONSE: '전세', MONTHLY: '월세', SEMI_JEONSE: '반전세' };

export const PHASES = [
  { id: 'before', label: '입주 전', icon: '📋', color: 'blue', defaultTab: 'documents' },
  { id: 'during', label: '입주 중', icon: '🏠', color: 'green', defaultTab: 'maintenance' },
  { id: 'after', label: '입주 후', icon: '📦', color: 'orange', defaultTab: 'checklist' },
  { id: 'cost', label: '비용 관리', icon: '💰', color: 'purple', defaultTab: 'calendar' },
];

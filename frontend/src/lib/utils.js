export function getUserNameFromToken() {
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

export const formatMoney = (value) => {
  if (!value && value !== 0) return '';
  return String(value).replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const parseMoney = (formatted) => formatted.replace(/,/g, '');

export const isImageFile = (fileName) => {
  if (!fileName) return false;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
};

export const isPdfFile = (fileName) => {
  if (!fileName) return false;
  return /\.pdf$/i.test(fileName);
};

export const getCategoryIcon = (category) => {
  if (!category) return '💰';
  const icons = { RENT: '🏠', MAINTENANCE: '🔧', LOAN: '🏦', UTILITY: '⚡' };
  return icons[category.toUpperCase()] || '💰';
};

export const getStatusStyle = (status) => {
  if (!status) return { className: 'bg-gray-100 text-gray-500', label: '-' };
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
    REQUESTED: 'bg-orange-50 text-orange-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    PAID: '납부 완료', UPCOMING: '예정', OVERDUE: '연체',
    UPLOADED: '업로드 완료', PENDING: '미등록', COMPLETED: '완료',
    IN_PROGRESS: '진행 중', RECORDED: '기록됨',
    REQUESTED: '요청됨', CANCELLED: '취소',
  };
  return { className: styles[statusUpper] || '', label: labels[statusUpper] || status };
};

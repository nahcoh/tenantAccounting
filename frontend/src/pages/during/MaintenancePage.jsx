import React, { useRef, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getStatusStyle } from '../../lib/utils';
import { MAINTENANCE_CATEGORY_LABELS, PAID_BY_LABELS } from '../../lib/constants';
import api from '../../api';

function StatusBadge({ status }) {
  const { className, label } = getStatusStyle(status);
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{label}</span>;
}

const getCategoryIcon = (category) => {
  const icons = {
    REPAIR: '🔧',
    PLUMBING: '🚿',
    ELECTRIC: '⚡',
    HEATING: '🔥',
    APPLIANCE: '📺',
    OTHER: '📦'
  };
  return icons[category] || '🔧';
};

export default function MaintenancePage() {
  const {
    maintenances, maintenancesLoading, openAddModal, contract,
    handleUpdateMaintenanceStatus, handleDeleteMaintenance,
    handleMaintenanceFileUpload, handleMaintenanceFileDownload, handleMaintenanceFileDelete,
    openEditMaintenanceModal, submitting
  } = useOutletContext();

  if (!contract) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">계약 정보를 먼저 등록해주세요</h3>
        <p className="text-sm text-gray-500">유지보수 기록을 관리하려면 계약 정보가 필요합니다.</p>
      </div>
    );
  }

  const statusCounts = {
    REQUESTED: maintenances.filter(m => m.status === 'REQUESTED').length,
    IN_PROGRESS: maintenances.filter(m => m.status === 'IN_PROGRESS').length,
    COMPLETED: maintenances.filter(m => m.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-4">
      {/* 상태 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{statusCounts.REQUESTED}</p>
          <p className="text-xs text-orange-600">요청됨</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{statusCounts.IN_PROGRESS}</p>
          <p className="text-xs text-blue-600">진행중</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{statusCounts.COMPLETED}</p>
          <p className="text-xs text-green-600">완료</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">유지보수 기록</h3>
        <span className="text-sm text-gray-500">{maintenances.length}건</span>
      </div>

      {maintenancesLoading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : maintenances.length === 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-3xl mb-2">🔧</p>
            <p>등록된 유지보수 기록이 없습니다.</p>
          </div>
          <button
            onClick={() => openAddModal('maintenance')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors font-medium"
          >
            + 유지보수 요청하기
          </button>
        </>
      ) : (
        <>
          {maintenances.map(record => (
            <MaintenanceItem
              key={record.id}
              record={record}
              onUpdateStatus={handleUpdateMaintenanceStatus}
              onDelete={handleDeleteMaintenance}
              onEdit={openEditMaintenanceModal}
              onFileUpload={handleMaintenanceFileUpload}
              onFileDownload={handleMaintenanceFileDownload}
              onFileDelete={handleMaintenanceFileDelete}
              submitting={submitting}
            />
          ))}
          <button
            onClick={() => openAddModal('maintenance')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors font-medium"
          >
            + 유지보수 요청하기
          </button>
        </>
      )}
    </div>
  );
}

function MaintenanceItem({ record, onUpdateStatus, onDelete, onEdit, onFileUpload, onFileDownload, onFileDelete, submitting }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let url = null;
    const fetchPreview = async () => {
      if (record.id && record.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(record.fileName)) {
        try {
          const res = await api.get(`/maintenances/${record.id}/preview`, { responseType: 'blob' });
          url = window.URL.createObjectURL(new Blob([res.data]));
          setPreviewUrl(url);
        } catch (err) {
          console.error('Preview load failed:', err);
        }
      } else {
        setPreviewUrl(null);
      }
    };

    fetchPreview();

    return () => {
      if (url) window.URL.revokeObjectURL(url);
    };
  }, [record.id, record.fileName]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(record.id, file);
      e.target.value = '';
    }
  };

  const prevStatus = {
    IN_PROGRESS: 'REQUESTED',
    COMPLETED: 'IN_PROGRESS',
  };

  const nextStatus = {
    REQUESTED: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
  };

  const prevActions = {
    IN_PROGRESS: '요청으로',
    COMPLETED: '진행중으로',
  };

  const nextActions = {
    REQUESTED: '진행 시작',
    IN_PROGRESS: '완료 처리',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{getCategoryIcon(record.category)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-medium text-gray-900">{record.title}</h4>
              <StatusBadge status={record.status} />
            </div>
            {record.description && (
              <p className="text-sm text-gray-600 mb-2">{record.description}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                {MAINTENANCE_CATEGORY_LABELS[record.category] || record.category}
              </span>
              <span>📅 {new Date(record.createdAt).toLocaleDateString('ko-KR')}</span>
              {record.cost && (
                <span>💰 {Number(record.cost).toLocaleString()}원</span>
              )}
              {record.paidBy && (
                <span>{PAID_BY_LABELS[record.paidBy]}</span>
              )}
            </div>

            {/* 파일 첨부 및 미리보기 */}
            <div className="mt-3 space-y-2">
              {record.fileName ? (
                <div className="flex flex-col gap-2">
                  {previewUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => onFileDownload(record.id, record.fileName)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors font-medium"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {record.fileName}
                    </button>
                    <button
                      onClick={() => onFileDelete(record.id)}
                      disabled={submitting}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="파일 삭제"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 px-2 py-1 text-gray-500 border border-dashed border-gray-300 rounded text-xs hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-50 font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {submitting ? '업로드 중...' : '사진 첨부'}
                  </button>
                </>
              )}
            </div>

            {/* 완료 일시 */}
            {record.completedAt && (
              <p className="text-xs text-green-600 mt-2">
                ✅ {new Date(record.completedAt).toLocaleDateString('ko-KR')} 완료
              </p>
            )}

            {/* 상태 변경 버튼 */}
            <div className="mt-3 flex items-center gap-2">
              {prevStatus[record.status] && (
                <button
                  onClick={() => onUpdateStatus(record.id, prevStatus[record.status])}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← {prevActions[record.status]}
                </button>
              )}
              {nextStatus[record.status] && (
                <button
                  onClick={() => onUpdateStatus(record.id, nextStatus[record.status])}
                  className="px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  {nextActions[record.status]} →
                </button>
              )}
            </div>
          </div>

          {/* 수정/삭제 버튼 */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(record)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="수정"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

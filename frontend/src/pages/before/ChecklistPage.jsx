import React, { useRef, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CONTRACT_PHASE_LABELS, CHECKLIST_CATEGORY_LABELS } from '../../lib/constants';
import api from '../../api';

export default function ChecklistPage() {
  const {
    filteredChecklists, checklistsLoading,
    handleToggleChecklistComplete, handleDeleteChecklistItem, openAddModal,
    handleChecklistFileUpload, handleChecklistFileDownload, handleChecklistFileDelete,
    selectedPhase, submitting
  } = useOutletContext();

  // 단계별로 그룹핑
  const groupedChecklists = filteredChecklists.reduce((acc, item) => {
    const phase = item.phase;
    if (!acc[phase]) acc[phase] = [];
    acc[phase].push(item);
    return acc;
  }, {});

  const phaseOrder = ['PRE_CONTRACT', 'ON_CONTRACT', 'POST_CONTRACT'];

  const getCompletionStats = (items) => {
    const completed = items.filter(item => item.isCompleted).length;
    return { completed, total: items.length };
  };

  const totalStats = getCompletionStats(filteredChecklists);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">체크리스트</h3>
        <span className="text-sm text-gray-500">
          {totalStats.completed}/{totalStats.total} 완료
        </span>
      </div>

      {checklistsLoading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : filteredChecklists.length === 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-3xl mb-2">✅</p>
            <p>등록된 체크리스트 항목이 없습니다.</p>
          </div>
          <button
            onClick={() => openAddModal('checklist')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            + 항목 추가하기
          </button>
        </>
      ) : (
        <>
          {selectedPhase === 'ALL' ? (
            // 전체 보기: 단계별 그룹핑
            phaseOrder.map(phase => {
              const items = groupedChecklists[phase];
              if (!items || items.length === 0) return null;
              const stats = getCompletionStats(items);

              return (
                <div key={phase} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-medium text-gray-700">
                      {CONTRACT_PHASE_LABELS[phase]}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                  {items.map(item => (
                    <ChecklistItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleChecklistComplete}
                      onDelete={handleDeleteChecklistItem}
                      onFileUpload={handleChecklistFileUpload}
                      onFileDownload={handleChecklistFileDownload}
                      onFileDelete={handleChecklistFileDelete}
                      submitting={submitting}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            // 특정 단계 보기: 평면 리스트
            filteredChecklists.map(item => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={handleToggleChecklistComplete}
                onDelete={handleDeleteChecklistItem}
                onFileUpload={handleChecklistFileUpload}
                onFileDownload={handleChecklistFileDownload}
                onFileDelete={handleChecklistFileDelete}
                submitting={submitting}
              />
            ))
          )}
          <button
            onClick={() => openAddModal('checklist')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            + 항목 추가하기
          </button>
        </>
      )}
    </div>
  );
}

function ChecklistItem({ item, onToggle, onDelete, onFileUpload, onFileDownload, onFileDelete, submitting }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let url = null;
    const fetchPreview = async () => {
      if (item.id && item.fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.fileName)) {
        try {
          const res = await api.get(`/checklists/${item.id}/preview`, { responseType: 'blob' });
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
  }, [item.id, item.fileName]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(item.id, file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(item.id)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
              item.isCompleted ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.isCompleted ? '✅' : '⬜'}</span>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-medium ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {item.title}
              </p>
              {item.isRequired && (
                <span className="text-xs text-red-500 font-medium">필수</span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                {CHECKLIST_CATEGORY_LABELS[item.category] || item.category}
              </span>
              {item.completedAt && (
                <span className="text-xs text-gray-400">
                  {new Date(item.completedAt).toLocaleDateString('ko-KR')} 완료
                </span>
              )}
            </div>

            {/* 파일 및 미리보기 영역 */}
            <div className="mt-3 space-y-2">
              {item.fileName ? (
                <div className="flex flex-col gap-2">
                  {previewUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => onFileDownload(item.id, item.fileName)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors font-medium"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {item.fileName}
                    </button>
                    <button
                      onClick={() => onFileDelete(item.id)}
                      disabled={submitting}
                      className="text-red-500 hover:text-red-600 text-xs font-medium disabled:opacity-50"
                    >
                      삭제
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
                    className="inline-flex items-center gap-1 px-2 py-1 text-gray-500 border border-dashed border-gray-300 rounded text-xs hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {submitting ? '업로드 중...' : '파일 첨부'}
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (item.id) onDelete(item.id);
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

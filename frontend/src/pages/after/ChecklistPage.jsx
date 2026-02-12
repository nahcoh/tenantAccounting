import React, { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';

const MOVE_OUT_CATEGORIES = [
  { id: 'DEPOSIT_RETURN', label: '보증금 반환' },
  { id: 'FACILITY_RESTORE', label: '시설물 복구' },
  { id: 'UTILITY_SETTLEMENT', label: '공과금 정산' },
  { id: 'MOVE_OUT', label: '퇴거 절차' },
  { id: 'DOCUMENTATION', label: '서류 정리' },
];

export default function ChecklistPage() {
  const ctx = useOutletContext();
  const {
    contract,
    moveOutChecklists,
    checklistsLoading,
    submitting,
    moveOutChecklistForm,
    setMoveOutChecklistForm,
    checklistFileInputRefs,
    showAddModal,
    modalType,
    handleToggleChecklistComplete,
    handleDeleteChecklist,
    handleChecklistFileUpload,
    handleChecklistFileDownload,
    handleChecklistFileDelete,
    handleCreateMoveOutChecklist,
    openAddModal,
    closeModal,
  } = ctx;

  const localFileInputRefs = useRef({});
  const fileRefs = checklistFileInputRefs || localFileInputRefs;

  if (!contract) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>먼저 계약을 등록해주세요.</p>
      </div>
    );
  }

  if (checklistsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-gray-500">체크리스트를 불러오는 중...</p>
      </div>
    );
  }

  const completedCount = moveOutChecklists.filter(item => item.isCompleted).length;
  const totalCount = moveOutChecklists.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 카테고리별로 그룹화
  const groupedByCategory = moveOutChecklists.reduce((acc, item) => {
    const category = item.category || 'MOVE_OUT';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* 헤더 및 진행률 */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">퇴거 체크리스트</h3>
          <button
            onClick={() => openAddModal('moveOutChecklist')}
            className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            + 항목 추가
          </button>
        </div>

        {/* 진행률 바 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">진행률</span>
            <span className="font-medium text-orange-600">{completedCount}/{totalCount} 완료 ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 체크리스트 목록 (카테고리별) */}
      {moveOutChecklists.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>퇴거 체크리스트가 없습니다.</p>
          <p className="text-sm mt-1">항목을 추가해주세요.</p>
        </div>
      ) : (
        MOVE_OUT_CATEGORIES.map(cat => {
          const items = groupedByCategory[cat.id];
          if (!items || items.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 px-1">{cat.label}</h4>
              {items.map(item => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    item.isCompleted ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 체크박스 */}
                    <button
                      onClick={() => handleToggleChecklistComplete(item.id)}
                      className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-orange-400'
                      }`}
                    >
                      {item.isCompleted && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {item.title}
                        </span>
                        {item.isRequired && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">필수</span>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-sm mt-1 ${item.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      )}

                      {/* 파일 첨부 영역 */}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {item.fileName ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600 truncate max-w-[200px]">{item.fileName}</span>
                            <button
                              onClick={() => handleChecklistFileDownload(item.id, item.fileName)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              다운로드
                            </button>
                            <button
                              onClick={() => handleChecklistFileDelete(item.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              삭제
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              ref={el => fileRefs.current[item.id] = el}
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  handleChecklistFileUpload(item.id, e.target.files[0]);
                                }
                              }}
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileRefs.current[item.id]?.click()}
                              className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              파일 첨부
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeleteChecklist(item.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* 항목 추가 모달 */}
      {showAddModal && modalType === 'moveOutChecklist' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">퇴거 체크리스트 항목 추가</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={moveOutChecklistForm.category}
                  onChange={(e) => setMoveOutChecklistForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {MOVE_OUT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">항목명 *</label>
                <input
                  type="text"
                  value={moveOutChecklistForm.title}
                  onChange={(e) => setMoveOutChecklistForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="예: 관리실에 퇴거 통보"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={moveOutChecklistForm.description}
                  onChange={(e) => setMoveOutChecklistForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="상세 설명 (선택)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={moveOutChecklistForm.isRequired}
                  onChange={(e) => setMoveOutChecklistForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">필수 항목으로 표시</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateMoveOutChecklist}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting ? '저장 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CATEGORY_LABELS } from '../../lib/constants';
import { isImageFile, isPdfFile } from '../../lib/utils';

export default function TermsPage() {
  const {
    specialTerms, termsLoading, expandedCards, previewUrls,
    termFileInputRefs, toggleCard, handleTermFileUpload, handleTermFileDownload,
    handleDeleteSpecialTerm, handleToggleTermConfirm, openAddModal,
  } = useOutletContext();

  return (
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
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${term.isConfirmed ? 'bg-green-50' : 'bg-yellow-50'}`}
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
                        {term.fileName && <p className="text-xs text-blue-600 mt-0.5">{term.fileName}</p>}
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
                            <img src={previewUrls[termKey]} alt={term.fileName} className="w-full max-h-60 object-contain rounded-lg bg-gray-50 border border-gray-200" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">미리보기 로딩 중...</div>
                          )
                        ) : isPdfFile(term.fileName) ? (
                          previewUrls[termKey] ? (
                            <iframe src={previewUrls[termKey]} title={term.fileName} className="w-full h-60 rounded-lg border border-gray-200" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">PDF 로딩 중...</div>
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
  );
}

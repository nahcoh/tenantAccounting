import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { DOC_CATEGORY_LABELS, CONTRACT_PHASE_LABELS } from '../../lib/constants';
import { isImageFile, isPdfFile } from '../../lib/utils';

export default function DocumentsPage() {
  const {
    filteredDocuments, documentsLoading, expandedCards, previewUrls,
    fileInputRefs, toggleCard, handleFileUpload, handleFileDownload,
    handleDeleteDocumentFile, openAddModal,
  } = useOutletContext();

  const documents = filteredDocuments;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">입주 전 서류</h3>
        <span className="text-sm text-gray-500">
          {documents.filter(d => d.filePath).length}/{documents.length} 완료
        </span>
      </div>
      {documentsLoading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : documents.length === 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            <p className="text-3xl mb-2">📄</p>
            <p>등록된 서류가 없습니다.</p>
          </div>
          <button
            onClick={() => openAddModal('document')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            + 서류 추가하기
          </button>
        </>
      ) : (
        <>
          {documents.map(doc => {
            const docKey = `doc-${doc.id}`;
            const isExpanded = expandedCards[docKey];
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCard('doc', doc.id, doc.fileName, doc.filePath)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.filePath ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <span className="text-lg">{doc.filePath ? '✅' : '📋'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 mr-1">
                            {DOC_CATEGORY_LABELS[doc.category] || doc.category}
                          </span>
                          {doc.phase && (
                            <span className="px-1.5 py-0.5 bg-blue-50 rounded text-blue-600 mr-1">
                              {CONTRACT_PHASE_LABELS[doc.phase]}
                            </span>
                          )}
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR') : '미등록'}
                          {doc.isRequired && <span className="ml-2 text-red-500 font-medium">필수</span>}
                        </p>
                        {doc.fileName && <p className="text-xs text-blue-600 mt-0.5">{doc.fileName}</p>}
                      </div>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    {doc.filePath && (
                      <div className="mt-3 mb-3">
                        {isImageFile(doc.fileName) ? (
                          previewUrls[docKey] ? (
                            <img src={previewUrls[docKey]} alt={doc.fileName} className="w-full max-h-60 object-contain rounded-lg bg-gray-50 border border-gray-200" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">미리보기 로딩 중...</div>
                          )
                        ) : isPdfFile(doc.fileName) ? (
                          previewUrls[docKey] ? (
                            <iframe src={previewUrls[docKey]} title={doc.fileName} className="w-full h-60 rounded-lg border border-gray-200" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 text-gray-400 text-sm">PDF 로딩 중...</div>
                          )
                        ) : (
                          <div className="w-full h-40 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-4xl mb-2">📎</span>
                            <p className="text-sm text-gray-700 font-medium">첨부파일</p>
                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        ref={el => { fileInputRefs.current[doc.id] = el; }}
                        className="hidden"
                        onChange={e => {
                          if (e.target.files[0]) handleFileUpload(doc.id, e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); fileInputRefs.current[doc.id]?.click(); }}
                        className="flex-1 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        {doc.filePath ? '파일 변경' : '파일 첨부'}
                      </button>
                      {doc.filePath && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleFileDownload(doc.id, doc.fileName); }}
                          className="flex-1 py-2 px-3 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          다운로드
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDocumentFile(doc.id); }}
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
            onClick={() => openAddModal('document')}
            className="w-full p-4 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
          >
            + 서류 추가하기
          </button>
        </>
      )}
    </div>
  );
}

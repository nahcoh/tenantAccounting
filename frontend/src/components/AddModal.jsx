import React from 'react';
import { formatMoney, parseMoney } from '../lib/utils';

export default function AddModal({
  showAddModal, modalType, closeModal, submitting,
  contractForm, setContractForm, openDaumPostcode,
  handleCreateContract, handleUpdateContract, handleDeleteContract,
  docForm, setDocForm, docFileInputRef, handleCreateDocument,
  termForm, setTermForm, termFileInputRef, handleCreateSpecialTerm,
}) {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50" onClick={closeModal}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* 계약 등록 모달 */}
        {modalType === 'contract' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">계약 등록</h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <ContractFormFields
              contractForm={contractForm}
              setContractForm={setContractForm}
              openDaumPostcode={openDaumPostcode}
            />
            <button
              onClick={handleCreateContract}
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 mt-4"
            >
              {submitting ? '저장 중...' : '등록하기'}
            </button>
          </>
        )}

        {/* 계약 수정 모달 */}
        {modalType === 'editContract' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">계약 정보 수정</h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <ContractFormFields
              contractForm={contractForm}
              setContractForm={setContractForm}
              openDaumPostcode={openDaumPostcode}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdateContract}
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? '저장 중...' : '저장하기'}
              </button>
              <button
                onClick={handleDeleteContract}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </>
        )}

        {/* 서류 추가 모달 */}
        {modalType === 'document' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">서류 추가</h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">서류명 *</label>
                <input
                  type="text"
                  value={docForm.name}
                  onChange={e => setDocForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 임대차 계약서"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
                <select
                  value={docForm.category}
                  onChange={e => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CONTRACT">계약</option>
                  <option value="REGISTRATION">등기</option>
                  <option value="CHECKIN">전입</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={docForm.isRequired}
                  onChange={e => setDocForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">필수 서류</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  ref={docFileInputRef}
                  className="hidden"
                  onChange={e => {
                    if (e.target.files[0]) setDocForm(prev => ({ ...prev, file: e.target.files[0] }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => docFileInputRef.current?.click()}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  {docForm.file ? (
                    <span className="text-gray-900">{docForm.file.name}</span>
                  ) : (
                    <span className="text-gray-400">파일을 선택해주세요 (선택사항)</span>
                  )}
                </button>
                {docForm.file && (
                  <button
                    type="button"
                    onClick={() => {
                      setDocForm(prev => ({ ...prev, file: null }));
                      if (docFileInputRef.current) docFileInputRef.current.value = '';
                    }}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    첨부 취소
                  </button>
                )}
              </div>
              <button
                onClick={handleCreateDocument}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? '저장 중...' : '추가하기'}
              </button>
            </div>
          </>
        )}

        {/* 특약사항 추가 모달 */}
        {modalType === 'term' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">특약사항 추가</h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">분류</label>
                <select
                  value={termForm.category}
                  onChange={e => setTermForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="REPAIR">수리</option>
                  <option value="FACILITY">시설</option>
                  <option value="DEPOSIT">보증금</option>
                  <option value="OTHER">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
                <textarea
                  value={termForm.content}
                  onChange={e => setTermForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="특약사항 내용을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  ref={termFileInputRef}
                  className="hidden"
                  onChange={e => {
                    if (e.target.files[0]) setTermForm(prev => ({ ...prev, file: e.target.files[0] }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => termFileInputRef.current?.click()}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  {termForm.file ? (
                    <span className="text-gray-900">{termForm.file.name}</span>
                  ) : (
                    <span className="text-gray-400">파일을 선택해주세요 (선택사항)</span>
                  )}
                </button>
                {termForm.file && (
                  <button
                    type="button"
                    onClick={() => {
                      setTermForm(prev => ({ ...prev, file: null }));
                      if (termFileInputRef.current) termFileInputRef.current.value = '';
                    }}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    첨부 취소
                  </button>
                )}
              </div>
              <button
                onClick={handleCreateSpecialTerm}
                disabled={submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {submitting ? '저장 중...' : '추가하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContractFormFields({ contractForm, setContractForm, openDaumPostcode }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">계약 유형</label>
        <select
          value={contractForm.type}
          onChange={e => setContractForm(prev => ({ ...prev, type: e.target.value }))}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="JEONSE">전세</option>
          <option value="MONTHLY">월세</option>
          <option value="SEMI_JEONSE">반전세</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={contractForm.address}
            readOnly
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 cursor-pointer"
            placeholder="주소 검색을 눌러주세요"
            onClick={openDaumPostcode}
          />
          <button
            type="button"
            onClick={openDaumPostcode}
            className="px-4 py-2.5 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            주소 검색
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
        <input
          type="text"
          value={contractForm.addressDetail}
          onChange={e => setContractForm(prev => ({ ...prev, addressDetail: e.target.value }))}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="동/호수 입력"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">보증금 (원)</label>
        <input
          type="text"
          inputMode="numeric"
          value={formatMoney(contractForm.jeonseDeposit)}
          onChange={e => setContractForm(prev => ({ ...prev, jeonseDeposit: parseMoney(e.target.value) }))}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
      {(contractForm.type === 'MONTHLY' || contractForm.type === 'SEMI_JEONSE') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">월세 (원)</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatMoney(contractForm.monthlyRent)}
            onChange={e => setContractForm(prev => ({ ...prev, monthlyRent: parseMoney(e.target.value) }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">관리비 (원)</label>
        <input
          type="text"
          inputMode="numeric"
          value={formatMoney(contractForm.maintenanceFee)}
          onChange={e => setContractForm(prev => ({ ...prev, maintenanceFee: parseMoney(e.target.value) }))}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
          <input
            type="date"
            value={contractForm.startDate}
            onChange={e => setContractForm(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료일 *</label>
          <input
            type="date"
            value={contractForm.endDate}
            onChange={e => setContractForm(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

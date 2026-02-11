import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { CONTRACT_TYPE_LABELS, CONTRACT_PHASES } from '../../lib/constants';
import KakaoMap from '../../components/KakaoMap';

const TABS = [
  { id: 'documents', label: '📄 서류 관리' },
  { id: 'terms', label: '📝 특약 사항' },
  { id: 'checklist', label: '✅ 체크리스트' },
];

export default function BeforeLayout() {
  const ctx = useOutletContext();
  const { contract, contractLoading, openAddModal, openEditContractModal, selectedPhase, setSelectedPhase } = ctx;

  if (contractLoading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">불러오는 중...</div>;
  }

  if (!contract) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">계약 정보를 먼저 등록해주세요</h3>
        <p className="text-sm text-gray-500 mb-6">입주 전 서류와 특약사항을 관리하려면 계약 정보가 필요합니다.</p>
        <button
          onClick={() => openAddModal('contract')}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          계약 등록하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 계약 요약 카드 */}
      <div className={`rounded-2xl p-5 text-white ${
        contract.type === 'JEONSE' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
        contract.type === 'MONTHLY' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
        'bg-gradient-to-r from-purple-500 to-pink-500'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`text-sm ${
            contract.type === 'JEONSE' ? 'text-blue-100' :
            contract.type === 'MONTHLY' ? 'text-orange-100' :
            'text-purple-100'
          }`}>내 계약</p>
          <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-medium">
            {CONTRACT_TYPE_LABELS[contract.type]}
          </span>
        </div>
        <p className="font-semibold text-lg mb-1">{contract.address}</p>
        <p className={`text-sm ${
          contract.type === 'JEONSE' ? 'text-blue-100' :
          contract.type === 'MONTHLY' ? 'text-orange-100' :
          'text-purple-100'
        }`}>
          {contract.startDate} ~ {contract.endDate}
        </p>
        {contract.jeonseDeposit && (
          <p className="text-white text-sm mt-1">보증금: {Number(contract.jeonseDeposit).toLocaleString()}원</p>
        )}
        {contract.monthlyRent && (
          <p className="text-white text-sm">월세: {Number(contract.monthlyRent).toLocaleString()}원</p>
        )}
        <button
          onClick={openEditContractModal}
          className="mt-3 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
        >
          계약 정보 수정
        </button>
      </div>

      {/* 지도 */}
      {contract.address && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <KakaoMap address={contract.address} className="h-48" />
        </div>
      )}

      {/* 단계 필터 탭 */}
      <div className="bg-white rounded-xl border border-gray-100 p-1 flex gap-1 overflow-x-auto">
        {CONTRACT_PHASES.map(phase => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(phase.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedPhase === phase.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {phase.icon && <span className="mr-1">{phase.icon}</span>}
            {phase.label}
          </button>
        ))}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <NavLink
            key={tab.id}
            to={`/before/${tab.id}`}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={ctx} />
    </div>
  );
}

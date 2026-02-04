import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { CONTRACT_TYPE_LABELS } from '../../lib/constants';
import KakaoMap from '../../components/KakaoMap';

const TABS = [
  { id: 'documents', label: '📄 서류 관리' },
  { id: 'terms', label: '📝 특약 사항' },
];

const CONTRACT_TYPE_STYLES = {
  JEONSE: {
    gradient: 'from-blue-500 to-cyan-500',
    subtext: 'text-blue-100',
  },
  MONTHLY: {
    gradient: 'from-orange-500 to-amber-500',
    subtext: 'text-orange-100',
  },
  SEMI_JEONSE: {
    gradient: 'from-purple-500 to-pink-500',
    subtext: 'text-purple-100',
  },
};

export default function BeforeLayout() {
  const ctx = useOutletContext();
  const { contract, contractLoading, openAddModal, openEditContractModal } = ctx;

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
      <div className={`bg-gradient-to-r ${CONTRACT_TYPE_STYLES[contract.type]?.gradient || 'from-blue-500 to-cyan-500'} rounded-2xl p-5 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <p className={`${CONTRACT_TYPE_STYLES[contract.type]?.subtext || 'text-blue-100'} text-sm`}>내 계약</p>
          <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-medium">
            {CONTRACT_TYPE_LABELS[contract.type]}
          </span>
        </div>
        <p className="font-semibold text-lg mb-1">{contract.address}</p>
        <p className={`${CONTRACT_TYPE_STYLES[contract.type]?.subtext || 'text-blue-100'} text-sm`}>
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
      <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: '200px' }}>
        <KakaoMap address={contract.address} />
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

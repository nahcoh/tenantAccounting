import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PHASES } from '../lib/constants';
import useContract from '../hooks/useContract';
import AddModal from './AddModal';
import api from '../api';

export default function AppLayout() {
  const navigate = useNavigate();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState('USER');
  const location = useLocation();
  const contractData = useContract();
  const currentPhase = PHASES.find((phase) => location.pathname.startsWith(`/${phase.id}`))
    || PHASES.find((phase) => phase.id === 'cost')
    || PHASES[0];

  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserName(response.data.name || null);
        setUserRole(response.data.role || 'USER');
      } catch {
        setUserName(null);
        setUserRole('USER');
      }
    };

    loadMe();
  }, []);

  useEffect(() => {
    setShowPhaseMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      navigate('/auth');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      await api.delete('/users/me');
      navigate('/auth');
    } catch (err) {
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏠</div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {userName ? `환영합니다, ${userName}님!` : '내 집 기록'}
                </h1>
                <p className="text-sm text-gray-500">세입자 주거 관리</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <NavLink
                to="/support/inquiry"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                문의하기
              </NavLink>
              {userRole === 'ADMIN' && (
                <NavLink
                  to="/admin/inquiries"
                  className="px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                >
                  운영진 문의함
                </NavLink>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-t-lg font-medium"
                    >
                      로그아웃
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg font-medium border-t border-gray-100"
                    >
                      회원 탈퇴
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium bg-white text-gray-900 shadow-sm whitespace-nowrap">
              <span>{currentPhase.icon}</span>
              <span>{currentPhase.label}</span>
            </div>
            <button
              onClick={() => setShowPhaseMenu(true)}
              className="px-3 py-3 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all"
              aria-label="카테고리 메뉴 열기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet context={contractData} />
      </main>

      {showPhaseMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setShowPhaseMenu(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">카테고리 이동</h3>
              <button
                onClick={() => setShowPhaseMenu(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {PHASES.map((phase) => {
                const isActive = location.pathname.startsWith(`/${phase.id}`);
                return (
                  <NavLink
                    key={phase.id}
                    to={`/${phase.id}/${phase.defaultTab}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{phase.icon}</span>
                    <span>{phase.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AddModal
        showAddModal={contractData.showAddModal}
        modalType={contractData.modalType}
        closeModal={contractData.closeModal}
        submitting={contractData.submitting}
        contractForm={contractData.contractForm}
        setContractForm={contractData.setContractForm}
        openDaumPostcode={contractData.openDaumPostcode}
        handleCreateContract={contractData.handleCreateContract}
        handleUpdateContract={contractData.handleUpdateContract}
        handleDeleteContract={contractData.handleDeleteContract}
        docForm={contractData.docForm}
        setDocForm={contractData.setDocForm}
        docFileInputRef={contractData.docFileInputRef}
        handleCreateDocument={contractData.handleCreateDocument}
        termForm={contractData.termForm}
        setTermForm={contractData.setTermForm}
        termFileInputRef={contractData.termFileInputRef}
        handleCreateSpecialTerm={contractData.handleCreateSpecialTerm}
        checklistForm={contractData.checklistForm}
        setChecklistForm={contractData.setChecklistForm}
        handleCreateChecklist={contractData.handleCreateChecklist}
        maintenanceForm={contractData.maintenanceForm}
        setMaintenanceForm={contractData.setMaintenanceForm}
        handleCreateMaintenance={contractData.handleCreateMaintenance}
        handleUpdateMaintenance={contractData.handleUpdateMaintenance}
        editingMaintenanceId={contractData.editingMaintenanceId}
      />
    </div>
  );
}

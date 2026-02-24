import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PHASES } from '../lib/constants';
import useContract from '../hooks/useContract';
import AddModal from './AddModal';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout() {
  const navigate = useNavigate();
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);
  const location = useLocation();
  const contractData = useContract();
  const { user, clearAuth } = useAuth();

  useEffect(() => {
    setShowPhaseMenu(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuth();
      setShowPhaseMenu(false);
      navigate('/auth');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      await api.delete('/users/me');
      clearAuth();
      setShowPhaseMenu(false);
      navigate('/auth');
    } catch (err) {
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
      console.error('Failed to delete account:', err);
    }
  };

  const userName = user?.name || null;
  const userRole = user?.role || 'USER';
  const userProvider = user?.provider || 'local';
  const userProfileImage = user?.profileImage || '';
  const providerLabel = userProvider === 'google' ? 'Google' : userProvider === 'kakao' ? 'Kakao' : 'User';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                {userProfileImage ? (
                  <img
                    src={userProfileImage}
                    alt={`${providerLabel} profile`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-gray-700"
                  onClick={() => navigate('/cost/calendar')}
                >
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
              <button
                onClick={() => setShowPhaseMenu(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                aria-label="메뉴 열기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
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
              <h3 className="text-lg font-semibold text-gray-900">메뉴</h3>
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
              <NavLink
                to="/support/inquiry"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                <span className="text-lg">💬</span>
                <span>문의하기</span>
              </NavLink>
              {userRole === 'ADMIN' && (
                <NavLink
                  to="/admin/inquiries"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  <span className="text-lg">📥</span>
                  <span>운영진 문의함</span>
                </NavLink>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium"
              >
                로그아웃
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium"
              >
                회원 탈퇴
              </button>
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
